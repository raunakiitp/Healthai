import { useState, useRef } from "react";
import {
  motion,
  useScroll, useTransform, useSpring,
} from "framer-motion";
import { Mic, MicOff, Zap, ChevronRight, Sparkles, Activity } from "lucide-react";
import { useVoiceInput } from "../hooks/useVoiceInput";
import { useMouseParallax } from "../hooks/useMouseParallax";
import { SplineScene } from "./ui/SplineScene";
import { Spotlight } from "./ui/Spotlight";

// ── Spline doctor/robot scene ──────────────────────────────────────────────────
const SPLINE_SCENE = "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode";

const EXAMPLE_CHIPS = [
  { label: "Fever + Chills", icon: "🌡️" },
  { label: "Chest Pain",     icon: "💔" },
  { label: "Headache",       icon: "🧠" },
  { label: "Cough + Cold",   icon: "🤧" },
  { label: "Fatigue",        icon: "😴" },
  { label: "Nausea",         icon: "🤢" },
];

export default function Hero({ onAnalyze, onLoadSample, isLoading }) {
  const [freeText, setFreeText] = useState("");
  const textareaRef = useRef(null);
  const heroRef     = useRef(null);

  // Scroll: content fades as user scrolls away
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const smooth      = useSpring(scrollYProgress, { stiffness: 60, damping: 20 });
  const contentY    = useTransform(smooth, [0, 0.6], [0, -80]);
  const contentOp   = useTransform(smooth, [0, 0.5], [1, 0]);
  const sceneScale  = useTransform(smooth, [0, 1], [1, 1.08]);
  const scrollIndOp = useTransform(smooth, [0, 0.1], [1, 0]);

  // Mouse parallax — subtle scene shift
  const { x: mouseX, y: mouseY } = useMouseParallax(40, 16);
  const sceneX = useTransform(mouseX, [-0.5, 0.5], [-18, 18]);
  const sceneY = useTransform(mouseY, [-0.5, 0.5], [-10, 10]);

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
        className="absolute inset-0 w-full h-full will-transform"
        style={{ scale: sceneScale, x: sceneX, y: sceneY }}
      >
        <SplineScene
          scene={SPLINE_SCENE}
          className="w-full h-full"
        />
      </motion.div>

      {/* ════════════════════════════════════════════════════
          LAYER 1 — Gradient overlays for readability
          ════════════════════════════════════════════════════ */}
      {/* Top vignette — hides nav seam */}
      <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none z-10"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)" }} />

      {/* Bottom vignette — grounds content */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 pointer-events-none z-10"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)" }} />

      {/* Subtle side vignettes */}
      <div className="absolute inset-y-0 left-0 w-32 pointer-events-none z-10"
        style={{ background: "linear-gradient(to right, rgba(0,0,0,0.4), transparent)" }} />
      <div className="absolute inset-y-0 right-0 w-32 pointer-events-none z-10"
        style={{ background: "linear-gradient(to left, rgba(0,0,0,0.4), transparent)" }} />

      {/* ════════════════════════════════════════════════════
          LAYER 2 — Spotlight beams (decorative)
          ════════════════════════════════════════════════════ */}
      <Spotlight
        className="z-10 -top-40 left-1/4 opacity-60"
        fill="#3b96f2"
      />
      <Spotlight
        className="z-10 -top-40 right-1/4 opacity-40"
        fill="#14b8a6"
      />

      {/* ════════════════════════════════════════════════════
          LAYER 3 — Floating UI content (on robot's chest)
          ════════════════════════════════════════════════════ */}
      <motion.div
        className="absolute inset-0 z-20 flex flex-col items-center justify-end pb-12 pt-24 px-4"
        style={{ y: contentY, opacity: contentOp }}
      >
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-5">

          {/* ── Status badge ── */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-blue-400/30 bg-black/40 backdrop-blur-md text-xs font-semibold text-blue-300 uppercase tracking-widest"
          >
            <motion.span
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-blue-400 inline-block"
            />
            <Activity className="w-3.5 h-3.5" />
            AI Medical Consultant · Dr. HealthAI
          </motion.div>

          {/* ── Headline — floats on robot's chest ── */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight mb-3">
              <span className="text-white drop-shadow-[0_2px_24px_rgba(59,150,242,0.6)]">
                Your
              </span>{" "}
              <span
                className="gradient-text drop-shadow-[0_2px_32px_rgba(59,150,242,0.8)]"
                style={{ textShadow: "0 0 40px rgba(59,150,242,0.5)" }}
              >
                AI Health
              </span>
              <br />
              <span className="text-white drop-shadow-[0_2px_24px_rgba(20,184,166,0.5)]">
                Assistant
              </span>
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="text-sm sm:text-base text-blue-100/80 max-w-md mx-auto leading-relaxed"
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
                background: "rgba(0,0,0,0.55)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(59,150,242,0.25)",
                boxShadow: "0 8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07), 0 0 60px rgba(59,150,242,0.08)",
              }}
            >
              {/* Top glow line */}
              <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />

              <div className="p-4">
                <div className="flex items-end gap-2">
                  <textarea
                    ref={textareaRef}
                    id="hero-symptom-input"
                    value={freeText}
                    onChange={(e) => setFreeText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                    placeholder={isListening ? "🎤 Listening… speak your symptoms" : "Describe your symptoms… (e.g. fever and headache for 2 days)"}
                    className="flex-1 resize-none bg-transparent text-white placeholder-blue-200/40 text-sm leading-relaxed focus:outline-none min-h-[64px] py-1"
                    rows={3}
                  />
                  {isSupported && (
                    <motion.button
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      onClick={toggleListening}
                      id="voice-input-btn"
                      className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                        isListening
                          ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/40"
                          : "bg-blue-500/20 border border-blue-400/30 text-blue-300 hover:bg-blue-500/30"
                      }`}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </motion.button>
                  )}
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent my-3" />

                {/* CTA buttons */}
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(59,150,242,0.5)" }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSubmit}
                    disabled={!freeText.trim() || isLoading}
                    id="hero-analyze-btn"
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, #3b96f2, #14b8a6)" }}
                  >
                    <Zap className="w-4 h-4" />
                    {isLoading ? "Analyzing…" : "Analyze Symptoms"}
                    {!isLoading && <ChevronRight className="w-4 h-4" />}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={onLoadSample}
                    id="try-sample-btn"
                    className="px-4 py-2.5 rounded-xl text-sm font-medium text-blue-300 border border-blue-400/25 bg-blue-500/10 hover:bg-blue-500/20 transition-all whitespace-nowrap"
                  >
                    Try Sample
                  </motion.button>
                </div>
              </div>

              {/* Bottom glow */}
              <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-teal-400/30 to-transparent" />
            </div>
          </motion.div>

          {/* ── Quick chips ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap justify-center gap-2"
          >
            <span className="text-xs text-blue-300/60 self-center font-medium">Quick:</span>
            {EXAMPLE_CHIPS.map((chip, i) => (
              <motion.button
                key={chip.label}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.55 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ scale: 1.1, y: -3 }}
                whileTap={{ scale: 0.93 }}
                onClick={() => handleChipClick(chip)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white/80 border border-white/10 hover:border-blue-400/50 hover:text-blue-300 transition-all"
                style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(12px)" }}
              >
                {chip.icon} {chip.label}
              </motion.button>
            ))}
          </motion.div>

          {/* ── Powered by badge ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="flex items-center gap-1.5 text-[0.65rem] text-white/30 uppercase tracking-widest"
          >
            <Sparkles className="w-3 h-3 text-blue-400/50" />
            Powered by Google Gemini AI
            <Sparkles className="w-3 h-3 text-blue-400/50" />
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
            className="w-1 h-2 bg-blue-400/60 rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
