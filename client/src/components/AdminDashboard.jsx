import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Users, BarChart2, Activity, Shield, Trash2,
  Ban, UserCheck, ChevronRight, Search, Plus, RefreshCw,
  TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle,
  Loader, UserX, Crown, Clock, Mail, Calendar
} from "lucide-react";
import {
  adminFetchStats, adminFetchUsers, adminDeleteUser,
  adminToggleBan, adminTogglePromote, adminClearUserHistory,
  adminFetchActivity, adminCreateUser
} from "../utils/api";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Avatar({ user, size = "sm" }) {
  const letter = (user?.username || user?.email || "?")[0].toUpperCase();
  const color = user?.avatar_color || "#6366f1";
  const sz = size === "lg" ? "w-12 h-12 text-lg" : "w-8 h-8 text-xs";
  return (
    <div
      className={`${sz} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`}
      style={{ background: `radial-gradient(circle at 35% 35%, ${color}dd, ${color}88)` }}
    >
      {letter}
    </div>
  );
}

const RISK_COLORS = {
  low: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20",
  medium: "text-amber-500 bg-amber-50 dark:bg-amber-900/20",
  high: "text-red-500 bg-red-50 dark:bg-red-900/20",
};

function RiskBadge({ level }) {
  const Icon = level === "high" ? TrendingUp : level === "medium" ? Minus : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${RISK_COLORS[level] || "text-gray-500 bg-gray-100"}`}>
      <Icon className="w-3 h-3" />
      {level || "—"}
    </span>
  );
}

function fmtDate(str) {
  if (!str) return "Never";
  return new Date(str).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color, sub }) {
  const colors = {
    blue: "from-blue-500 to-blue-600",
    purple: "from-purple-500 to-purple-600",
    green: "from-emerald-500 to-emerald-600",
    red: "from-red-500 to-red-600",
    orange: "from-orange-500 to-orange-600",
  };
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{label}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[color] || colors.blue} flex items-center justify-center text-white shadow-lg`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({ message, onConfirm, onCancel, danger = true }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        onClick={e => e.stopPropagation()}
        className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-200 dark:border-gray-700"
      >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${danger ? "bg-red-100 dark:bg-red-900/30" : "bg-blue-100 dark:bg-blue-900/30"}`}>
          <AlertTriangle className={`w-6 h-6 ${danger ? "text-red-500" : "text-blue-500"}`} />
        </div>
        <p className="text-center text-gray-800 dark:text-gray-200 font-medium text-sm mb-5">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancel</button>
          <button onClick={onConfirm} className={`flex-1 py-2.5 rounded-xl text-white font-semibold text-sm transition-colors ${danger ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"}`}>Confirm</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Create User Modal ────────────────────────────────────────────────────────
function CreateUserModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ email: "", username: "", password: "", role: "user" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { user } = await adminCreateUser(form);
      onCreated(user);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
        onClick={e => e.stopPropagation()}
        className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg">Create New User</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          {[{label:"Username", key:"username", type:"text"}, {label:"Email", key:"email", type:"email"}, {label:"Password", key:"password", type:"password"}].map(f => (
            <div key={f.key}>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{f.label}</label>
              <input type={f.type} value={form[f.key]} onChange={e => setForm(p => ({...p, [f.key]: e.target.value}))}
                className="mt-1 w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                required />
            </div>
          ))}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</label>
            <select value={form.role} onChange={e => setForm(p => ({...p, role: e.target.value}))}
              className="mt-1 w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {error && <p className="text-xs text-red-500">⚠️ {error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-teal-500 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60 mt-2">
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Create User
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── User Detail Drawer ───────────────────────────────────────────────────────
function UserDetail({ userId, onClose, onUserUpdated }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState("");

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    import("../utils/api").then(mod => mod.adminFetchUser(userId))
      .then(d => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [userId]);

  const doAction = async (action, fn, ...args) => {
    setActionLoading(action);
    try {
      const result = await fn(...args);
      setData(prev => prev ? { ...prev, user: { ...prev.user, ...result } } : prev);
      onUserUpdated?.();
    } catch (err) { console.error(err); }
    finally { setActionLoading(""); setConfirm(null); }
  };

  return (
    <AnimatePresence>
      {userId && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 z-[65] bg-black/40" />
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-[66] w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto border-l border-gray-200 dark:border-gray-700"
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">User Detail</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X className="w-5 h-5" /></button>
              </div>

              {loading ? (
                <div className="flex justify-center py-12"><Loader className="w-6 h-6 animate-spin text-blue-500" /></div>
              ) : !data ? (
                <p className="text-center text-gray-400">Failed to load user</p>
              ) : (
                <div className="space-y-5">
                  {/* Header */}
                  <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                    <Avatar user={data.user} size="lg" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-gray-900 dark:text-white truncate">{data.user.username}</p>
                        {data.user.role === "admin" && <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-bold">👑 Admin</span>}
                        {data.user.is_banned ? <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 text-xs font-bold">Banned</span> : null}
                      </div>
                      <p className="text-sm text-gray-500 truncate">{data.user.email}</p>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-2">
                    {[
                      { label: "Joined", value: fmtDate(data.user.created_at) },
                      { label: "Last Login", value: fmtDate(data.user.last_login) },
                      { label: "Total Analyses", value: data.history.length + (data.history.length === 20 ? "+" : "") },
                    ].map(i => (
                      <div key={i.label} className="flex justify-between items-center text-sm py-2 border-b border-gray-100 dark:border-gray-800">
                        <span className="text-gray-500">{i.label}</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{i.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  {data.user.role !== "admin" || data.user.id !== undefined ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => setConfirm({ action: "ban", label: data.user.is_banned ? `Unban ${data.user.username}?` : `Ban ${data.user.username}?` })}
                        disabled={!!actionLoading}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${data.user.is_banned ? "border-green-300 text-green-600 hover:bg-green-50 dark:border-green-700 dark:text-green-400" : "border-orange-300 text-orange-600 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400"}`}>
                        {actionLoading === "ban" ? <Loader className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                        {data.user.is_banned ? "Unban" : "Ban"}
                      </button>
                      <button onClick={() => setConfirm({ action: "promote", label: data.user.role === "admin" ? `Demote ${data.user.username} to user?` : `Promote ${data.user.username} to admin?` })}
                        disabled={!!actionLoading}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-purple-300 text-purple-600 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 text-sm font-semibold transition-colors">
                        {actionLoading === "promote" ? <Loader className="w-4 h-4 animate-spin" /> : <Crown className="w-4 h-4" />}
                        {data.user.role === "admin" ? "Demote" : "Promote"}
                      </button>
                      <button onClick={() => setConfirm({ action: "clearHistory", label: `Clear all history for ${data.user.username}?` })}
                        disabled={!!actionLoading}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 text-sm font-semibold transition-colors">
                        {actionLoading === "clearHistory" ? <Loader className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        Clear History
                      </button>
                      <button onClick={() => setConfirm({ action: "delete", label: `Permanently delete ${data.user.username}? This cannot be undone.` })}
                        disabled={!!actionLoading}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 text-sm font-semibold transition-colors">
                        {actionLoading === "delete" ? <Loader className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        Delete
                      </button>
                    </div>
                  ) : null}

                  {/* History preview */}
                  {data.history.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Recent Analyses</p>
                      <div className="space-y-2">
                        {data.history.slice(0, 5).map(h => (
                          <div key={h.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm">
                            <div>
                              <p className="font-medium text-gray-700 dark:text-gray-300 text-xs truncate max-w-[180px]">
                                {h.input?.symptoms?.slice(0, 3).join(", ") || h.input?.freeText?.slice(0, 40) || "—"}
                              </p>
                              <p className="text-gray-400 text-[0.65rem]">{fmtDate(h.timestamp)}</p>
                            </div>
                            <RiskBadge level={h.result?.risk_level} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Confirm dialog */}
            <AnimatePresence>
              {confirm && (
                <ConfirmDialog
                  message={confirm.label}
                  danger={confirm.action === "delete" || confirm.action === "ban"}
                  onCancel={() => setConfirm(null)}
                  onConfirm={async () => {
                    if (confirm.action === "ban") await doAction("ban", adminToggleBan, data.user.id);
                    else if (confirm.action === "promote") await doAction("promote", adminTogglePromote, data.user.id);
                    else if (confirm.action === "clearHistory") await doAction("clearHistory", adminClearUserHistory, data.user.id);
                    else if (confirm.action === "delete") { await doAction("delete", adminDeleteUser, data.user.id); onClose(); }
                  }}
                />
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Main Admin Dashboard ─────────────────────────────────────────────────────
const TABS = ["Overview", "Users", "Activity"];

export default function AdminDashboard({ isOpen, onClose }) {
  const [tab, setTab] = useState("Overview");
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersLoading, setUsersLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const loadStats = useCallback(() => {
    setStatsLoading(true);
    adminFetchStats().then(setStats).catch(() => {}).finally(() => setStatsLoading(false));
  }, []);

  const loadUsers = useCallback((q = search) => {
    setUsersLoading(true);
    adminFetchUsers(q).then(d => { setUsers(d.users); setUsersTotal(d.total); }).catch(() => {}).finally(() => setUsersLoading(false));
  }, [search]);

  const loadActivity = useCallback(() => {
    setActivityLoading(true);
    adminFetchActivity().then(d => setActivity(d.feed)).catch(() => {}).finally(() => setActivityLoading(false));
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    loadStats();
    loadUsers("");
    loadActivity();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => loadUsers(search), 300);
    return () => clearTimeout(t);
  }, [search, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div key="admin-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />

          {/* Main panel */}
          <motion.div key="admin-panel"
            initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            className="fixed left-0 top-0 bottom-0 z-50 w-full max-w-3xl bg-gray-50 dark:bg-gray-950 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 via-rose-500 to-pink-500 px-6 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-white font-bold text-lg leading-tight">Admin Dashboard</h1>
                  <p className="text-white/70 text-xs">HealthAI Control Panel</p>
                </div>
              </div>
              <button onClick={onClose} id="admin-close-btn"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-5 pt-4 flex-shrink-0">
              {TABS.map(t => (
                <button key={t} onClick={() => setTab(t)} id={`admin-tab-${t.toLowerCase()}`}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === t ? "bg-white dark:bg-gray-800 text-red-500 shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}>
                  {t}
                </button>
              ))}
              <button onClick={() => { loadStats(); loadUsers(""); loadActivity(); }}
                className="ml-auto w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-500 transition-colors" title="Refresh">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {/* ── OVERVIEW ── */}
              {tab === "Overview" && (
                <div className="space-y-5">
                  {statsLoading ? (
                    <div className="flex justify-center py-16"><Loader className="w-6 h-6 animate-spin text-red-500" /></div>
                  ) : stats ? (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <StatCard label="Total Users" value={stats.totalUsers} color="blue" icon={<Users className="w-5 h-5" />} sub={`+${stats.newUsersWeek} this week`} />
                        <StatCard label="Active Today" value={stats.activeToday} color="green" icon={<Activity className="w-5 h-5" />} />
                        <StatCard label="Total Analyses" value={stats.totalAnalyses} color="purple" icon={<BarChart2 className="w-5 h-5" />} />
                        <StatCard label="Banned Users" value={stats.bannedUsers} color="red" icon={<Ban className="w-5 h-5" />} />
                        <StatCard label="Low Risk" value={stats.riskCounts?.low || 0} color="green" icon={<TrendingDown className="w-5 h-5" />} />
                        <StatCard label="High Risk" value={stats.riskCounts?.high || 0} color="red" icon={<TrendingUp className="w-5 h-5" />} />
                      </div>

                      {/* Daily analyses chart */}
                      {stats.dailyAnalyses?.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Analyses — Last 7 Days</p>
                          <div className="flex items-end gap-2 h-24">
                            {stats.dailyAnalyses.map(d => {
                              const max = Math.max(...stats.dailyAnalyses.map(x => x.count), 1);
                              const pct = (d.count / max) * 100;
                              return (
                                <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                                  <div className="w-full bg-gradient-to-t from-red-500 to-rose-400 rounded-t-md transition-all" style={{ height: `${pct}%`, minHeight: d.count ? "4px" : "0" }} />
                                  <span className="text-[0.6rem] text-gray-400">{new Date(d.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  ) : <p className="text-center text-gray-400 py-12">Could not load stats</p>}
                </div>
              )}

              {/* ── USERS ── */}
              {tab === "Users" && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search by name or email…"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/30" />
                    </div>
                    <button onClick={() => setShowCreate(true)} id="admin-create-user-btn"
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white text-sm font-semibold shadow-md flex-shrink-0">
                      <Plus className="w-4 h-4" /> New
                    </button>
                  </div>

                  <p className="text-xs text-gray-400">{usersTotal} users found</p>

                  {usersLoading ? (
                    <div className="flex justify-center py-12"><Loader className="w-5 h-5 animate-spin text-red-500" /></div>
                  ) : (
                    <div className="space-y-2">
                      {users.map(u => (
                        <motion.button key={u.id} onClick={() => setSelectedUser(u.id)}
                          whileHover={{ x: 2 }}
                          className="w-full bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 flex items-center gap-3 text-left hover:border-red-300 dark:hover:border-red-700 transition-colors shadow-sm"
                        >
                          <Avatar user={u} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm truncate">{u.username}</p>
                              {u.role === "admin" && <span className="text-amber-500 text-xs">👑</span>}
                              {u.is_banned ? <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-500 text-[0.6rem] rounded font-bold">BANNED</span> : null}
                            </div>
                            <p className="text-xs text-gray-400 truncate">{u.email}</p>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{u.analysis_count} analyses</p>
                            <p className="text-[0.65rem] text-gray-400">{u.last_login ? "Active recently" : "Never logged in"}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                        </motion.button>
                      ))}
                      {users.length === 0 && <p className="text-center text-gray-400 py-8">No users found</p>}
                    </div>
                  )}
                </div>
              )}

              {/* ── ACTIVITY ── */}
              {tab === "Activity" && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-400">Latest 30 analyses across all users</p>
                  {activityLoading ? (
                    <div className="flex justify-center py-12"><Loader className="w-5 h-5 animate-spin text-red-500" /></div>
                  ) : activity.length === 0 ? (
                    <p className="text-center text-gray-400 py-12">No activity yet</p>
                  ) : (
                    <div className="space-y-2">
                      {activity.map(a => (
                        <div key={a.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 flex items-center gap-3 shadow-sm">
                          <Avatar user={{ username: a.username, avatar_color: a.avatarColor }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{a.username}</p>
                            <p className="text-xs text-gray-400 truncate">{a.email}</p>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <RiskBadge level={a.riskLevel} />
                            <p className="text-[0.65rem] text-gray-400 mt-1">{fmtDate(a.timestamp)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* User detail drawer */}
          <UserDetail userId={selectedUser} onClose={() => setSelectedUser(null)} onUserUpdated={() => loadUsers()} />

          {/* Create user modal */}
          <AnimatePresence>
            {showCreate && (
              <CreateUserModal onClose={() => setShowCreate(false)} onCreated={(u) => setUsers(prev => [u, ...prev])} />
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
