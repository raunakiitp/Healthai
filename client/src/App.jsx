import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import SymptomPanel from "./components/SymptomPanel";
import ResultsDashboard from "./components/ResultsDashboard";
import AIExplanation from "./components/AIExplanation";
import MapSection from "./components/MapSection";
import DoctorAvatar from "./components/DoctorAvatar";
import LoadingScanner from "./components/LoadingScanner";
import HistoryPanel from "./components/HistoryPanel";
import Disclaimer from "./components/Disclaimer";
import AuthModal from "./components/AuthModal";
import ProfilePanel from "./components/ProfilePanel";
import AdminDashboard from "./components/AdminDashboard";

import { analyzeSymptoms, getSampleCase } from "./utils/api";
import { useHistory } from "./hooks/useHistory";
import { useAuth } from "./context/AuthContext";

const DEFAULT_FORM = {
  symptoms: [],
  severity: 5,
  duration: "",
  age: "",
  gender: "",
  freeText: "",
};

function useLocalDarkMode() {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem("healthai_dark");
    if (stored !== null) return stored === "true";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("healthai_dark", String(dark));
  }, [dark]);
  return [dark, () => setDark((d) => !d)];
}

// Toast notification
function Toast({ message, type = "success", onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);
  const colors = {
    success: "from-blue-500 to-teal-500 shadow-blue-500/30",
    admin: "from-red-500 to-rose-500 shadow-red-500/30",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: -40, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -40, scale: 0.92 }}
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-xl bg-gradient-to-r ${colors[type] || colors.success} text-white text-sm font-semibold shadow-xl flex items-center gap-2 whitespace-nowrap`}
    >
      {message}
    </motion.div>
  );
}

export default function App() {
  const [darkMode, toggleDark] = useLocalDarkMode();
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [avatarStatus, setAvatarStatus] = useState("idle");
  const [toast, setToast] = useState(null); // { message, type }

  const { user, authLoading } = useAuth();
  const { history, saveEntry, deleteEntry, clearHistory } = useHistory();

  // Welcome toast — fires once when user is resolved after login
  const prevUserRef = useRef(null);
  useEffect(() => {
    if (authLoading) return;
    if (user && prevUserRef.current === null) {
      const isAdmin = user.role === "admin";
      setToast({
        message: isAdmin ? `👑 Welcome, ${user.username}! Admin access granted.` : `🎉 Welcome back, ${user.username}!`,
        type: isAdmin ? "admin" : "success",
      });
    }
    prevUserRef.current = user;
  }, [user, authLoading]);

  const updateForm = useCallback((updates) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleAnalyze = useCallback(
    async (extra = {}) => {
      const payload = { ...formData, ...extra };
      if (
        (payload.symptoms?.length === 0 || !payload.symptoms) &&
        (!payload.freeText || !payload.freeText.trim())
      ) {
        setError("Please describe your symptoms or select at least one from the list.");
        return;
      }
      setIsLoading(true);
      setError(null);
      setShowResults(false);
      setAvatarStatus("analyzing");
      setTimeout(() => {
        document.getElementById("analysis-section")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
      try {
        const data = await analyzeSymptoms({
          symptoms: payload.symptoms || [],
          severity: payload.severity || 5,
          duration: payload.duration || "",
          age: payload.age || "",
          gender: payload.gender || "",
          freeText: payload.freeText || "",
        });
        setResult(data);
        setShowResults(true);
        setAvatarStatus("complete");
        await saveEntry({ input: payload, result: data });
        setTimeout(() => {
          document.getElementById("results-dashboard")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 300);
      } catch (err) {
        console.error(err);
        setError(
          err?.response?.data?.error ||
            "Failed to connect to the AI service. Please check that the server is running and your Gemini API key is set."
        );
        setAvatarStatus("idle");
      } finally {
        setIsLoading(false);
      }
    },
    [formData, saveEntry]
  );

  const handleLoadSample = useCallback(async () => {
    try {
      const sample = await getSampleCase();
      setFormData((prev) => ({ ...prev, ...sample }));
      setError(null);
      setTimeout(() => {
        document.getElementById("symptom-panel")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch {
      setFormData({
        symptoms: ["Fever", "Headache", "Body Aches", "Fatigue"],
        severity: 6,
        duration: "2 days",
        age: "28",
        gender: "female",
        freeText: "Mild chills and sore throat",
      });
    }
  }, []);

  const handleRestore = useCallback((entry) => {
    setFormData(entry.input || DEFAULT_FORM);
    setResult(entry.result || null);
    setShowResults(!!entry.result);
    if (entry.result) setAvatarStatus("complete");
  }, []);

  const handleNewAnalysis = () => {
    setFormData(DEFAULT_FORM);
    setResult(null);
    setShowResults(false);
    setAvatarStatus("idle");
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen gradient-mesh transition-colors duration-300">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast key="toast" message={toast.message} type={toast.type} onDone={() => setToast(null)} />
        )}
      </AnimatePresence>

      <Navbar
        darkMode={darkMode}
        onToggleDark={toggleDark}
        onOpenHistory={() => setShowHistory(true)}
        historyCount={history.length}
        onOpenAuth={() => setShowAuth(true)}
        onOpenProfile={() => setShowProfile(true)}
        onOpenAdmin={() => setShowAdmin(true)}
      />

      {/* Main layout */}
      <div className="relative">
        {/* Sticky doctor avatar (desktop) */}
        <div className="hidden lg:block fixed right-6 top-1/2 -translate-y-1/2 z-20 w-40">
          <DoctorAvatar status={avatarStatus} />
        </div>

        <Hero onAnalyze={handleAnalyze} onLoadSample={handleLoadSample} isLoading={isLoading} />

        <SymptomPanel
          formData={formData}
          onChange={updateForm}
          onAnalyze={handleAnalyze}
          isLoading={isLoading}
        />

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto px-4 sm:px-6 mb-6"
            >
              <div className="glass-card p-4 border-l-4 border-red-400 flex items-start gap-3 text-red-600 dark:text-red-400">
                <span className="text-xl flex-shrink-0">⚠️</span>
                <div>
                  <p className="font-semibold text-sm">Analysis Error</p>
                  <p className="text-sm mt-0.5 opacity-80">{error}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div id="analysis-section">
          <AnimatePresence mode="wait">
            {isLoading && <LoadingScanner key="loader" />}
          </AnimatePresence>
          <ResultsDashboard result={result} isVisible={showResults && !isLoading} />
          <AIExplanation result={result} isVisible={showResults && !isLoading} />
        </div>

        <AnimatePresence>
          {showResults && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-6 pb-12 px-4"
            >
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleNewAnalysis}
                id="new-analysis-btn"
                className="btn-ghost inline-flex items-center gap-2 px-8 py-3"
              >
                🔄 Start New Analysis
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <MapSection isVisible={true} />

        <footer className="text-center py-10 px-4 border-t border-gray-100 dark:border-gray-800/40">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            © 2025 HealthAI · Built with{" "}
            <span className="gradient-text font-semibold">Google Gemini</span> · Not a medical service
          </p>
          {!user && (
            <button
              onClick={() => setShowAuth(true)}
              className="mt-2 text-xs text-blue-400 hover:text-blue-500 underline transition-colors"
            >
              Sign in to sync your history across devices →
            </button>
          )}
        </footer>
      </div>

      {/* Overlays */}
      <HistoryPanel
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        history={history}
        onRestore={handleRestore}
        onDelete={deleteEntry}
        onClear={clearHistory}
      />
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
      <ProfilePanel isOpen={showProfile} onClose={() => setShowProfile(false)} />
      <AdminDashboard isOpen={showAdmin} onClose={() => setShowAdmin(false)} />
      <Disclaimer />
    </div>
  );
}
