import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle, Phone, Activity, ShieldCheck, AlertOctagon, Heart, ListTodo, Home, HeartHandshake } from "lucide-react";

const RISK_CONFIG = {
  low: {
    label: "Low Risk",
    icon: <ShieldCheck className="w-10 h-10 text-white/80" />,
    className: "text-white/80",
    description: "Your symptoms appear mild. Monitor at home.",
    border: "border-white/20",
  },
  medium: {
    label: "Medium Risk",
    icon: <AlertTriangle className="w-10 h-10 text-zinc-300" />,
    className: "text-zinc-300",
    description: "Some concern. Consider seeing a doctor soon.",
    border: "border-zinc-400/40",
  },
  high: {
    label: "High Risk",
    icon: <AlertOctagon className="w-10 h-10 text-red-500/80" />,
    className: "text-red-500/80",
    description: "Symptoms are serious. Seek medical care promptly.",
    border: "border-red-500/30",
  },
};

// ─── Depth-reveal card ────────────────────────────────────────────────────────
function DepthCard({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 56, scale: 0.92 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: false, margin: "-70px" }}
      className={`relative rounded-2xl overflow-hidden bg-zinc-950 border border-white/10 shadow-xl ${className}`}
    >
      {children}
    </motion.div>
  );
}

function ProbabilityBar({ probability, index }) {
  return (
    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mt-2">
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${probability * 100}%` }}
        viewport={{ once: false, margin: "-40px" }}
        transition={{ duration: 1.3, delay: 0.2 + index * 0.12, ease: [0.4, 0, 0.2, 1] }}
        className="h-full bg-white"
      />
    </div>
  );
}

export default function ResultsDashboard({ result, isVisible }) {
  if (!result) return null;

  const risk = RISK_CONFIG[result.risk_level] || RISK_CONFIG.medium;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.section
          id="results-dashboard"
          role="region"
          aria-labelledby="results-heading"
          aria-live="polite"
          aria-atomic="false"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="py-12 px-4 sm:px-6 bg-black"
        >
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Section header */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="text-center mb-8"
            >
              <span className="text-[10px] sm:text-xs font-semibold text-zinc-500 uppercase tracking-widest border border-white/10 px-3 py-1 rounded-full">AI Results</span>
              <h2 id="results-heading" className="text-3xl sm:text-4xl font-bold mt-4 text-white">
                Your <span className="text-zinc-400">Health Analysis</span>
              </h2>
            </motion.div>

            {/* Emergency Alert */}
            <AnimatePresence>
              {result.emergency && (
                <motion.div
                  role="alert"
                  aria-live="assertive"
                  aria-atomic="true"
                  initial={{ scale: 0.88, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="p-6 flex items-start gap-4 rounded-2xl bg-red-950/20 border border-red-500/20"
                >
                  <Activity aria-hidden="true" className="w-8 h-8 text-red-500 flex-shrink-0 animate-pulse mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-red-400 mb-2">
                      Emergency Alert — Seek Immediate Care
                    </h3>
                    <p className="text-red-300/80 mb-4 text-sm leading-relaxed">
                      Your symptoms indicate a potentially serious condition requiring{" "}
                      <strong className="text-red-300">immediate medical attention</strong>. Do not wait.
                    </p>
                    <a href="tel:911"
                      className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 px-5 py-2 rounded-xl font-medium text-sm hover:bg-red-500/20 transition-all outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500 focus-visible:ring-offset-black"
                    >
                      <Phone aria-hidden="true" className="w-4 h-4" />
                      Call Emergency (911)
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Risk + Doctor row */}
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Risk Level — punch scale on reveal */}
              <motion.div
                className={`relative rounded-2xl overflow-hidden bg-zinc-950 border ${risk.border} p-6 shadow-xl flex items-center`}
                initial={{ opacity: 0, scale: 0.88, y: 40 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: false, margin: "-60px" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Scale punch: 1 → 1.05 → 1 */}
                <motion.div
                  initial={{ scale: 1 }}
                  whileInView={{ scale: [1, 1.05, 1] }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.15, ease: "easeInOut" }}
                  className="w-full"
                >
                  <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest block mb-4">Risk Assessment</span>
                  <div className="flex items-center gap-4">
                    <div className="p-2 border border-white/5 rounded-xl bg-white/5" aria-hidden="true">
                      {risk.icon}
                    </div>
                    <div>
                      <div
                        className={`text-2xl font-bold ${risk.className}`}
                        aria-label={`Risk level: ${risk.label}`}
                        role="status"
                      >
                        {risk.label}
                      </div>
                      <p className="text-sm text-zinc-500 mt-1">{risk.description}</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* When to see doctor */}
              <DepthCard delay={0.08} className="p-6">
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest block mb-4">See a Doctor When</span>
                <div className="flex items-start gap-3">
                  <AlertTriangle aria-hidden="true" className="w-5 h-5 text-zinc-400 flex-shrink-0 mt-0.5" />
                  <p className="text-zinc-300 text-sm leading-relaxed font-medium">
                    {result.see_doctor_when || "If symptoms worsen, persist beyond 48 hours, or new symptoms develop."}
                  </p>
                </div>
              </DepthCard>
            </div>

            {/* Possible Conditions */}
            <DepthCard delay={0} className="p-6">
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest block">Analysis</span>
              <h3 className="font-semibold text-white mt-1 mb-6 flex items-center gap-2">
                <Activity aria-hidden="true" className="w-5 h-5 text-zinc-400" />
                Possible Conditions
              </h3>
              <div className="space-y-6">
                {(result.conditions || []).map((cond, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -30, scale: 0.97 }}
                    whileInView={{ opacity: 1, x: 0, scale: 1 }}
                    viewport={{ once: false, margin: "-40px" }}
                    transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full border border-white/20 bg-white/5 text-zinc-300 text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {i + 1}
                        </span>
                        <span className="font-semibold text-white text-sm">
                          {cond.name}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-zinc-400 ml-2 flex-shrink-0">
                        {Math.round((cond.probability || 0) * 100)}%
                      </span>
                    </div>
                    <ProbabilityBar probability={cond.probability || 0} index={i} />
                    <span className="sr-only">{Math.round((cond.probability || 0) * 100)}% probability</span>
                    {cond.description && (
                       <div className="pl-9 mt-2">
                         <p className="text-xs text-zinc-500 leading-relaxed max-w-xl">
                          {cond.description}
                         </p>
                       </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </DepthCard>

            {/* Recommended Actions */}
            <DepthCard delay={0.06} className="p-6">
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest block">Plan</span>
              <h3 className="font-semibold text-white mt-1 mb-5 flex items-center gap-2">
                <ListTodo aria-hidden="true" className="w-5 h-5 text-zinc-400" />
                Recommended Actions
              </h3>
              <div className="space-y-3">
                {(result.actions || []).map((action, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -16, scale: 0.97 }}
                    whileInView={{ opacity: 1, x: 0, scale: 1 }}
                    viewport={{ once: false, margin: "-30px" }}
                    transition={{ delay: i * 0.07, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-start gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10"
                    whileHover={{ x: 4, transition: { duration: 0.2 } }}
                  >
                    <CheckCircle aria-hidden="true" className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-zinc-300 leading-relaxed font-medium">{action}</span>
                  </motion.div>
                ))}
              </div>
            </DepthCard>

            {/* Home Care Tips */}
            {result.home_care && result.home_care.length > 0 && (
              <DepthCard delay={0.1} className="p-6">
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest block">Treatment</span>
                <h3 className="font-semibold text-white mt-1 mb-5 flex items-center gap-2">
                  <Home aria-hidden="true" className="w-5 h-5 text-zinc-400" />
                  Home Care Tips
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {result.home_care.map((tip, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9, y: 16 }}
                      whileInView={{ opacity: 1, scale: 1, y: 0 }}
                      viewport={{ once: false, margin: "-20px" }}
                      transition={{ delay: i * 0.06, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10"
                      whileHover={{ scale: 1.02, y: -2, transition: { duration: 0.2 } }}
                    >
                      <HeartHandshake aria-hidden="true" className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                      <span className="text-sm text-zinc-300 font-medium">{tip}</span>
                    </motion.div>
                  ))}
                </div>
              </DepthCard>
            )}
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
