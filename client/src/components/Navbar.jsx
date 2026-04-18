import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, Activity, History, Menu, X, LogIn, Shield } from "lucide-react";
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass border-b border-white/20 py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Logo */}
        <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.02 }}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center shadow-lg">
            <Activity className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <span className="font-bold text-xl gradient-text">HealthAI</span>
            <div className="text-[0.6rem] font-medium text-gray-400 uppercase tracking-widest leading-none">
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
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white text-sm font-semibold shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all"
            >
              <Shield className="w-4 h-4" />
              Admin
            </motion.button>
          )}

          {/* History */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenHistory}
            className="btn-ghost flex items-center gap-2 text-sm relative"
            id="nav-history-btn"
          >
            <History className="w-4 h-4" />
            History
            {historyCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-blue-500 text-white text-[0.6rem] font-bold rounded-full flex items-center justify-center">
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
              className="flex items-center gap-2 btn-ghost text-sm"
            >
              <AvatarCircle user={user} size="sm" />
              <span className="max-w-[100px] truncate font-medium">{user.username}</span>
              {isAdmin && <span className="text-amber-500 text-xs">👑</span>}
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenAuth}
              id="nav-signin-btn"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-teal-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
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
            className="w-10 h-10 rounded-xl neuro flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={darkMode ? "moon" : "sun"}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </motion.div>
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Mobile hamburger */}
        <button className="sm:hidden p-2 rounded-lg text-gray-500" onClick={() => setMobileMenu(!mobileMenu)}>
          {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenu && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="sm:hidden glass border-t border-white/10 px-4 py-4 flex flex-col gap-3"
          >
            {isAdmin && (
              <button onClick={() => { onOpenAdmin(); setMobileMenu(false); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white text-sm font-semibold justify-center">
                <Shield className="w-4 h-4" /> Admin Panel
              </button>
            )}
            <button onClick={() => { onOpenHistory(); setMobileMenu(false); }}
              className="btn-ghost flex items-center gap-2 text-sm w-full justify-center">
              <History className="w-4 h-4" /> History {historyCount > 0 && `(${historyCount})`}
            </button>
            {user ? (
              <button onClick={() => { onOpenProfile(); setMobileMenu(false); }}
                className="btn-ghost flex items-center gap-2 text-sm w-full justify-center">
                <AvatarCircle user={user} size="sm" />
                {user.username} {isAdmin && "👑"}
              </button>
            ) : (
              <button onClick={() => { onOpenAuth(); setMobileMenu(false); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-teal-500 text-white text-sm font-semibold justify-center">
                <LogIn className="w-4 h-4" /> Sign In
              </button>
            )}
            <button onClick={onToggleDark}
              className="btn-ghost flex items-center gap-2 text-sm w-full justify-center">
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {darkMode ? "Light Mode" : "Dark Mode"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
