import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Users, BarChart2, Activity, Shield, Trash2,
  Ban, UserCheck, ChevronRight, Search, Plus, RefreshCw,
  TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle,
  Loader, UserX, Crown, Clock, Mail, Calendar, Settings
} from "lucide-react";
import {
  adminFetchStats, adminFetchUsers, adminDeleteUser,
  adminToggleBan, adminTogglePromote, adminClearUserHistory,
  adminFetchActivity, adminCreateUser
} from "../utils/api";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Avatar({ user, size = "sm" }) {
  const letter = (user?.username || user?.email || "?")[0].toUpperCase();
  const sz = size === "lg" ? "w-12 h-12 text-lg" : "w-8 h-8 text-xs";
  return (
    <div
      className={`${sz} rounded-full flex items-center justify-center font-bold text-black bg-white flex-shrink-0`}
    >
      {letter}
    </div>
  );
}

const RISK_COLORS = {
  low: "text-zinc-400 bg-white/5 border border-white/10",
  medium: "text-zinc-200 bg-white/10 border border-white/20",
  high: "text-white bg-white/20 border border-white/30",
};

function RiskBadge({ level }) {
  const Icon = level === "high" ? TrendingUp : level === "medium" ? Minus : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${RISK_COLORS[level] || "text-zinc-500 bg-white/5 border border-white/10"}`}>
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
function StatCard({ label, value, icon, sub }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-black/60 rounded-2xl p-5 border border-white/10 shadow-xl backdrop-blur-md"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">{label}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
          {sub && <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white shadow-lg`}>
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
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        onClick={e => e.stopPropagation()}
        className="bg-zinc-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-white/10"
      >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 bg-white/5 border border-white/10`}>
          <AlertTriangle className={`w-6 h-6 text-white`} />
        </div>
        <p className="text-center text-white font-medium text-sm mb-5">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-white/20 text-zinc-400 font-medium text-sm hover:bg-white/5 transition-colors">Cancel</button>
          <button onClick={onConfirm} className={`flex-1 py-2.5 rounded-xl text-black font-semibold text-sm transition-colors bg-white hover:bg-zinc-200`}>Confirm</button>
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
      className="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
        onClick={e => e.stopPropagation()}
        className="bg-black/90 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-white/10"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-white text-lg">Create New User</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          {[{label:"Username", key:"username", type:"text"}, {label:"Email", key:"email", type:"email"}, {label:"Password", key:"password", type:"password"}].map(f => (
            <div key={f.key}>
              <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">{f.label}</label>
              <input type={f.type} value={form[f.key]} onChange={e => setForm(p => ({...p, [f.key]: e.target.value}))}
                className="mt-1 w-full px-3 py-2.5 rounded-xl border border-white/20 bg-white/5 text-sm text-white focus:outline-none focus:border-white/50"
                required />
            </div>
          ))}
          <div>
            <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Role</label>
            <select value={form.role} onChange={e => setForm(p => ({...p, role: e.target.value}))}
              className="mt-1 w-full px-3 py-2.5 rounded-xl border border-white/20 bg-black text-sm text-white focus:outline-none focus:border-white/50">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {error && <p className="text-xs text-red-500 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> {error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl bg-white text-black font-semibold text-sm flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors disabled:opacity-60 mt-2">
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
            onClick={onClose} className="fixed inset-0 z-[65] bg-black/60 backdrop-blur-sm" />
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-[66] w-full max-w-md bg-black shadow-2xl overflow-y-auto border-l border-white/10"
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-white text-lg">User Detail</h3>
                <button onClick={onClose} className="text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              {loading ? (
                <div className="flex justify-center py-12"><Loader className="w-6 h-6 animate-spin text-white" /></div>
              ) : !data ? (
                <p className="text-center text-zinc-500">Failed to load user</p>
              ) : (
                <div className="space-y-5">
                  {/* Header */}
                  <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl">
                    <Avatar user={data.user} size="lg" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-white truncate">{data.user.username}</p>
                        {data.user.role === "admin" && <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-bold border border-white/20"><Shield className="w-3 h-3"/> Admin</span>}
                        {data.user.is_banned ? <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-950/40 text-red-400 text-[10px] font-bold border border-red-500/20"><Ban className="w-3 h-3"/> Banned</span> : null}
                      </div>
                      <p className="text-sm text-zinc-500 truncate">{data.user.email}</p>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-2">
                    {[
                      { label: "Joined", value: fmtDate(data.user.created_at) },
                      { label: "Last Login", value: fmtDate(data.user.last_login) },
                      { label: "Total Analyses", value: data.history.length + (data.history.length === 20 ? "+" : "") },
                    ].map(i => (
                      <div key={i.label} className="flex justify-between items-center text-sm py-2 border-b border-white/10">
                        <span className="text-zinc-500">{i.label}</span>
                        <span className="font-semibold text-zinc-200">{i.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  {data.user.role !== "admin" || data.user.id !== undefined ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => setConfirm({ action: "ban", label: data.user.is_banned ? `Unban ${data.user.username}?` : `Ban ${data.user.username}?` })}
                        disabled={!!actionLoading}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${data.user.is_banned ? "border-white/20 text-white hover:bg-white/10" : "border-white/10 text-zinc-400 hover:text-white hover:bg-white/5"}`}>
                        {actionLoading === "ban" ? <Loader className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                        {data.user.is_banned ? "Unban" : "Ban"}
                      </button>
                      <button onClick={() => setConfirm({ action: "promote", label: data.user.role === "admin" ? `Demote ${data.user.username} to user?` : `Promote ${data.user.username} to admin?` })}
                        disabled={!!actionLoading}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 text-sm font-semibold transition-colors">
                        {actionLoading === "promote" ? <Loader className="w-4 h-4 animate-spin" /> : <Crown className="w-4 h-4" />}
                        {data.user.role === "admin" ? "Demote" : "Promote"}
                      </button>
                      <button onClick={() => setConfirm({ action: "clearHistory", label: `Clear all history for ${data.user.username}?` })}
                        disabled={!!actionLoading}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 text-sm font-semibold transition-colors">
                        {actionLoading === "clearHistory" ? <Loader className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        Clear History
                      </button>
                      <button onClick={() => setConfirm({ action: "delete", label: `Permanently delete ${data.user.username}? This cannot be undone.` })}
                        disabled={!!actionLoading}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm font-semibold transition-colors">
                        {actionLoading === "delete" ? <Loader className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        Delete
                      </button>
                    </div>
                  ) : null}

                  {/* History preview */}
                  {data.history.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-3">Recent Analyses</p>
                      <div className="space-y-2">
                        {data.history.slice(0, 5).map(h => (
                          <div key={h.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl text-sm">
                            <div>
                              <p className="font-medium text-zinc-300 text-xs truncate max-w-[180px]">
                                {h.input?.symptoms?.slice(0, 3).join(", ") || h.input?.freeText?.slice(0, 40) || "—"}
                              </p>
                              <p className="text-zinc-600 text-[0.65rem] mt-0.5">{fmtDate(h.timestamp)}</p>
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
            onClick={onClose} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md" />

          {/* Main panel */}
          <motion.div key="admin-panel"
            initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            className="fixed left-0 top-0 bottom-0 z-50 w-full max-w-3xl bg-black border-r border-white/10 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-white/5 border-b border-white/10 px-6 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl border border-white/20 flex items-center justify-center bg-white text-black">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-white font-bold text-lg leading-tight">Admin Dashboard</h1>
                  <p className="text-zinc-500 text-xs">HealthAI Control Panel</p>
                </div>
              </div>
              <button onClick={onClose} id="admin-close-btn"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/10 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-5 pt-4 flex-shrink-0 border-b border-white/10 pb-2">
              {TABS.map(t => (
                <button key={t} onClick={() => setTab(t)} id={`admin-tab-${t.toLowerCase()}`}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === t ? "bg-white text-black shadow-sm" : "text-zinc-500 hover:text-white"}`}>
                  {t}
                </button>
              ))}
              <button onClick={() => { loadStats(); loadUsers(""); loadActivity(); }}
                className="ml-auto w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-white transition-colors" title="Refresh">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {/* ── OVERVIEW ── */}
              {tab === "Overview" && (
                <div className="space-y-5">
                  {statsLoading ? (
                    <div className="flex justify-center py-16"><Loader className="w-6 h-6 animate-spin text-white" /></div>
                  ) : stats ? (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <StatCard label="Total Users" value={stats.totalUsers} icon={<Users className="w-5 h-5" />} sub={`+${stats.newUsersWeek} this week`} />
                        <StatCard label="Active Today" value={stats.activeToday} icon={<Activity className="w-5 h-5" />} />
                        <StatCard label="Total Analyses" value={stats.totalAnalyses} icon={<BarChart2 className="w-5 h-5" />} />
                        <StatCard label="Banned Users" value={stats.bannedUsers} icon={<Ban className="w-5 h-5" />} />
                        <StatCard label="Low Risk" value={stats.riskCounts?.low || 0} icon={<TrendingDown className="w-5 h-5 text-zinc-400" />} />
                        <StatCard label="High Risk" value={stats.riskCounts?.high || 0} icon={<TrendingUp className="w-5 h-5 text-white" />} />
                      </div>

                      {/* Daily analyses chart */}
                      {stats.dailyAnalyses?.length > 0 && (
                        <div className="bg-black/40 rounded-2xl p-5 border border-white/10">
                          <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-4">Analyses — Last 7 Days</p>
                          <div className="flex items-end gap-2 h-24">
                            {stats.dailyAnalyses.map(d => {
                              const max = Math.max(...stats.dailyAnalyses.map(x => x.count), 1);
                              const pct = (d.count / max) * 100;
                              return (
                                <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                                  <div className="w-full bg-white rounded-t-md transition-all" style={{ height: `${pct}%`, minHeight: d.count ? "4px" : "0" }} />
                                  <span className="text-[0.6rem] text-zinc-600">{new Date(d.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  ) : <p className="text-center text-zinc-500 py-12">Could not load stats</p>}
                </div>
              )}

              {/* ── USERS ── */}
              {tab === "Users" && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search by name or email…"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-white focus:outline-none focus:border-white/30" />
                    </div>
                    <button onClick={() => setShowCreate(true)} id="admin-create-user-btn"
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-black text-sm font-semibold shadow-md flex-shrink-0 hover:bg-zinc-200 transition-colors">
                      <Plus className="w-4 h-4" /> New
                    </button>
                  </div>

                  <p className="text-xs text-zinc-500">{usersTotal} users found</p>

                  {usersLoading ? (
                    <div className="flex justify-center py-12"><Loader className="w-5 h-5 animate-spin text-white" /></div>
                  ) : (
                    <div className="space-y-2">
                      {users.map(u => (
                        <motion.button key={u.id} onClick={() => setSelectedUser(u.id)}
                          whileHover={{ x: 2 }}
                          className="w-full bg-black/40 rounded-2xl p-4 border border-white/10 flex items-center gap-3 text-left hover:border-white/30 transition-colors shadow-sm"
                        >
                          <Avatar user={u} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-white text-sm truncate">{u.username}</p>
                              {u.role === "admin" && <Shield className="w-3.5 h-3.5 text-zinc-400" />}
                              {u.is_banned ? <span className="px-1.5 py-0.5 bg-red-950/40 border border-red-500/20 text-red-500 text-[0.6rem] rounded font-bold">BANNED</span> : null}
                            </div>
                            <p className="text-xs text-zinc-500 truncate">{u.email}</p>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <p className="text-xs font-semibold text-zinc-300">{u.analysis_count} analyses</p>
                            <p className="text-[0.65rem] text-zinc-600">{u.last_login ? "Active recently" : "Never logged in"}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-zinc-600 flex-shrink-0" />
                        </motion.button>
                      ))}
                      {users.length === 0 && <p className="text-center text-zinc-500 py-8">No users found</p>}
                    </div>
                  )}
                </div>
              )}

              {/* ── ACTIVITY ── */}
              {tab === "Activity" && (
                <div className="space-y-3">
                  <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Latest 30 analyses across all users</p>
                  {activityLoading ? (
                    <div className="flex justify-center py-12"><Loader className="w-5 h-5 animate-spin text-white" /></div>
                  ) : activity.length === 0 ? (
                    <p className="text-center text-zinc-500 py-12">No activity yet</p>
                  ) : (
                    <div className="space-y-2">
                      {activity.map(a => (
                        <div key={a.id} className="bg-black/40 rounded-2xl p-4 border border-white/10 flex items-center gap-3 shadow-sm">
                          <Avatar user={{ username: a.username }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white">{a.username}</p>
                            <p className="text-xs text-zinc-500 truncate">{a.email}</p>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <RiskBadge level={a.riskLevel} />
                            <p className="text-[0.65rem] text-zinc-600 mt-1">{fmtDate(a.timestamp)}</p>
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
