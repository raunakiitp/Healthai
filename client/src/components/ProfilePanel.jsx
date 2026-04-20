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
  "#27272a", "#3f3f46", "#52525b", "#71717a",
  "#a1a1aa", "#d4d4d8", "#e4e4e7", "#ffffff",
];

function AvatarCircle({ user, size = "lg" }) {
  const letter = (user?.username || user?.email || "?")[0].toUpperCase();
  const color = user?.avatar_color || "#71717a"; // Default zinc-500
  const sz = size === "lg" ? "w-20 h-20 text-2xl" : "w-9 h-9 text-sm";
  return (
    <div
      className={`${sz} rounded-full flex items-center justify-center font-bold text-black border shadow-lg flex-shrink-0`}
      style={{ backgroundColor: color, borderColor: 'rgba(255,255,255,0.1)' }}
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
  const [avatarColor, setAvatarColor] = useState(user?.avatar_color || "#71717a");
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
      setAvatarColor(user.avatar_color || "#71717a");
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
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            key="profile-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm shadow-2xl bg-black border-l border-white/10 overflow-y-auto"
          >
            <div className="min-h-full flex flex-col">
              {/* Header */}
              <div className="relative bg-white/5 border-b border-white/10 p-6 pb-10">
                <button
                  onClick={onClose}
                  id="profile-panel-close"
                  className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex flex-col items-center gap-3 pt-2">
                  <AvatarCircle user={{ ...user, avatar_color: avatarColor }} size="lg" />
                  <div className="text-center">
                    <h2 className="text-white font-bold text-xl">{user.username}</h2>
                    <p className="text-zinc-500 text-sm">{user.email}</p>
                  </div>
                </div>
              </div>

              {/* Stats cards */}
              <div className="px-5 -mt-5 mb-4">
                <div className="bg-black rounded-2xl shadow-xl border border-white/10 p-4 grid grid-cols-3 gap-3">
                  {statsLoading ? (
                    <div className="col-span-3 flex justify-center py-2">
                      <Loader className="w-5 h-5 animate-spin text-white" />
                    </div>
                  ) : stats ? (
                    <>
                      <StatCard label="Total" value={stats.total} icon={<BarChart2 className="w-4 h-4" />} color="primary" />
                      <StatCard label="Low Risk" value={stats.riskCounts?.low || 0} icon={<TrendingDown className="w-4 h-4" />} color="secondary" />
                      <StatCard label="High Risk" value={stats.riskCounts?.high || 0} icon={<TrendingUp className="w-4 h-4" />} color="tertiary" />
                    </>
                  ) : (
                    <p className="col-span-3 text-center text-[10px] text-zinc-500 py-1 uppercase tracking-widest">Run an analysis to see stats</p>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 px-5 pb-6 space-y-5">
                {/* Account info */}
                <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={user.email} />
                <InfoRow icon={<Calendar className="w-4 h-4" />} label="Joined" value={joinDate} />
                <InfoRow icon={<Shield className="w-4 h-4" />} label="Account" value={user.role === 'admin' ? 'Admin' : 'Standard'} />

                <hr className="border-white/10" />

                {/* Edit name */}
                <div>
                  <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
                    Display Name
                  </label>
                  <div className="mt-1.5 flex gap-2">
                    <input
                      id="profile-username-input"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="flex-1 px-3 py-2.5 rounded-xl border border-white/20 bg-white/5 text-sm text-white focus:outline-none focus:border-white/50 transition-all"
                    />
                  </div>
                </div>

                {/* Avatar color picker */}
                <div>
                  <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
                    Avatar Tone
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {PALETTE.map((c) => (
                      <button
                        key={c}
                        onClick={() => setAvatarColor(c)}
                        className={`w-8 h-8 rounded-full border border-white/20 transition-transform hover:scale-110 ${avatarColor === c ? "ring-2 ring-offset-2 ring-offset-black ring-white scale-110" : ""}`}
                        style={{ backgroundColor: c }}
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
                  className="w-full py-2.5 rounded-xl bg-white text-black font-semibold text-sm shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 hover:bg-zinc-200 transition-colors"
                >
                  {profileLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Profile
                </motion.button>
                {profileMsg && (
                  <p className={`text-xs text-center ${profileMsg.startsWith("✅") ? "text-white" : "text-red-400"}`}>
                    {profileMsg}
                  </p>
                )}

                <hr className="border-white/10" />

                {/* Change Password Section */}
                <button
                  id="profile-change-pw-toggle"
                  onClick={() => { setShowPwSection((p) => !p); setPwError(""); setPwMsg(""); }}
                  className="w-full flex items-center justify-between text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
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
                        className="w-full px-3 py-2.5 rounded-xl border border-white/20 bg-white/5 text-sm text-white focus:outline-none focus:border-white/50"
                      />
                      <input
                        type="password"
                        id="profile-new-pw"
                        placeholder="New password (min. 6 chars)"
                        value={newPw}
                        onChange={(e) => setNewPw(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-white/20 bg-white/5 text-sm text-white focus:outline-none focus:border-white/50"
                      />
                      {pwError && <p className="text-xs text-red-400">{pwError}</p>}
                      {pwMsg && <p className="text-xs text-white">{pwMsg}</p>}
                      <button
                         id="profile-change-pw-btn"
                        onClick={handleChangePassword}
                        disabled={pwLoading}
                        className="w-full py-2.5 rounded-xl border border-white/20 text-white font-semibold text-sm hover:bg-white/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        {pwLoading ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        Update Password
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <hr className="border-white/10" />

                {/* Logout */}
                <motion.button
                  id="profile-logout-btn"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="w-full py-2.5 rounded-xl border border-white/10 text-white font-semibold text-sm hover:bg-white/5 hover:border-white/30 transition-colors flex items-center justify-center gap-2"
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
    primary: "text-white bg-white/10 border border-white/10",
    secondary: "text-zinc-300 bg-white/5 border border-white/5",
    tertiary: "text-zinc-500 bg-white/5 border border-white/5",
  };
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
        {icon}
      </div>
      <span className="text-xl font-bold text-white">{value}</span>
      <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">{label}</span>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-medium text-zinc-200 truncate">{value}</p>
      </div>
    </div>
  );
}
