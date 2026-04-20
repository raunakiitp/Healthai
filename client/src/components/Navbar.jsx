import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, Activity, History, Menu, X, LogIn, Shield, Crown } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { AvatarCircle } from "./ProfilePanel";

export default function Navbar({ darkMode, onToggleDark, onOpenHistory, historyCount, onOpenAuth, onOpenProfile, onOpenAdmin }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      role="navigation"
      aria-label="Main navigation"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-black/60 backdrop-blur-xl border-b border-white/10 py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Logo */}
        <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.02 }}>
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-lg">
            <Activity className="w-5 h-5 text-black" strokeWidth={2.5} />
          </div>
          <div>
            <span className="font-bold text-xl text-white">HealthAI</span>
            <div className="text-[0.6rem] font-medium text-zinc-500 uppercase tracking-widest leading-none">
              Smart Symptom Assistant
            </div>
          </div>
        </motion.div>

        {/* Desktop actions */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Admin button — only for admins */}
          {isAdmin && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenAdmin}
              id="nav-admin-btn"
              aria-label="Open admin dashboard"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 text-white text-sm font-semibold border border-white/20 hover:bg-white/20 transition-all"
            >
              <Shield className="w-4 h-4" aria-hidden="true" />
              Admin
            </motion.button>
          )}

          {/* History */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenHistory}
            className="flex items-center gap-2 text-sm relative text-zinc-300 hover:text-white px-3 py-2 rounded-xl hover:bg-white/5 transition-colors"
            id="nav-history-btn"
            aria-label={`View analysis history${historyCount > 0 ? `, ${historyCount} item${historyCount > 1 ? 's' : ''}` : ''}`}
          >
            <History className="w-4 h-4" aria-hidden="true" />
            History
            {historyCount > 0 && (
              <span aria-hidden="true" className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white text-black text-[0.6rem] font-bold rounded-full flex items-center justify-center">
                {historyCount > 9 ? "9+" : historyCount}
              </span>
            )}
          </motion.button>

          {/* Auth */}
          {user ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenProfile}
              id="nav-profile-btn"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              <AvatarCircle user={user} size="sm" />
              <span className="max-w-[100px] truncate font-medium">{user.username}</span>
              {isAdmin && <Crown className="w-3.5 h-3.5 text-zinc-400" />}
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenAuth}
              id="nav-signin-btn"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black text-sm font-semibold shadow-lg hover:bg-zinc-200 transition-all"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </motion.button>
          )}

          {/* Dark mode */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 20 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggleDark}
            id="dark-mode-toggle"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            aria-pressed={darkMode}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={darkMode ? "moon" : "sun"}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {darkMode ? <Sun className="w-5 h-5" aria-hidden="true" /> : <Moon className="w-5 h-5" aria-hidden="true" />}
              </motion.div>
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden p-2 rounded-lg text-zinc-400 hover:text-white"
          onClick={() => setMobileMenu(!mobileMenu)}
          aria-label={mobileMenu ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenu}
          aria-controls="mobile-menu"
        >
          {mobileMenu ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenu && (
          <motion.div
            id="mobile-menu"
            role="menu"
            aria-label="Mobile navigation menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="sm:hidden bg-black/90 backdrop-blur-xl border-t border-white/10 px-4 py-4 flex flex-col gap-3"
          >
            {isAdmin && (
              <button onClick={() => { onOpenAdmin(); setMobileMenu(false); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-semibold justify-center">
                <Shield className="w-4 h-4" /> Admin Panel
              </button>
            )}
            <button onClick={() => { onOpenHistory(); setMobileMenu(false); }}
              className="flex items-center gap-2 text-sm w-full justify-center text-zinc-300 py-2 hover:bg-white/5 rounded-xl">
              <History className="w-4 h-4" /> History {historyCount > 0 && `(${historyCount})`}
            </button>
            {user ? (
              <button onClick={() => { onOpenProfile(); setMobileMenu(false); }}
                className="flex items-center gap-2 text-sm w-full justify-center text-zinc-300 py-2 hover:bg-white/5 rounded-xl">
                <AvatarCircle user={user} size="sm" />
                {user.username} {isAdmin && <Crown className="w-3.5 h-3.5 text-zinc-400" />}
              </button>
            ) : (
              <button onClick={() => { onOpenAuth(); setMobileMenu(false); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black text-sm font-semibold justify-center">
                <LogIn className="w-4 h-4" /> Sign In
              </button>
            )}
            <button onClick={onToggleDark}
              className="flex items-center gap-2 text-sm w-full justify-center text-zinc-300 py-2 hover:bg-white/5 rounded-xl">
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {darkMode ? "Light Mode" : "Dark Mode"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
