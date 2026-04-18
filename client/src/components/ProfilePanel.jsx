import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, User, Mail, Calendar, Shield, LogOut, Save,
  BarChart2, TrendingDown, TrendingUp, Minus, Loader,
  KeyRound, CheckCircle, ChevronRight
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { updateProfile, changePassword, fetchHistoryStats } from "../utils/api";

const PALETTE = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f97316",
  "#10b981", "#06b6d4", "#3b82f6", "#f59e0b",
  "#ef4444", "#84cc16",
];

function AvatarCircle({ user, size = "lg" }) {
  const letter = (user?.username || user?.email || "?")[0].toUpperCase();
  const color = user?.avatar_color || "#6366f1";
  const sz = size === "lg" ? "w-20 h-20 text-2xl" : "w-9 h-9 text-sm";
  return (
    <div
      className={`${sz} rounded-full flex items-center justify-center font-bold text-white shadow-lg flex-shrink-0`}
      style={{ background: `radial-gradient(circle at 35% 35%, ${color}dd, ${color}88)`, boxShadow: `0 0 20px ${color}55` }}
    >
      {letter}
    </div>
  );
}

export { AvatarCircle };

export default function ProfilePanel({ isOpen, onClose }) {
  const { user, logout, refreshUser } = useAuth();

  // Edit profile state
  const [username, setUsername] = useState(user?.username || "");
  const [avatarColor, setAvatarColor] = useState(user?.avatar_color || "#6366f1");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  // Change password state
  const [showPwSection, setShowPwSection] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState("");
  const [pwError, setPwError] = useState("");

  // Stats
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Sync form when user changes
  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setAvatarColor(user.avatar_color || "#6366f1");
    }
  }, [user]);

  // Load stats when panel opens
  useEffect(() => {
    if (!isOpen || !user) return;
    setStatsLoading(true);
    fetchHistoryStats()
      .then((s) => setStats(s))
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));
  }, [isOpen, user]);

  const handleSaveProfile = useCallback(async () => {
    setProfileLoading(true);
    setProfileMsg("");
    try {
      await updateProfile({ username, avatar_color: avatarColor });
      await refreshUser();
      setProfileMsg("✅ Profile updated!");
      setTimeout(() => setProfileMsg(""), 3000);
    } catch (err) {
      setProfileMsg("❌ " + (err?.response?.data?.error || "Could not update profile"));
    } finally {
      setProfileLoading(false);
    }
  }, [username, avatarColor, refreshUser]);

  const handleChangePassword = useCallback(async () => {
    setPwError("");
    setPwMsg("");
    if (!currentPw || !newPw) { setPwError("Both fields are required"); return; }
    if (newPw.length < 6) { setPwError("New password must be at least 6 characters"); return; }
    setPwLoading(true);
    try {
      await changePassword({ currentPassword: currentPw, newPassword: newPw });
      setPwMsg("✅ Password changed!");
      setCurrentPw(""); setNewPw("");
      setTimeout(() => { setPwMsg(""); setShowPwSection(false); }, 2500);
    } catch (err) {
      setPwError("❌ " + (err?.response?.data?.error || "Could not change password"));
    } finally {
      setPwLoading(false);
    }
  }, [currentPw, newPw]);

  const handleLogout = () => {
    logout();
    onClose();
  };

  const joinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "—";

  if (!user) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="profile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            key="profile-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm shadow-2xl overflow-y-auto"
          >
            <div className="min-h-full bg-white dark:bg-gray-900 flex flex-col">
              {/* Gradient header */}
              <div className="relative bg-gradient-to-br from-blue-600 via-teal-500 to-cyan-500 p-6 pb-10">
                <button
                  onClick={onClose}
                  id="profile-panel-close"
                  className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex flex-col items-center gap-3 pt-2">
                  <AvatarCircle user={{ ...user, avatar_color: avatarColor }} size="lg" />
                  <div className="text-center">
                    <h2 className="text-white font-bold text-xl">{user.username}</h2>
                    <p className="text-white/70 text-sm">{user.email}</p>
                  </div>
                </div>
              </div>

              {/* Stats cards */}
              <div className="px-5 -mt-5 mb-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-4 grid grid-cols-3 gap-3">
                  {statsLoading ? (
                    <div className="col-span-3 flex justify-center py-2">
                      <Loader className="w-5 h-5 animate-spin text-blue-500" />
                    </div>
                  ) : stats ? (
                    <>
                      <StatCard label="Total" value={stats.total} icon={<BarChart2 className="w-4 h-4" />} color="blue" />
                      <StatCard label="Low Risk" value={stats.riskCounts?.low || 0} icon={<TrendingDown className="w-4 h-4" />} color="green" />
                      <StatCard label="High Risk" value={stats.riskCounts?.high || 0} icon={<TrendingUp className="w-4 h-4" />} color="red" />
                    </>
                  ) : (
                    <p className="col-span-3 text-center text-xs text-gray-400 py-1">Run an analysis to see stats</p>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 px-5 pb-6 space-y-5">
                {/* Account info */}
                <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={user.email} />
                <InfoRow icon={<Calendar className="w-4 h-4" />} label="Joined" value={joinDate} />
                <InfoRow icon={<Shield className="w-4 h-4" />} label="Account" value="Standard" />

                <hr className="border-gray-100 dark:border-gray-800" />

                {/* Edit name */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Display Name
                  </label>
                  <div className="mt-1.5 flex gap-2">
                    <input
                      id="profile-username-input"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                    />
                  </div>
                </div>

                {/* Avatar color picker */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Avatar Color
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {PALETTE.map((c) => (
                      <button
                        key={c}
                        onClick={() => setAvatarColor(c)}
                        className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${avatarColor === c ? "ring-2 ring-offset-2 ring-blue-500 scale-110" : ""}`}
                        style={{ background: c }}
                        title={c}
                      />
                    ))}
                  </div>
                </div>

                {/* Save profile */}
                <motion.button
                  id="profile-save-btn"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveProfile}
                  disabled={profileLoading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-teal-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {profileLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Profile
                </motion.button>
                {profileMsg && (
                  <p className={`text-xs text-center ${profileMsg.startsWith("✅") ? "text-green-500" : "text-red-500"}`}>
                    {profileMsg}
                  </p>
                )}

                <hr className="border-gray-100 dark:border-gray-800" />

                {/* Change Password Section */}
                <button
                  id="profile-change-pw-toggle"
                  onClick={() => { setShowPwSection((p) => !p); setPwError(""); setPwMsg(""); }}
                  className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-500 transition-colors"
                >
                  <span className="flex items-center gap-2"><KeyRound className="w-4 h-4" /> Change Password</span>
                  <motion.div animate={{ rotate: showPwSection ? 90 : 0 }}>
                    <ChevronRight className="w-4 h-4" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {showPwSection && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden space-y-3"
                    >
                      <input
                        type="password"
                        id="profile-current-pw"
                        placeholder="Current password"
                        value={currentPw}
                        onChange={(e) => setCurrentPw(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                      />
                      <input
                        type="password"
                        id="profile-new-pw"
                        placeholder="New password (min. 6 chars)"
                        value={newPw}
                        onChange={(e) => setNewPw(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                      />
                      {pwError && <p className="text-xs text-red-500">{pwError}</p>}
                      {pwMsg && <p className="text-xs text-green-500">{pwMsg}</p>}
                      <button
                        id="profile-change-pw-btn"
                        onClick={handleChangePassword}
                        disabled={pwLoading}
                        className="w-full py-2.5 rounded-xl border border-blue-500 text-blue-500 font-semibold text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        {pwLoading ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        Update Password
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <hr className="border-gray-100 dark:border-gray-800" />

                {/* Logout */}
                <motion.button
                  id="profile-logout-btn"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="w-full py-2.5 rounded-xl border border-red-200 dark:border-red-900/50 text-red-500 font-semibold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function StatCard({ label, value, icon, color }) {
  const colorMap = {
    blue: "text-blue-500 bg-blue-50 dark:bg-blue-900/20",
    green: "text-green-500 bg-green-50 dark:bg-green-900/20",
    red: "text-red-500 bg-red-50 dark:bg-red-900/20",
  };
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
        {icon}
      </div>
      <span className="text-xl font-bold text-gray-900 dark:text-white">{value}</span>
      <span className="text-[0.65rem] font-medium text-gray-400 uppercase tracking-wide">{label}</span>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{value}</p>
      </div>
    </div>
  );
}
