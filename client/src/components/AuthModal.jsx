import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, Eye, EyeOff, Loader, Activity } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AuthModal({ isOpen, onClose }) {
  const { login, register, loginWithGoogle } = useAuth();
  const [tab, setTab] = useState("login"); // "login" | "register"
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({ email: "", username: "", password: "" });

  const updateForm = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (tab === "login") {
        await login({ email: form.email, password: form.password });
      } else {
        await register({ email: form.email, username: form.username, password: form.password });
      }
      setSuccess(tab === "login" ? "Welcome back!" : "Account created! Welcome!");
      setTimeout(() => {
        setSuccess("");
        onClose();
      }, 1200);
    } catch (err) {
      // Firebase error codes are often in err.code or err.message
      const msg = err.code ? `Firebase: ${err.code}` : (err?.response?.data?.error || err.message || "Something went wrong.");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle();
      setSuccess("Successfully signed in with Google!");
      setTimeout(() => {
        setSuccess("");
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.message || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (t) => {
    setTab(t);
    setError("");
    setForm({ email: "", username: "", password: "" });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="auth-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            key="auth-modal"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-md"
              role="dialog"
              aria-modal="true"
              aria-labelledby="auth-modal-title"
              aria-describedby="auth-modal-desc"
            >
              <div className="relative bg-black rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
                
                {/* Header separator */}
                <div className="h-1 w-full bg-white/10" />

                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-lg">
                      <Activity aria-hidden="true" className="w-5 h-5 text-black" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h2 id="auth-modal-title" className="font-bold text-white text-lg leading-tight">HealthAI</h2>
                      <p id="auth-modal-desc" className="text-xs text-zinc-300 leading-none">Smart Symptom Assistant</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/10 transition-colors"
                    id="auth-modal-close"
                    aria-label="Close sign in dialog"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="px-6 mb-6">
                  <div className="relative flex rounded-xl bg-white/5 border border-white/5 p-1 gap-1">
                    {["login", "register"].map((t) => (
                      <button
                        key={t}
                        onClick={() => switchTab(t)}
                        id={`auth-tab-${t}`}
                        role="tab"
                        aria-selected={tab === t}
                        aria-controls={`auth-panel-${t}`}
                        className={`relative flex-1 py-2 text-sm font-bold rounded-lg transition-colors duration-200 z-10 outline-none focus-visible:ring-2 focus-visible:ring-white ${
                          tab === t
                            ? "text-black"
                            : "text-zinc-500 hover:text-zinc-300 focus-visible:text-white"
                        }`}
                      >
                        {tab === t && (
                          <motion.div
                            layoutId="auth-tab-bg"
                            className="absolute inset-0 rounded-lg bg-white shadow-md"
                            transition={{ type: "spring", damping: 25, stiffness: 350 }}
                          />
                        )}
                        <span className="relative z-10">
                          {t === "login" ? "Sign In" : "Register"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form */}
                <form
                  onSubmit={handleSubmit}
                  id={`auth-panel-${tab}`}
                  role="tabpanel"
                  aria-labelledby={`auth-tab-${tab}`}
                  className="px-6 pb-6 space-y-4"
                >
                  <AnimatePresence mode="wait">
                    {tab === "register" && (
                      <motion.div
                        key="username-field"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <label className="block text-[10px] font-semibold text-zinc-500 mb-1.5 uppercase tracking-widest">
                          Display Name
                        </label>
                        <div className="relative">
                          <User aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                          <input
                            type="text"
                            id="auth-username"
                            value={form.username}
                            onChange={(e) => updateForm("username", e.target.value)}
                            placeholder="Your name"
                            className={inputClass}
                            required={tab === "register"}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Email */}
                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-500 mb-1.5 uppercase tracking-widest">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type="email"
                        id="auth-email"
                        value={form.email}
                        onChange={(e) => updateForm("email", e.target.value)}
                        placeholder="you@example.com"
                        className={inputClass}
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-500 mb-1.5 uppercase tracking-widest">
                      Password
                    </label>
                    <div className="relative">
                      <Lock aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type={showPass ? "text" : "password"}
                        id="auth-password"
                        value={form.password}
                        onChange={(e) => updateForm("password", e.target.value)}
                        placeholder={tab === "register" ? "At least 6 characters" : "Your password"}
                        className="w-full pl-10 pr-12 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/50 transition-all focus:bg-white/10"
                        required
                        minLength={tab === "register" ? 6 : undefined}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:rounded-md"
                        aria-label={showPass ? "Hide password" : "Show password"}
                      >
                        {showPass ? <EyeOff aria-hidden="true" className="w-4 h-4" /> : <Eye aria-hidden="true" className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Error / Success */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        role="alert"
                        aria-live="assertive"
                        id="auth-error-msg"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2 p-3 rounded-xl bg-red-950/40 border border-red-500/20 text-red-400 text-sm"
                      >
                        <span aria-hidden="true" className="text-red-500">⚠</span>
                        {error}
                      </motion.div>
                    )}
                    {success && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2 p-3 rounded-xl bg-white/10 border border-white/20 text-white text-sm"
                      >
                        <span className="text-white">✓</span>
                        {success}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    id="auth-submit-btn"
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    className="w-full py-3 rounded-xl bg-white text-black font-semibold text-sm shadow-lg hover:bg-zinc-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white focus-visible:ring-offset-black"
                  >
                    {loading ? (
                      <>
                        <Loader aria-hidden="true" className="w-4 h-4 animate-spin text-black" />
                        {tab === "login" ? "Signing in..." : "Creating account..."}
                      </>
                    ) : (
                      tab === "login" ? "Sign In to HealthAI" : "Create My Account"
                    )}
                  </motion.button>

                  <motion.button
                    type="button"
                    id="auth-google-btn"
                    disabled={loading}
                    onClick={handleGoogleLogin}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    className="w-full py-3 rounded-xl border border-white/10 bg-white/5 text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-white/10 transition-all disabled:opacity-60 outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" className="w-4 h-4" />
                    {tab === "login" ? "Sign in with Google" : "Sign up with Google"}
                  </motion.button>

                  {/* Guest divider */}
                  <div className="relative flex items-center gap-3">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-[10px] uppercase tracking-widest text-zinc-600">or</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>

                  <button
                    type="button"
                    id="auth-guest-btn"
                    onClick={onClose}
                    className="w-full py-2.5 rounded-xl border border-white/10 text-zinc-400 text-sm font-semibold hover:bg-white/5 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    Continue as Guest
                  </button>

                  <p className="text-center text-xs text-zinc-500 pb-1">
                    {tab === "login" ? (
                      <>No account? <button type="button" onClick={() => switchTab("register")} className="text-white hover:underline font-bold ml-1">Register free</button></>
                    ) : (
                      <>Already have an account? <button type="button" onClick={() => switchTab("login")} className="text-white hover:underline font-bold ml-1">Sign in</button></>
                    )}
                  </p>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
