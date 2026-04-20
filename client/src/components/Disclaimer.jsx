import { motion } from "framer-motion";
import { ShieldAlert } from "lucide-react";

export default function Disclaimer() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="max-w-3xl mx-auto w-full px-4 mb-4"
      id="disclaimer-banner"
    >
      <div className="bg-black/40 border border-white/5 rounded-2xl px-5 py-4 flex items-start gap-3 text-left">
        <ShieldAlert className="w-5 h-5 text-zinc-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-zinc-500 leading-relaxed">
          <strong className="text-zinc-400 uppercase tracking-widest font-semibold text-[10px]">Medical Disclaimer:</strong>{" "}
          HealthAI is an informational tool only and does not constitute medical advice, diagnosis,
          or treatment. Always consult a qualified healthcare professional for any medical concerns.
          In emergencies, call 911 immediately.
        </p>
      </div>
    </motion.div>
  );
}
