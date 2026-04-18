import { useState, useRef, Suspense } from "react";
import {
  motion,
  useScroll, useTransform, useSpring,
} from "framer-motion";
import { Mic, MicOff, Zap, ChevronRight, Sparkles } from "lucide-react";
import { useVoiceInput } from "../hooks/useVoiceInput";
import { useMouseParallax } from "../hooks/useMouseParallax";
import { SplineDoctorCard } from "./SplineDoctorCard";

const EXAMPLE_CHIPS = [
  { label: "Fever + Chills", icon: "🌡️" },
  { label: "Chest Pain",     icon: "💔" },
  { label: "Headache",       icon: "🧠" },
  { label: "Cough + Cold",   icon: "🤧" },
  { label: "Fatigue",        icon: "😴" },
  { label: "Nausea",         icon: "🤢" },
];

const PARTICLES = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  size: Math.random() * 90 + 50,
  left: `${Math.random() * 100}%`,
  top:  `${Math.random() * 100}%`,
  delay: Math.random() * 5,
  duration: 7 + Math.random() * 5,
  str: +(Math.random() * 0.4 + 0.1).toFixed(2),
}));

export default function Hero({ onAnalyze, onLoadSample, isLoading }) {
  const [freeText, setFreeText] = useState("");
  const textareaRef = useRef(null);
  const heroRef     = useRef(null);

  // Scroll transforms
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const smooth       = useSpring(scrollYProgress, { stiffness: 60, damping: 20 });
  const textOpacity  = useTransform(smooth, [0, 0.45], [1, 0]);
  const textY        = useTransform(smooth, [0, 0.5], [0, -40]);
  const scrollIndOp  = useTransform(smooth, [0, 0.08], [1, 0]);
  const cardOpacity  = useTransform(smooth, [0, 0.55], [1, 0]);

  // Mouse parallax for background orbs
  const { x: mouseX, y: mouseY } = useMouseParallax(50, 18);
  const orbX1 = useTransform(mouseX, [-0.5, 0.5], [-25, 25]);
  const orbY1 = useTransform(mouseY, [-0.5, 0.5], [-18, 18]);
  const orbX2 = useTransform(mouseX, [-0.5, 0.5], [18, -18]);
  const orbY2 = useTransform(mouseY, [-0.5, 0.5], [10, -10]);

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
      className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-mesh pt-20 pb-8"
    >
      {/* Background orbs */}
      <motion.div className="absolute top-1/4 left-10 w-[26rem] h-[26rem] rounded-full blur-3xl pointer-events-none will-transform"
        style={{ background: "radial-gradient(circle, rgba(59,150,242,0.12), transparent 70%)", x: orbX1, y: orbY1 }} />
      <motion.div className="absolute bottom-1/4 right-10 w-72 h-72 rounded-full blur-3xl pointer-events-none will-transform"
        style={{ background: "radial-gradient(circle, rgba(20,184,166,0.1), transparent 70%)", x: orbX2, y: orbY2 }} />

      {/* Floating particles */}
      {PARTICLES.map((p) => (
        <motion.div key={p.id}
          className="absolute rounded-full pointer-events-none will-transform"
          style={{
            width: p.size, height: p.size, left: p.left, top: p.top,
            background: "radial-gradient(circle, rgba(59,150,242,0.07), transparent)",
          }}
          animate={{ y: [0, -22, 0], scale: [1, 1.08, 1], opacity: [0.25, 0.5, 0.25] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* ── Two-column layout ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 flex flex-col lg:flex-row items-center gap-10 lg:gap-12">

        {/* ── LEFT: Text + Input ── */}
        <div className="flex-1 min-w-0 text-center lg:text-left">
          <motion.div style={{ y: textY, opacity: textOpacity }}>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-blue-200/30 text-sm font-medium text-blue-600 dark:text-blue-400 mb-6"
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
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-5 leading-tight tracking-tight"
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
              className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 mb-8 max-w-xl leading-relaxed lg:mx-0 mx-auto"
            >
              Describe your symptoms and receive AI-powered health insights,
              risk assessment, and personalized recommendations — instantly.
            </motion.p>
          </motion.div>

          {/* Input box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ opacity: cardOpacity }}
            className="glass-card p-2 mb-5 relative glow-blue"
            whileHover={{ boxShadow: "0 20px 60px rgba(59,150,242,0.2), inset 0 1px 0 rgba(255,255,255,0.25)" }}
          >
            <div className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                id="hero-symptom-input"
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                placeholder={isListening ? "🎤 Listening... speak your symptoms" : "Describe your symptoms... (e.g. I have a headache and fever for 2 days)"}
                className="medical-input resize-none min-h-[80px] flex-1 border-none bg-transparent shadow-none focus:ring-0 text-base"
                rows={3}
              />
              {isSupported && (
                <motion.button
                  whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                  onClick={toggleListening} id="voice-input-btn"
                  className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                    isListening ? "bg-red-500 text-white shadow-lg animate-pulse" : "bg-blue-50 dark:bg-blue-900/30 text-blue-500 hover:bg-blue-100"
                  }`}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </motion.button>
              )}
            </div>
            <div className="flex items-center gap-3 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700/50">
              <motion.button
                whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
                onClick={handleSubmit} disabled={!freeText.trim() || isLoading}
                id="hero-analyze-btn" className="btn-primary flex items-center gap-2 flex-1 justify-center"
              >
                <Zap className="w-4 h-4" /> Analyze Symptoms <ChevronRight className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={onLoadSample} id="try-sample-btn" className="btn-ghost text-sm whitespace-nowrap"
              >
                Try Sample Case
              </motion.button>
            </div>
          </motion.div>

          {/* Quick chips */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
            style={{ opacity: cardOpacity }}
            className="flex flex-wrap justify-center lg:justify-start gap-2 mb-6"
          >
            <span className="text-sm text-gray-400 dark:text-gray-500 self-center">Quick:</span>
            {EXAMPLE_CHIPS.map((chip, i) => (
              <motion.button
                key={chip.label}
                initial={{ opacity: 0, scale: 0.78 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.47 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ scale: 1.1, y: -3 }} whileTap={{ scale: 0.94 }}
                onClick={() => handleChipClick(chip)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-white/60 dark:bg-white/5 border border-blue-100 dark:border-blue-800/40 text-gray-600 dark:text-gray-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all backdrop-blur-sm"
              >
                <span>{chip.icon}</span>{chip.label}
              </motion.button>
            ))}
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
            style={{ opacity: scrollIndOp }}
            className="hidden lg:flex flex-col items-start gap-2 text-gray-400"
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
        </div>

        {/* ── RIGHT: 3D Spline Doctor Card ── */}
        <motion.div
          initial={{ opacity: 0, x: 50, scale: 0.92 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ opacity: cardOpacity }}
          className="w-full lg:w-[500px] xl:w-[560px] flex-shrink-0"
        >
          <SplineDoctorCard />
        </motion.div>

      </div>
    </section>
  );
}
