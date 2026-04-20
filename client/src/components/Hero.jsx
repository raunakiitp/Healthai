import { useState, useRef } from "react";
import {
  motion,
  useScroll, useTransform, useSpring,
} from "framer-motion";
import { Mic, MicOff, Zap, ChevronRight, Sparkles, Activity, Thermometer, Brain, Wind, Moon, Frown, HeartPulse } from "lucide-react";
import { useVoiceInput } from "../hooks/useVoiceInput";
import { SplineScene } from "./ui/SplineScene";

// ── Spline doctor/robot scene ──────────────────────────────────────────────────
const SPLINE_SCENE = "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode";

const EXAMPLE_CHIPS = [
  { label: "Fever + Chills", icon: <Thermometer aria-hidden="true" className="w-3.5 h-3.5" /> },
  { label: "Chest Pain",     icon: <HeartPulse aria-hidden="true" className="w-3.5 h-3.5" /> },
  { label: "Headache",       icon: <Brain aria-hidden="true" className="w-3.5 h-3.5" /> },
  { label: "Cough + Cold",   icon: <Wind aria-hidden="true" className="w-3.5 h-3.5" /> },
  { label: "Fatigue",        icon: <Moon aria-hidden="true" className="w-3.5 h-3.5" /> },
  { label: "Nausea",         icon: <Frown aria-hidden="true" className="w-3.5 h-3.5" /> },
];

export default function Hero({ onAnalyze, onLoadSample, isLoading }) {
  const [freeText, setFreeText] = useState("");
  const textareaRef = useRef(null);
  const heroRef     = useRef(null);

  // Scroll: content fades as user scrolls away
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const smooth      = useSpring(scrollYProgress, { stiffness: 60, damping: 20 });
  const contentY    = useTransform(smooth, [0, 0.6], [60, -20]);
  const contentOp   = useTransform(smooth, [0, 0.5], [1, 0]);
  const sceneScale  = useTransform(smooth, [0, 1], [2.4, 2.48]);
  const scrollIndOp = useTransform(smooth, [0, 0.1], [1, 0]);

  const { isListening, toggleListening, isSupported } = useVoiceInput({
    onResult: (text) => setFreeText((p) => (p ? p + " " + text : text)),
  });

  const handleChipClick = (chip) => {
    setFreeText((p) => (p ? `${p}, ${chip.label}` : chip.label));
    textareaRef.current?.focus();
  };

  const handleSubmit = () => {
    if (!freeText.trim()) return;
    onAnalyze({ freeText, symptoms: [], fromHero: true });
  };

  return (
    <section
      ref={heroRef}
      id="hero"
      className="relative w-full min-h-screen overflow-hidden bg-black"
    >
      {/* ════════════════════════════════════════════════════
          LAYER 0 — Full-screen Spline 3D robot (background)
          ════════════════════════════════════════════════════ */}
      <motion.div
        className="absolute inset-0 w-full h-full will-transform pointer-events-auto"
        style={{ scale: sceneScale, transformOrigin: "center 30%" }}
      >
        <SplineScene
          scene={SPLINE_SCENE}
          className="w-full h-full"
        />
      </motion.div>

      {/* ════════════════════════════════════════════════════
          LAYER 1 — Gradient overlays for readability
          ════════════════════════════════════════════════════ */}
      {/* Top vignette */}
      <div className="absolute top-0 left-0 right-0 h-40 pointer-events-none z-10"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, transparent 100%)" }} />

      {/* Bottom vignette */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 pointer-events-none z-10"
           style={{ background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)" }} />

      {/* Side vignettes */}
      <div className="absolute inset-y-0 left-0 w-48 pointer-events-none z-10"
           style={{ background: "linear-gradient(to right, rgba(0,0,0,0.7), transparent)" }} />
      <div className="absolute inset-y-0 right-0 w-48 pointer-events-none z-10"
           style={{ background: "linear-gradient(to left, rgba(0,0,0,0.7), transparent)" }} />

      {/* ════════════════════════════════════════════════════
          LAYER 3 — Floating UI content (on robot's chest)
          ════════════════════════════════════════════════════ */}
      <motion.div
        className="absolute inset-0 z-20 flex flex-col items-center justify-end pb-2 sm:pb-4 pt-40 px-4 pointer-events-none"
        style={{ y: contentY, opacity: contentOp }}
      >
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-2 sm:gap-3 pointer-events-auto">

          {/* ── Status badge ── */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-black text-[10px] sm:text-xs font-semibold text-zinc-300 uppercase tracking-widest"
          >
             <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-zinc-300 inline-block"
              aria-hidden="true"
            />
            <Activity aria-hidden="true" className="w-3 h-3" />
            AI Medical Consultant
          </motion.div>

          {/* ── Headline — floats on robot's chest ── */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-[4rem] font-bold leading-tight tracking-tight mb-2 text-white">
              Your AI Health
              <br />
              <span className="text-zinc-400">
                Assistant
              </span>
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed"
            >
              Describe your symptoms — get AI-powered diagnosis, risk assessment &amp; recommendations instantly.
            </motion.p>
          </motion.div>

          {/* ── Glassmorphism input card ── */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-full relative"
          >
            {/* Glass card */}
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                background: "rgba(10,10,12,0.9)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {/* Top glow line */}
              <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              <div className="p-4">
                <div className="flex items-end gap-2">
                  <label htmlFor="hero-symptom-input" className="sr-only">
                    Detailed symptom description
                  </label>
                  <textarea
                    ref={textareaRef}
                    id="hero-symptom-input"
                    value={freeText}
                    onChange={(e) => setFreeText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                    placeholder={isListening ? "🎤 Listening… speak your symptoms" : "Describe your symptoms…"}
                    className="flex-1 resize-none bg-transparent text-white placeholder-zinc-500 text-sm leading-relaxed focus:outline-none min-h-[64px] py-1 border-none focus:ring-0"
                    rows={3}
                  />
                  {isSupported && (
                    <motion.button
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={toggleListening}
                      id="voice-input-btn"
                      className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all outline-none focus-visible:ring-2 focus-visible:ring-white ${
                        isListening
                          ? "bg-white/20 text-white animate-pulse"
                          : "bg-white/5 border border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white focus-visible:border-white"
                      }`}
                    >
                      {isListening ? <MicOff aria-hidden="true" className="w-4 h-4" /> : <Mic aria-hidden="true" className="w-4 h-4" />}
                    </motion.button>
                  )}
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-3" />

                {/* CTA buttons */}
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    disabled={!freeText.trim() || isLoading}
                    id="hero-analyze-btn"
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-sm text-black bg-white hover:bg-zinc-200 transition-all outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white focus-visible:ring-offset-black disabled:opacity-50"
                  >
                    <Zap aria-hidden="true" className="w-4 h-4 border border-black rounded-full p-[2px]" />
                    {isLoading ? "Analyzing…" : "Analyze Symptoms"}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={onLoadSample}
                    id="try-sample-btn"
                    className="px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-300 border border-white/10 bg-white/5 hover:bg-white/10 transition-all outline-none focus-visible:ring-2 focus-visible:ring-white whitespace-nowrap"
                  >
                    Try Sample
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Quick chips ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap justify-center gap-2"
          >
            <span className="text-xs text-zinc-500 self-center font-medium">Quick:</span>
            {EXAMPLE_CHIPS.map((chip, i) => (
              <motion.button
                key={chip.label}
                 initial={{ opacity: 0, scale: 0.7 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: 0.55 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                 whileHover={{ scale: 1.05, y: -2 }}
                 whileTap={{ scale: 0.95 }}
                 onClick={() => handleChipClick(chip)}
                 className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-zinc-300 border border-white/10 hover:border-white/20 hover:text-white transition-all bg-black/80 outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:border-white"
              >
                {chip.icon} <span className="ml-0.5">{chip.label}</span>
              </motion.button>
            ))}
          </motion.div>

          {/* ── Powered by badge ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="flex items-center gap-1.5 text-[0.65rem] text-zinc-600 uppercase tracking-widest mt-2"
          >
            <Sparkles aria-hidden="true" className="w-3 h-3 text-zinc-600" />
            Powered by Google Gemini AI
            <Sparkles aria-hidden="true" className="w-3 h-3 text-zinc-600" />
          </motion.div>
        </div>
      </motion.div>

      {/* ════════════════════════════════════════════════════
          LAYER 4 — Scroll indicator
          ════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        style={{ opacity: scrollIndOp }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2"
      >
        <span className="text-[0.6rem] text-white/30 uppercase tracking-[0.2em]">Scroll</span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
          className="w-5 h-8 border border-white/20 rounded-full flex justify-center pt-1.5"
        >
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3], y: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            className="w-1 h-2 bg-white/60 rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
