import { motion } from "framer-motion";
import { Activity } from "lucide-react";

export default function LoadingScanner() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="py-16 px-4 sm:px-6"
    >
      <div className="max-w-2xl mx-auto">
        <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl p-10 text-center shadow-2xl">
          {/* Scanner box */}
          <div className="scanner-container overflow-hidden w-full max-w-xs mx-auto h-40 bg-zinc-900/50 rounded-xl border border-white/10 mb-8 relative">
            {/* Corner markers */}
            {["top-left", "top-right", "bottom-left", "bottom-right"].map((corner) => (
              <div
                key={corner}
                className={`absolute w-5 h-5 border-zinc-500 ${
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
            <div className="scan-line bg-gradient-to-b from-transparent via-white/50 to-transparent absolute left-0 right-0 h-10 w-full" />
            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ opacity: [0.2, 0.6, 0.2] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Activity className="w-16 h-16 text-zinc-600" />
              </motion.div>
            </div>
          </div>

          {/* Status dots */}
          <div className="flex items-center justify-center gap-3 mb-6">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.8, 0.2] }}
                transition={{ duration: 1, delay: i * 0.25, repeat: Infinity }}
                className="w-2.5 h-2.5 rounded-full bg-white"
              />
            ))}
          </div>

          <motion.h3
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-xl font-bold text-white mb-3 tracking-wide"
          >
            Analyzing Your Symptoms
          </motion.h3>

          <div className="space-y-2 text-center">
            {[
              "Processing symptom patterns...",
              "Cross-referencing medical database...",
              "Generating AI insights...",
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
                className="text-sm font-medium text-zinc-500 uppercase tracking-widest"
              >
                {msg}
              </motion.p>
            ))}
          </div>

          {/* Progress bar */}
          <div className="mt-8 h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
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
