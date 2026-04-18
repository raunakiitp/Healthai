import { motion } from "framer-motion";
import { ShieldAlert } from "lucide-react";

export default function Disclaimer() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="fixed bottom-4 left-4 right-4 z-30 max-w-2xl mx-auto"
      id="disclaimer-banner"
    >
      <div className="glass border border-amber-200/50 dark:border-amber-700/30 rounded-2xl px-5 py-3 flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
          <strong className="text-amber-600 dark:text-amber-400">Medical Disclaimer:</strong>{" "}
          HealthAI is an informational tool only and does not constitute medical advice, diagnosis,
          or treatment. Always consult a qualified healthcare professional for any medical concerns.
          In emergencies, call 911 immediately.
        </p>
      </div>
    </motion.div>
  );
}
