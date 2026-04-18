import { useState, useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Clock, User, AlertCircle, ChevronDown } from "lucide-react";

const COMMON_SYMPTOMS = [
  { label: "Fever", icon: "🌡️" },
  { label: "Headache", icon: "🧠" },
  { label: "Cough", icon: "😮‍💨" },
  { label: "Sore Throat", icon: "🗣️" },
  { label: "Chest Pain", icon: "💔" },
  { label: "Shortness of Breath", icon: "🫁" },
  { label: "Nausea", icon: "🤢" },
  { label: "Dizziness", icon: "💫" },
  { label: "Fatigue", icon: "😴" },
  { label: "Body Aches", icon: "🦴" },
  { label: "Back Pain", icon: "🔧" },
  { label: "Abdominal Pain", icon: "🫃" },
  { label: "Diarrhea", icon: "💊" },
  { label: "Vomiting", icon: "🤮" },
  { label: "Rash", icon: "🔴" },
  { label: "Chills", icon: "🥶" },
  { label: "Sweating", icon: "💦" },
  { label: "Loss of Appetite", icon: "🍽️" },
  { label: "Runny Nose", icon: "🤧" },
  { label: "Eye Pain", icon: "👁️" },
  { label: "Swelling", icon: "🫧" },
  { label: "Joint Pain", icon: "🦵" },
];

const DURATIONS = [
  "Less than 1 hour", "1-6 hours", "6-12 hours", "1 day",
  "2-3 days", "4-7 days", "1-2 weeks", "More than 2 weeks",
];

function getSeverityLabel(val) {
  if (val <= 2) return { label: "Very Mild",   color: "#22c55e" };
  if (val <= 4) return { label: "Mild",         color: "#86efac" };
  if (val <= 6) return { label: "Moderate",     color: "#eab308" };
  if (val <= 8) return { label: "Severe",       color: "#f97316" };
  return             { label: "Very Severe",  color: "#ef4444" };
}

// ─── Scroll-animated card wrapper ────────────────────────────────────────────
function ScrollCard({ children, delay = 0, className = "", tiltDir = 1, ...rest }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 48, scale: 0.96, rotateX: `${4 * tiltDir}deg` }}
      whileInView={{ opacity: 1, y: 0, scale: 1, rotateX: "0deg" }}
      viewport={{ once: false, margin: "-80px" }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`card-3d glass-card ${className}`}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export default function SymptomPanel({ formData, onChange, onAnalyze, isLoading }) {
  const { symptoms = [], severity = 5, duration = "", age = "", gender = "" } = formData;
  const sectionRef = useRef(null);

  // Section-level scroll for the header perspective effect
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "start center"],
  });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 60, damping: 20 });
  const sectionY = useTransform(smoothProgress, [0, 1], [60, 0]);
  const sectionOpacity = useTransform(smoothProgress, [0, 0.5], [0, 1]);
  const sectionRotateX = useTransform(smoothProgress, [0, 1], [6, 0]);

  const toggleSymptom = (sym) => {
    if (symptoms.includes(sym)) onChange({ symptoms: symptoms.filter((s) => s !== sym) });
    else onChange({ symptoms: [...symptoms, sym] });
  };

  const severityInfo = getSeverityLabel(severity);

  return (
    <section ref={sectionRef} id="symptom-panel" className="py-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">

        {/* Section header — scroll-reveals with perspective */}
        <motion.div
          style={{ y: sectionY, opacity: sectionOpacity, rotateX: sectionRotateX, transformPerspective: 800 }}
          className="text-center mb-10 will-transform"
        >
          <span className="section-label">Step 2</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-2 mb-3">
            Describe Your <span className="gradient-text">Symptoms</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
            Select all that apply and fill in the details for accurate analysis.
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* ── Symptom Tags — staggered float-up ── */}
          <ScrollCard delay={0} className="p-6">
            <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
              <span className="text-xl">🩺</span>
              Select Symptoms
              {symptoms.length > 0 && (
                <motion.span
                  key={symptoms.length}
                  initial={{ scale: 0.7 }}
                  animate={{ scale: 1 }}
                  className="ml-auto text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full"
                >
                  {symptoms.length} selected
                </motion.span>
              )}
            </h3>
            <div className="flex flex-wrap gap-2">
              {COMMON_SYMPTOMS.map((sym, i) => (
                <motion.button
                  key={sym.label}
                  initial={{ opacity: 0, y: 20, scale: 0.85 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: false, margin: "-40px" }}
                  transition={{ delay: i * 0.025, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ scale: 1.08, y: -3 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => toggleSymptom(sym.label)}
                  className={`symptom-tag ${symptoms.includes(sym.label) ? "selected" : "unselected"}`}
                  id={`symptom-tag-${sym.label.replace(/\s+/g, "-").toLowerCase()}`}
                >
                  <span>{sym.icon}</span>
                  {sym.label}
                  {symptoms.includes(sym.label) && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-blue-500"
                    >
                      ✓
                    </motion.span>
                  )}
                </motion.button>
              ))}
            </div>
          </ScrollCard>

          {/* ── Severity Slider ── */}
          <ScrollCard delay={0.08} tiltDir={-1} className="p-6">
            <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-400" />
              Pain / Discomfort Severity
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">1 – Minimal</span>
                <motion.span
                  key={severity}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-2xl font-bold px-4 py-1 rounded-xl"
                  style={{
                    color: severityInfo.color,
                    background: `${severityInfo.color}18`,
                    border: `1.5px solid ${severityInfo.color}40`,
                  }}
                >
                  {severity} — {severityInfo.label}
                </motion.span>
                <span className="text-sm text-gray-500">10 – Extreme</span>
              </div>
              <input
                type="range"
                id="severity-slider"
                min="1" max="10"
                value={severity}
                onChange={(e) => onChange({ severity: Number(e.target.value) })}
                style={{
                  background: `linear-gradient(to right, ${severityInfo.color} 0%, ${severityInfo.color} ${(severity - 1) * 11.11}%, #e2e8f0 ${(severity - 1) * 11.11}%, #e2e8f0 100%)`,
                }}
                className="w-full h-2 rounded-full cursor-pointer appearance-none"
              />
              <div className="flex justify-between text-xs text-gray-400">
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <span key={n} className={`transition-colors duration-200 ${n === severity ? "font-bold text-blue-500" : ""}`}>{n}</span>
                ))}
              </div>
            </div>
          </ScrollCard>

          {/* ── Duration + Age + Gender ── */}
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                delay: 0.04,
                content: (
                  <>
                    <label className="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-200 text-sm mb-3">
                      <Clock className="w-4 h-4 text-blue-400" /> Duration
                    </label>
                    <div className="relative">
                      <select
                        id="duration-select"
                        value={duration}
                        onChange={(e) => onChange({ duration: e.target.value })}
                        className="medical-input appearance-none pr-8 cursor-pointer"
                      >
                        <option value="">Select duration</option>
                        {DURATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </>
                ),
              },
              {
                delay: 0.1,
                content: (
                  <>
                    <label className="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-200 text-sm mb-3">
                      <User className="w-4 h-4 text-blue-400" /> Age
                    </label>
                    <input
                      type="number"
                      id="age-input"
                      value={age}
                      onChange={(e) => onChange({ age: e.target.value })}
                      placeholder="Your age"
                      min="1" max="120"
                      className="medical-input"
                    />
                  </>
                ),
              },
              {
                delay: 0.16,
                content: (
                  <>
                    <label className="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-200 text-sm mb-3">
                      <span className="text-lg">⚧</span> Gender
                    </label>
                    <div className="flex gap-2">
                      {["Male", "Female", "Other"].map((g) => (
                        <button
                          key={g}
                          id={`gender-${g.toLowerCase()}`}
                          onClick={() => onChange({ gender: g.toLowerCase() })}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            gender === g.toLowerCase()
                              ? "bg-blue-500 text-white shadow-md"
                              : "bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </>
                ),
              },
            ].map((item, i) => (
              <ScrollCard key={i} delay={item.delay} className="p-5">
                {item.content}
              </ScrollCard>
            ))}
          </div>

          {/* ── Analyze Button ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-center pt-4"
          >
            <motion.button
              whileHover={{ scale: 1.04, y: -2, boxShadow: "0 16px 40px rgba(59,150,242,0.45)" }}
              whileTap={{ scale: 0.97 }}
              onClick={onAnalyze}
              disabled={isLoading || (symptoms.length === 0 && !formData.freeText)}
              id="panel-analyze-btn"
              className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-3"
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Analyzing...
                </>
              ) : (
                <>🔬 Run AI Analysis</>
              )}
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
