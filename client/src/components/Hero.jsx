import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Zap, ChevronRight, Sparkles } from "lucide-react";
import { useVoiceInput } from "../hooks/useVoiceInput";

const EXAMPLE_CHIPS = [
  { label: "Fever + Chills", icon: "🌡️" },
  { label: "Chest Pain", icon: "💔" },
  { label: "Headache", icon: "🧠" },
  { label: "Cough + Cold", icon: "🤧" },
  { label: "Fatigue", icon: "😴" },
  { label: "Nausea", icon: "🤢" },
];

const PARTICLES = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  size: Math.random() * 80 + 40,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  delay: Math.random() * 4,
  duration: 6 + Math.random() * 4,
}));

export default function Hero({ onAnalyze, onLoadSample, isLoading }) {
  const [freeText, setFreeText] = useState("");
  const textareaRef = useRef(null);

  const { isListening, toggleListening, isSupported } = useVoiceInput({
    onResult: (text) => {
      setFreeText((prev) => (prev ? prev + " " + text : text));
    },
  });

  const handleChipClick = (chip) => {
    setFreeText((prev) =>
      prev ? `${prev}, ${chip.label}` : chip.label
    );
    textareaRef.current?.focus();
  };

  const handleSubmit = () => {
    if (!freeText.trim()) return;
    onAnalyze({ freeText, symptoms: [], fromHero: true });
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-mesh pt-20"
    >
      {/* Floating particles */}
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: p.size,
            height: p.size,
            left: p.left,
            top: p.top,
            background: `radial-gradient(circle, rgba(59,150,242,0.08), transparent)`,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
            scale: [1, 1.1, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* Large blurred gradient orbs */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-blue-200/30 text-sm font-medium text-blue-600 dark:text-blue-400 mb-8"
        >
          <Sparkles className="w-4 h-4 animate-pulse" />
          Powered by Google Gemini AI
          <Sparkles className="w-4 h-4 animate-pulse" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight tracking-tight"
        >
          Your{" "}
          <span className="gradient-text">AI Health</span>
          <br />
          Assistant
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          Describe your symptoms and receive AI-powered health insights,
          risk assessment, and personalized recommendations — instantly.
        </motion.p>

        {/* Input box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="glass-card p-2 mb-6 relative"
        >
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              id="hero-symptom-input"
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder={
                isListening
                  ? "🎤 Listening... speak your symptoms"
                  : "Describe your symptoms... (e.g. I have a headache and fever for 2 days)"
              }
              className="medical-input resize-none min-h-[80px] flex-1 border-none bg-transparent shadow-none focus:ring-0 text-base"
              rows={3}
            />
            {/* Voice button */}
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
                title={isListening ? "Stop listening" : "Voice input"}
              >
                {isListening ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </motion.button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700/50">
            <motion.button
              whileHover={{ scale: 1.03 }}
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
              whileHover={{ scale: 1.03 }}
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
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-2"
        >
          <span className="text-sm text-gray-400 dark:text-gray-500 self-center">
            Quick:
          </span>
          {EXAMPLE_CHIPS.map((chip, i) => (
            <motion.button
              key={chip.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45 + i * 0.06 }}
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => handleChipClick (chip)}
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
          transition={{ delay: 1 }}
          className="mt-16 flex flex-col items-center gap-2 text-gray-400"
        >
          <span className="text-xs font-medium uppercase tracking-widest">Scroll to fill details</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-5 h-8 border-2 border-gray-300 dark:border-gray-600 rounded-full flex justify-center pt-1.5"
          >
            <div className="w-1 h-2 bg-blue-400 rounded-full" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
