import { useState, useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Clock, User, AlertCircle, ChevronDown, Thermometer, Brain, Wind, Speech, HeartPulse, Activity, Frown, Sparkles, Moon, Bone, TestTube, Pill, Droplets, Utensils, Eye, Droplet, Stethoscope, Users, Microscope } from "lucide-react";

const COMMON_SYMPTOMS = [
  { label: "Fever", icon: <Thermometer aria-hidden="true" className="w-4 h-4" /> },
  { label: "Headache", icon: <Brain aria-hidden="true" className="w-4 h-4" /> },
  { label: "Cough", icon: <Wind aria-hidden="true" className="w-4 h-4" /> },
  { label: "Sore Throat", icon: <Speech aria-hidden="true" className="w-4 h-4" /> },
  { label: "Chest Pain", icon: <HeartPulse aria-hidden="true" className="w-4 h-4" /> },
  { label: "Shortness of Breath", icon: <Activity aria-hidden="true" className="w-4 h-4" /> },
  { label: "Nausea", icon: <Frown aria-hidden="true" className="w-4 h-4" /> },
  { label: "Dizziness", icon: <Sparkles aria-hidden="true" className="w-4 h-4" /> },
  { label: "Fatigue", icon: <Moon aria-hidden="true" className="w-4 h-4" /> },
  { label: "Body Aches", icon: <Bone aria-hidden="true" className="w-4 h-4" /> },
  { label: "Back Pain", icon: <Activity aria-hidden="true" className="w-4 h-4" /> },
  { label: "Abdominal Pain", icon: <TestTube aria-hidden="true" className="w-4 h-4" /> },
  { label: "Diarrhea", icon: <Pill aria-hidden="true" className="w-4 h-4" /> },
  { label: "Vomiting", icon: <Frown aria-hidden="true" className="w-4 h-4" /> },
  { label: "Rash", icon: <Droplets aria-hidden="true" className="w-4 h-4" /> },
  { label: "Chills", icon: <Thermometer aria-hidden="true" className="w-4 h-4" /> },
  { label: "Sweating", icon: <Droplet aria-hidden="true" className="w-4 h-4" /> },
  { label: "Loss of Appetite", icon: <Utensils aria-hidden="true" className="w-4 h-4" /> },
  { label: "Runny Nose", icon: <Wind aria-hidden="true" className="w-4 h-4" /> },
  { label: "Eye Pain", icon: <Eye aria-hidden="true" className="w-4 h-4" /> },
  { label: "Swelling", icon: <Activity aria-hidden="true" className="w-4 h-4" /> },
  { label: "Joint Pain", icon: <Bone aria-hidden="true" className="w-4 h-4" /> },
];

const DURATIONS = [
  "Less than 1 hour", "1-6 hours", "6-12 hours", "1 day",
  "2-3 days", "4-7 days", "1-2 weeks", "More than 2 weeks",
];

function getSeverityLabel(val) {
  if (val <= 2) return { label: "Very Mild",   color: "#a1a1aa" }; // zinc-400
  if (val <= 4) return { label: "Mild",         color: "#d4d4d8" }; // zinc-300
  if (val <= 6) return { label: "Moderate",     color: "#f4f4f5" }; // zinc-100
  if (val <= 8) return { label: "Severe",       color: "#ffffff" }; // white
  return             { label: "Very Severe",  color: "#ffffff" }; // white
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
      className={`relative rounded-2xl overflow-hidden bg-zinc-950 border border-white/10 shadow-xl ${className}`}
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
    <section ref={sectionRef} id="symptom-panel" aria-labelledby="symptom-panel-heading" className="py-16 px-4 sm:px-6 bg-black">
      <div className="max-w-4xl mx-auto">

        {/* Section header — scroll-reveals with perspective */}
        <motion.div
          style={{ y: sectionY, opacity: sectionOpacity, rotateX: sectionRotateX, transformPerspective: 800 }}
          className="text-center mb-10 will-transform"
        >
          <span className="text-[10px] sm:text-xs font-semibold text-zinc-500 uppercase tracking-widest border border-white/10 px-3 py-1 rounded-full">Step 2</span>
          <h2 id="symptom-panel-heading" className="text-3xl sm:text-4xl font-bold mt-4 mb-3 text-white">
            Describe Your <span className="text-zinc-400">Symptoms</span>
          </h2>
          <p className="text-zinc-500 max-w-lg mx-auto">
            Select all that apply and fill in the details for accurate analysis.
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* ── Symptom Tags — staggered float-up ── */}
          <ScrollCard delay={0} className="p-6" role="group" aria-labelledby="symptoms-heading">
            <h3 id="symptoms-heading" className="font-semibold text-white mb-4 flex items-center gap-2">
              <Stethoscope aria-hidden="true" className="w-5 h-5 text-zinc-400" />
              Select Symptoms
              {symptoms.length > 0 && (
                <motion.span
                  key={symptoms.length}
                  initial={{ scale: 0.7 }}
                  animate={{ scale: 1 }}
                  className="ml-auto text-xs font-medium bg-white/10 text-zinc-300 px-2 py-1 rounded-full"
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
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => toggleSymptom(sym.label)}
                  aria-pressed={symptoms.includes(sym.label)}
                  aria-label={`${sym.label}${symptoms.includes(sym.label) ? ', selected' : ''}`}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all border outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white focus-visible:ring-offset-black ${
                    symptoms.includes(sym.label)
                      ? "bg-white text-black border-white"
                      : "bg-black/40 text-zinc-400 border-white/10 hover:border-white/30 hover:text-white focus-visible:border-white"
                  }`}
                  id={`symptom-tag-${sym.label.replace(/\s+/g, "-").toLowerCase()}`}
                >
                  <span className={symptoms.includes(sym.label) ? "text-black" : "text-zinc-500"}>{sym.icon}</span>
                  {sym.label}
                </motion.button>
              ))}
            </div>
          </ScrollCard>

          {/* ── Severity Slider ── */}
          <ScrollCard delay={0.08} tiltDir={-1} className="p-6">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <AlertCircle aria-hidden="true" className="w-5 h-5 text-zinc-400" />
              Pain / Discomfort Severity
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-zinc-300">1 – Minimal</span>
                <motion.span
                  key={severity}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-2xl font-bold px-4 py-1 rounded-xl"
                  style={{
                    color: severityInfo.color,
                    background: `rgba(255,255,255,0.05)`,
                    border: `1px solid rgba(255,255,255,0.1)`,
                  }}
                >
                  {severity} — {severityInfo.label}
                </motion.span>
                <span className="text-sm font-medium text-zinc-300">10 – Extreme</span>
              </div>
              <input
                type="range"
                id="severity-slider"
                min="1" max="10"
                value={severity}
                onChange={(e) => onChange({ severity: Number(e.target.value) })}
                aria-label={`Symptom severity: ${severity} out of 10 — ${severityInfo.label}`}
                aria-valuemin={1}
                aria-valuemax={10}
                aria-valuenow={severity}
                aria-valuetext={`${severity} — ${severityInfo.label}`}
                style={{
                  background: `linear-gradient(to right, ${severityInfo.color} 0%, ${severityInfo.color} ${(severity - 1) * 11.11}%, #27272a ${(severity - 1) * 11.11}%, #27272a 100%)`, // zinc-800
                }}
                className="w-full h-2 rounded-full cursor-pointer appearance-none outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-black"
              />
              <div className="flex justify-between text-xs text-zinc-600">
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <span key={n} className={`transition-colors duration-200 ${n === severity ? "font-bold text-white" : ""}`}>{n}</span>
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
                    <label htmlFor="duration-select" className="flex items-center gap-2 font-semibold text-zinc-300 text-sm mb-3">
                      <Clock aria-hidden="true" className="w-4 h-4 text-zinc-400" /> Duration
                    </label>
                    <div className="relative">
                      <select
                        id="duration-select"
                        value={duration}
                        onChange={(e) => onChange({ duration: e.target.value })}
                        className="w-full bg-black/50 border border-white/10 text-white text-sm rounded-lg py-2.5 pl-3 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/50 transition-all cursor-pointer"
                      >
                        <option value="" className="bg-black">Select duration</option>
                        {DURATIONS.map((d) => <option key={d} value={d} className="bg-black">{d}</option>)}
                      </select>
                      <ChevronDown aria-hidden="true" className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                    </div>
                  </>
                ),
              },
              {
                delay: 0.1,
                content: (
                  <>
                    <label htmlFor="age-input" className="flex items-center gap-2 font-semibold text-zinc-300 text-sm mb-3">
                      <User aria-hidden="true" className="w-4 h-4 text-zinc-400" /> Age
                    </label>
                    <input
                      type="number"
                      id="age-input"
                      value={age}
                      onChange={(e) => onChange({ age: e.target.value })}
                      placeholder="Your age"
                      min="1" max="120"
                      className="w-full bg-black/50 border border-white/10 text-white placeholder-zinc-600 text-sm rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/50 transition-all"
                    />
                  </>
                ),
              },
              {
                delay: 0.16,
                content: (
                  <>
                    <label id="gender-label-master" className="flex items-center gap-2 font-semibold text-zinc-300 text-sm mb-3">
                      <Users aria-hidden="true" className="w-4 h-4 text-zinc-400" /> Gender
                    </label>
                    <div className="flex gap-2" role="group" aria-labelledby="gender-label-master">
                      <span id="gender-label" className="sr-only">Select gender</span>
                      {["Male", "Female", "Other"].map((g) => (
                        <button
                          key={g}
                          id={`gender-${g.toLowerCase()}`}
                          onClick={() => onChange({ gender: g.toLowerCase() })}
                          aria-pressed={gender === g.toLowerCase()}
                          aria-label={`Gender: ${g}`}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border outline-none focus-visible:ring-2 focus-visible:ring-white ${
                            gender === g.toLowerCase()
                              ? "bg-white text-black border-white shadow-md"
                              : "bg-black/50 border-white/10 text-zinc-400 hover:text-white hover:border-white/30 focus-visible:border-white"
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
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onAnalyze}
              disabled={isLoading || (symptoms.length === 0 && !formData.freeText)}
              id="panel-analyze-btn"
              aria-label={isLoading ? 'Analyzing symptoms, please wait' : 'Run AI analysis of your symptoms'}
              aria-busy={isLoading}
              className="font-medium text-black bg-white hover:bg-zinc-200 transition-all text-base px-8 py-3.5 rounded-xl inline-flex items-center gap-3 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full"
                  />
                  Analyzing...
                </>
              ) : (
                <>
                   <Microscope aria-hidden="true" className="w-5 h-5 border border-black rounded-full p-[2px]" /> Run AI Analysis
                </>
              )}
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
