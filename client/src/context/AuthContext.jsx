import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  updateProfile as firebaseUpdateProfile 
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { syncFirebaseUser, fetchMe } from "../utils/api";

const AuthContext = createContext(null);

const TOKEN_KEY = "healthai_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // Local DB user object
  const [firebaseUser, setFirebaseUser] = useState(null); // Firebase auth object
  const [authLoading, setAuthLoading] = useState(true);

  /**
   * Syncs the Firebase identity with the local SQLite backend.
   * Ensures history and profile settings are consistent.
   */
  const syncWithBackend = useCallback(async (fUser) => {
    if (!fUser) return null;
    
    try {
      // Get fresh ID token from Firebase
      const token = await fUser.getIdToken(true);
      
      // Persist to localStorage so the API interceptor can use it
      localStorage.setItem(TOKEN_KEY, token);
      
      // Call backend to ensure user exists in SQLite
      const { user: dbUser } = await syncFirebaseUser();
      setUser(dbUser);
      return dbUser;
    } catch (err) {
      console.error("Backend sync failed:", err.message);
      // Even if sync fails, we have the Firebase identity, 
      // but apps features like 'History' might be degraded.
      return null;
    }
  }, []);

  // Listen for Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
      setFirebaseUser(fUser);
      
      if (fUser) {
        await syncWithBackend(fUser);
      } else {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
      }
      
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [syncWithBackend]);

  /**
   * Email/Password Login
   */
  const login = useCallback(async ({ email, password }) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return await syncWithBackend(result.user);
  }, [syncWithBackend]);

  /**
   * Email/Password Registration
   */
  const register = useCallback(async ({ email, username, password }) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Set display name in Firebase if provided
    if (username) {
      await firebaseUpdateProfile(result.user, { displayName: username });
    }
    
    return await syncWithBackend(result.user);
  }, [syncWithBackend]);

  /**
   * Google One-Tap / Popup Login
   */
  const loginWithGoogle = useCallback(async () => {
    const result = await signInWithPopup(auth, googleProvider);
    return await syncWithBackend(result.user);
  }, [syncWithBackend]);

  /**
   * Logout
   */
  const logout = useCallback(async () => {
    await signOut(auth);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("healthai_history");
    setUser(null);
    setFirebaseUser(null);
  }, []);

  /**
   * Refresh local user data from backend
   */
  const refreshUser = useCallback(async () => {
    try {
      const { user: usr } = await fetchMe();
      setUser(usr);
    } catch (err) {
      console.error("Failed to refresh user profile:", err);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      firebaseUser, 
      authLoading, 
      login, 
      register, 
      loginWithGoogle, 
      logout, 
      refreshUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
