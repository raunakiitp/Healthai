import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Clock, ChevronRight } from "lucide-react";

const RISK_COLORS = {
  low: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20",
  medium: "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20",
  high: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20",
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
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? 0 : "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="history-drawer glass border-l border-white/20 dark:border-blue-900/30 z-50"
        id="history-panel"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-700/30 sticky top-0 glass z-10">
          <div>
            <h2 className="font-bold text-gray-800 dark:text-gray-100 text-lg">
              Analysis History
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">{history.length} saved sessions</p>
          </div>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClear}
                className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title="Clear all history"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Entries */}
        <div className="p-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">📋</div>
              <p className="font-medium text-gray-500 dark:text-gray-400">No history yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
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
                className="neuro p-4 cursor-pointer group hover:scale-[1.01] transition-transform"
              >
                <div className="flex items-start justify-between gap-2">
                  <div
                    className="flex-1 min-w-0"
                    onClick={() => { onRestore(entry); onClose(); }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase ${
                          RISK_COLORS[entry.result?.risk_level] || RISK_COLORS.medium
                        }`}
                      >
                        {entry.result?.risk_level || "?"} risk
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        {formatTime(entry.timestamp)}
                      </span>
                    </div>

                    <p className="font-medium text-gray-700 dark:text-gray-200 text-sm truncate mb-1">
                      {entry.result?.conditions?.[0]?.name || "Analysis"}
                    </p>

                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
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
                      className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Restore this session"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onDelete(entry.id)}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
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
    </>
  );
}
