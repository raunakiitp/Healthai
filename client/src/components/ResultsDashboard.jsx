import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle, Phone, Activity } from "lucide-react";

const RISK_CONFIG = {
  low: {
    label: "Low Risk",
    icon: "🟢",
    className: "risk-low",
    description: "Your symptoms appear mild. Monitor at home.",
    bg: "from-green-50 to-teal-50 dark:from-green-900/10 dark:to-teal-900/10",
  },
  medium: {
    label: "Medium Risk",
    icon: "🟡",
    className: "risk-medium",
    description: "Some concern. Consider seeing a doctor soon.",
    bg: "from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10",
  },
  high: {
    label: "High Risk",
    icon: "🔴",
    className: "risk-high",
    description: "Symptoms are serious. Seek medical care promptly.",
    bg: "from-red-50 to-orange-50 dark:from-red-900/10 dark:to-orange-900/10",
  },
};

// ─── Depth-reveal card ────────────────────────────────────────────────────────
function DepthCard({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 56, scale: 0.92 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: false, margin: "-70px" }}
      transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`card-3d glass-card ${className}`}
    >
      {children}
    </motion.div>
  );
}

function ProbabilityBar({ probability, index }) {
  return (
    <motion.div
      initial={{ width: 0 }}
      whileInView={{ width: `${probability * 100}%` }}
      viewport={{ once: false, margin: "-40px" }}
      transition={{ duration: 1.3, delay: 0.2 + index * 0.12, ease: [0.4, 0, 0.2, 1] }}
      className="prob-fill"
      style={{ width: 0 }}
    />
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="py-12 px-4 sm:px-6"
        >
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Section header */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="text-center mb-8"
            >
              <span className="section-label">AI Results</span>
              <h2 className="text-3xl sm:text-4xl font-bold mt-2">
                Your <span className="gradient-text">Health Analysis</span>
              </h2>
            </motion.div>

            {/* Emergency Alert */}
            <AnimatePresence>
              {result.emergency && (
                <motion.div
                  initial={{ scale: 0.88, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="emergency-alert p-6 flex items-start gap-4"
                >
                  <div className="text-4xl animate-heartbeat flex-shrink-0">🚨</div>
                  <div>
                    <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
                      Emergency Alert — Seek Immediate Care
                    </h3>
                    <p className="text-red-700 dark:text-red-300 mb-3 text-sm leading-relaxed">
                      Your symptoms indicate a potentially serious condition requiring{" "}
                      <strong>immediate medical attention</strong>. Do not wait.
                    </p>
                    <a href="tel:911"
                      className="inline-flex items-center gap-2 bg-red-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-red-600 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
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
                className={`card-3d glass-card p-6 bg-gradient-to-br ${risk.bg}`}
                initial={{ opacity: 0, scale: 0.88, y: 40 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: false, margin: "-60px" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                whileInView2={undefined}
              >
                {/* Scale punch: 1 → 1.05 → 1 */}
                <motion.div
                  initial={{ scale: 1 }}
                  whileInView={{ scale: [1, 1.05, 1] }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.15, ease: "easeInOut" }}
                >
                  <span className="section-label">Risk Assessment</span>
                  <div className="mt-4 flex items-center gap-4">
                    <div className={`text-5xl font-black px-5 py-3 rounded-2xl ${risk.className}`}>
                      {risk.icon}
                    </div>
                    <div>
                      <div className={`text-2xl font-bold ${risk.className} border-0 shadow-none bg-transparent px-0 py-0`}>
                        {risk.label}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{risk.description}</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* When to see doctor */}
              <DepthCard delay={0.08} className="p-6">
                <span className="section-label">See a Doctor When</span>
                <div className="mt-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {result.see_doctor_when || "If symptoms worsen, persist beyond 48 hours, or new symptoms develop."}
                  </p>
                </div>
              </DepthCard>
            </div>

            {/* Possible Conditions */}
            <DepthCard delay={0} className="p-6">
              <span className="section-label">Possible Conditions</span>
              <h3 className="font-semibold text-gray-700 dark:text-gray-200 mt-2 mb-5 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                Ranked by Likelihood
              </h3>
              <div className="space-y-4">
                {(result.conditions || []).map((cond, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -30, scale: 0.97 }}
                    whileInView={{ opacity: 1, x: 0, scale: 1 }}
                    viewport={{ once: false, margin: "-40px" }}
                    transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {i + 1}
                        </span>
                        <span className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
                          {cond.name}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400 ml-2 flex-shrink-0">
                        {Math.round((cond.probability || 0) * 100)}%
                      </span>
                    </div>
                    <div className="prob-bar mb-1.5">
                      <ProbabilityBar probability={cond.probability || 0} index={i} />
                    </div>
                    {cond.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 pl-8 leading-relaxed">
                        {cond.description}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            </DepthCard>

            {/* Recommended Actions */}
            <DepthCard delay={0.06} className="p-6">
              <span className="section-label">Recommended Actions</span>
              <h3 className="font-semibold text-gray-700 dark:text-gray-200 mt-2 mb-5">
                ✅ Steps to Take Now
              </h3>
              <div className="space-y-3">
                {(result.actions || []).map((action, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -16, scale: 0.97 }}
                    whileInView={{ opacity: 1, x: 0, scale: 1 }}
                    viewport={{ once: false, margin: "-30px" }}
                    transition={{ delay: i * 0.07, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-blue-50/60 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/20"
                    whileHover={{ x: 4, transition: { duration: 0.2 } }}
                  >
                    <CheckCircle className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{action}</span>
                  </motion.div>
                ))}
              </div>
            </DepthCard>

            {/* Home Care Tips */}
            {result.home_care && result.home_care.length > 0 && (
              <DepthCard delay={0.1} className="p-6">
                <span className="section-label">Home Care</span>
                <h3 className="font-semibold text-gray-700 dark:text-gray-200 mt-2 mb-5">
                  🏠 What You Can Do at Home
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {result.home_care.map((tip, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9, y: 16 }}
                      whileInView={{ opacity: 1, scale: 1, y: 0 }}
                      viewport={{ once: false, margin: "-20px" }}
                      transition={{ delay: i * 0.06, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-teal-50/60 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-800/20"
                      whileHover={{ scale: 1.02, y: -2, transition: { duration: 0.2 } }}
                    >
                      <span className="text-teal-500">💚</span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{tip}</span>
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
