import { motion } from "framer-motion";

export default function LoadingScanner() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="py-16 px-4 sm:px-6"
    >
      <div className="max-w-2xl mx-auto">
        <div className="glass-card p-10 text-center">
          {/* Scanner box */}
          <div className="scanner-container w-full max-w-xs mx-auto h-40 bg-gradient-to-b from-blue-50 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30 mb-8 relative">
            {/* Corner markers */}
            {["top-left", "top-right", "bottom-left", "bottom-right"].map((corner) => (
              <div
                key={corner}
                className={`absolute w-5 h-5 border-blue-400 dark:border-blue-500 ${
                  corner.includes("top") ? "top-2" : "bottom-2"
                } ${corner.includes("left") ? "left-2" : "right-2"} ${
                  corner.includes("top-left")
                    ? "border-t-2 border-l-2"
                    : corner.includes("top-right")
                    ? "border-t-2 border-r-2"
                    : corner.includes("bottom-left")
                    ? "border-b-2 border-l-2"
                    : "border-b-2 border-r-2"
                } rounded-sm`}
              />
            ))}
            {/* Scan line */}
            <div className="scan-line" />
            {/* DNA / medical icon center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.span
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="text-5xl opacity-20"
              >
                ⚕️
              </motion.span>
            </div>
          </div>

          {/* Status dots */}
          <div className="flex items-center justify-center gap-3 mb-6">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1, delay: i * 0.25, repeat: Infinity }}
                className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-teal-400"
              />
            ))}
          </div>

          <motion.h3
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-xl font-semibold gradient-text mb-3"
          >
            Analyzing Your Symptoms
          </motion.h3>

          <div className="space-y-2 text-center">
            {[
              "🔍 Processing symptom patterns...",
              "🧬 Cross-referencing medical database...",
              "🤖 Generating AI insights...",
            ].map((msg, i) => (
              <motion.p
                key={msg}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{
                  duration: 2,
                  delay: i * 0.8,
                  repeat: Infinity,
                  repeatDelay: 1.6,
                }}
                className="text-sm text-gray-500 dark:text-gray-400"
              >
                {msg}
              </motion.p>
            ))}
          </div>

          {/* Progress bar */}
          <div className="mt-8 h-1.5 bg-gray-100 dark:bg-gray-700/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 via-teal-400 to-blue-500 rounded-full"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              style={{ width: "60%" }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
