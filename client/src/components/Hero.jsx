import { useState, useRef } from "react";
import {
  motion, AnimatePresence,
  useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate
} from "framer-motion";
import { Mic, MicOff, Zap, ChevronRight, Sparkles } from "lucide-react";
import { useVoiceInput } from "../hooks/useVoiceInput";
import { useMouseParallax } from "../hooks/useMouseParallax";

const EXAMPLE_CHIPS = [
  { label: "Fever + Chills", icon: "🌡️" },
  { label: "Chest Pain", icon: "💔" },
  { label: "Headache", icon: "🧠" },
  { label: "Cough + Cold", icon: "🤧" },
  { label: "Fatigue", icon: "😴" },
  { label: "Nausea", icon: "🤢" },
];

const PARTICLES = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  size: Math.random() * 100 + 50,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  delay: Math.random() * 5,
  duration: 7 + Math.random() * 5,
  parallaxStr: (Math.random() * 0.4 + 0.1).toFixed(2),
}));

export default function Hero({ onAnalyze, onLoadSample, isLoading }) {
  const [freeText, setFreeText] = useState("");
  const textareaRef = useRef(null);
  const heroRef = useRef(null);

  // ── Mouse parallax ────────────────────────────────────────────────────────
  const { x: mouseX, y: mouseY } = useMouseParallax(50, 18);

  // ── Scroll-based transforms ───────────────────────────────────────────────
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // Smooth out the raw scroll value
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 60, damping: 20 });

  // Card zooms forward in 3D as user scrolls down
  const cardScale   = useTransform(smoothProgress, [0, 0.8], [1, 1.12]);
  const cardZ       = useTransform(smoothProgress, [0, 0.8], [0, 60]);

  // Text slides up and fades
  const textY       = useTransform(smoothProgress, [0, 0.5], [0, -60]);
  const textOpacity = useTransform(smoothProgress, [0, 0.45], [1, 0]);

  // Orb parallax (background moves slower than foreground)
  const orbX1 = useTransform(mouseX, [-0.5, 0.5], [-30, 30]);
  const orbY1 = useTransform(mouseY, [-0.5, 0.5], [-20, 20]);
  const orbX2 = useTransform(mouseX, [-0.5, 0.5], [20, -20]);
  const orbY2 = useTransform(mouseY, [-0.5, 0.5], [10, -10]);
  const orbParallaxY = useTransform(smoothProgress, [0, 1], [0, -80]);

  // Scroll indicator fades out immediately
  const scrollIndOpacity = useTransform(smoothProgress, [0, 0.08], [1, 0]);

  // Section background: subtle hue shift
  const bgOpacity = useTransform(smoothProgress, [0, 0.6], [1, 0.6]);

  const { isListening, toggleListening, isSupported } = useVoiceInput({
    onResult: (text) => setFreeText((prev) => (prev ? prev + " " + text : text)),
  });

  const handleChipClick = (chip) => {
    setFreeText((prev) => (prev ? `${prev}, ${chip.label}` : chip.label));
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
      className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-mesh pt-20"
    >
      {/* ── Background gradient orbs with mouse + scroll parallax ── */}
      <motion.div
        className="absolute top-1/4 left-10 w-[28rem] h-[28rem] rounded-full blur-3xl pointer-events-none will-transform"
        style={{
          background: "radial-gradient(circle, rgba(59,150,242,0.13), transparent 70%)",
          x: orbX1,
          y: useTransform([orbY1, orbParallaxY], ([a, b]) => a + b * 0.6),
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-10 w-80 h-80 rounded-full blur-3xl pointer-events-none will-transform"
        style={{
          background: "radial-gradient(circle, rgba(20,184,166,0.12), transparent 70%)",
          x: orbX2,
          y: useTransform([orbY2, orbParallaxY], ([a, b]) => a + b * 0.4),
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] rounded-full blur-[100px] pointer-events-none will-transform"
        style={{
          background: "radial-gradient(circle, rgba(99,102,241,0.06), transparent 60%)",
          y: useTransform(orbParallaxY, v => v * 0.3),
        }}
      />

      {/* ── Floating particles with individual parallax ── */}
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full pointer-events-none will-transform"
          style={{
            width: p.size,
            height: p.size,
            left: p.left,
            top: p.top,
            background: `radial-gradient(circle, rgba(59,150,242,0.07), transparent)`,
            x: useTransform(mouseX, [-0.5, 0.5], [-20 * p.parallaxStr, 20 * p.parallaxStr]),
            y: useTransform(mouseY, [-0.5, 0.5], [-15 * p.parallaxStr, 15 * p.parallaxStr]),
          }}
          animate={{
            y: [0, -25, 0],
            scale: [1, 1.08, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* ── Main content — scroll zoom 3D ── */}
      <motion.div
        className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center will-transform"
        style={{
          scale: cardScale,
          z: cardZ,
          transformPerspective: 1200,
        }}
      >
        {/* Headline group — fades + slides up on scroll */}
        <motion.div style={{ y: textY, opacity: textOpacity }}>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-blue-200/30 text-sm font-medium text-blue-600 dark:text-blue-400 mb-8"
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
            Powered by Google Gemini AI
            <Sparkles className="w-4 h-4 animate-pulse" />
          </motion.div>

          {/* H1 */}
          <motion.h1
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight tracking-tight"
          >
            Your{" "}
            <span className="gradient-text">AI Health</span>
            <br />
            Assistant
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Describe your symptoms and receive AI-powered health insights,
            risk assessment, and personalized recommendations — instantly.
          </motion.p>
        </motion.div>

        {/* Input box — slightly slower scroll effect */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{
            y: useTransform(smoothProgress, [0, 0.6], [0, -30]),
            opacity: useTransform(smoothProgress, [0, 0.55], [1, 0]),
          }}
          className="glass-card p-2 mb-6 relative glow-blue"
          whileHover={{ boxShadow: "0 20px 60px rgba(59,150,242,0.22), inset 0 1px 0 rgba(255,255,255,0.3)" }}
        >
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              id="hero-symptom-input"
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
              }}
              placeholder={
                isListening
                  ? "🎤 Listening... speak your symptoms"
                  : "Describe your symptoms... (e.g. I have a headache and fever for 2 days)"
              }
              className="medical-input resize-none min-h-[80px] flex-1 border-none bg-transparent shadow-none focus:ring-0 text-base"
              rows={3}
            />
            {isSupported && (
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={toggleListening}
                id="voice-input-btn"
                className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  isListening
                    ? "bg-red-500 text-white shadow-lg animate-pulse"
                    : "bg-blue-50 dark:bg-blue-900/30 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-800/40"
                }`}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </motion.button>
            )}
          </div>
          <div className="flex items-center gap-3 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700/50">
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              disabled={!freeText.trim() || isLoading}
              id="hero-analyze-btn"
              className="btn-primary flex items-center gap-2 flex-1 justify-center"
            >
              <Zap className="w-4 h-4" />
              Analyze Symptoms
              <ChevronRight className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={onLoadSample}
              id="try-sample-btn"
              className="btn-ghost flex items-center gap-2 text-sm whitespace-nowrap"
            >
              Try Sample Case
            </motion.button>
          </div>
        </motion.div>

        {/* Example chips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ opacity: useTransform(smoothProgress, [0, 0.4], [1, 0]) }}
          className="flex flex-wrap justify-center gap-2"
        >
          <span className="text-sm text-gray-400 dark:text-gray-500 self-center">Quick:</span>
          {EXAMPLE_CHIPS.map((chip, i) => (
            <motion.button
              key={chip.label}
              initial={{ opacity: 0, scale: 0.75 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ scale: 1.1, y: -3 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => handleChipClick(chip)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-white/60 dark:bg-white/5 border border-blue-100 dark:border-blue-800/40 text-gray-600 dark:text-gray-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 backdrop-blur-sm"
            >
              <span>{chip.icon}</span>
              {chip.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          style={{ opacity: scrollIndOpacity }}
          className="mt-16 flex flex-col items-center gap-2 text-gray-400"
        >
          <span className="text-xs font-medium uppercase tracking-widest">Scroll to fill details</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            className="w-5 h-8 border-2 border-gray-300 dark:border-gray-600 rounded-full flex justify-center pt-1.5"
          >
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4], y: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
              className="w-1 h-2 bg-blue-400 rounded-full"
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
