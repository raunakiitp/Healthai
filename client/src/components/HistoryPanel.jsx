import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Clock, ChevronRight, ClipboardList } from "lucide-react";

const RISK_COLORS = {
  low: "text-zinc-400 bg-white/5 border border-white/10",
  medium: "text-zinc-300 bg-white/10 border border-white/20",
  high: "text-white bg-white/20 border border-white/30",
};

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function HistoryPanel({ isOpen, onClose, history, onRestore, onDelete, onClear }) {
  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-40"
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-black border-l border-white/10 shadow-2xl z-50 overflow-y-auto"
            id="history-panel"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 sticky top-0 bg-black/80 backdrop-blur z-10">
              <div>
                <h2 className="font-bold text-white text-lg tracking-wide">
                  Analysis History
                </h2>
                <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mt-0.5">{history.length} saved sessions</p>
              </div>
              <div className="flex items-center gap-2">
                {history.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClear}
                    className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Clear all history"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Entries */}
            <div className="p-4 space-y-3">
              {history.length === 0 ? (
                <div className="text-center py-16">
                  <div className="flex justify-center mb-4">
                    <ClipboardList className="w-12 h-12 text-zinc-600" />
                  </div>
                  <p className="font-medium text-white tracking-wide">No history yet</p>
                  <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mt-1">
                    Run an analysis to save it here
                  </p>
                </div>
              ) : (
                history.map((entry, i) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-4 cursor-pointer group hover:border-white/30 transition-all shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className="flex-1 min-w-0"
                        onClick={() => { onRestore(entry); onClose(); }}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${
                              RISK_COLORS[entry.result?.risk_level] || RISK_COLORS.medium
                            }`}
                          >
                            {entry.result?.risk_level || "?"} risk
                          </span>
                          <span className="flex items-center gap-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
                            <Clock className="w-3 h-3" />
                            {formatTime(entry.timestamp)}
                          </span>
                        </div>

                        <p className="font-semibold text-white text-sm truncate mb-1">
                          {entry.result?.conditions?.[0]?.name || "Analysis"}
                        </p>

                        <p className="text-xs text-zinc-400 truncate">
                          {entry.input?.symptoms?.slice(0, 3).join(", ") ||
                            entry.input?.freeText?.slice(0, 40) ||
                            "Symptoms analyzed"}
                          {(entry.input?.symptoms?.length || 0) > 3 && " ..."}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => { onRestore(entry); onClose(); }}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all"
                          title="Restore this session"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onDelete(entry.id)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                          title="Delete entry"
                        >
                          <X className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
