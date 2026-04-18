import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useMouseParallax } from "../hooks/useMouseParallax";

const STATUS_LABELS = {
  idle: "Ready to assist",
  analyzing: "Analyzing symptoms...",
  complete: "Analysis complete",
};

const STATUS_COLORS = {
  idle: "#3b96f2",
  analyzing: "#eab308",
  complete: "#22c55e",
};

export default function DoctorAvatar({ status = "idle" }) {
  const color = STATUS_COLORS[status];
  const containerRef = useRef(null);

  // ── Mouse parallax for tilt ────────────────────────────────────────────────
  const { x: mouseX, y: mouseY } = useMouseParallax(40, 15);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-12, 12]);
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [6, -6]);
  const avatarX = useTransform(mouseX, [-0.5, 0.5], [-8, 8]);
  const avatarY = useTransform(mouseY, [-0.5, 0.5], [-6, 6]);

  // ── Scroll: glow intensity increases as avatar comes into view ─────────────
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "center center"],
  });
  const smoothScroll = useSpring(scrollYProgress, { stiffness: 50, damping: 18 });

  // Glow brightens as it scrolls into view
  const glowSize = useTransform(smoothScroll, [0, 1], [10, 32]);
  const glowOpacity = useTransform(smoothScroll, [0, 1], [0.3, 0.8]);
  const ringOpacity = useTransform(smoothScroll, [0, 0.6, 1], [0.1, 0.5, 0.4]);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="hidden lg:flex flex-col items-center gap-5 py-8"
      style={{
        rotateY,
        rotateX,
        transformPerspective: 800,
        transformStyle: "preserve-3d",
      }}
    >
      {/* Holographic rings */}
      <div className="relative flex items-center justify-center">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              scale: [1, 1.08 + i * 0.05, 1],
              opacity: [0.3, 0.15, 0.3],
            }}
            transition={{
              duration: 2.5 + i * 0.4,
              delay: i * 0.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ opacity: ringOpacity }}
            className="absolute rounded-full border will-transform"
            style={{
              width: 130 + i * 30,
              height: 130 + i * 30,
              borderColor: `${color}50`,
              opacity: undefined, // let motion handle it
            }}
          />
        ))}

        {/* Doctor avatar body — float + mouse shift */}
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-10 will-transform"
          style={{
            x: avatarX,
            y: avatarY,
            filter: `drop-shadow(0 0 ${glowSize}px ${color}${Math.round(glowOpacity.get() * 255).toString(16).padStart(2, "0")})`,
          }}
        >
          <motion.div
            style={{
              filter: `drop-shadow(0 0 20px ${color}80)`,
            }}
          >
            <svg width="100" height="120" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Body / Coat */}
              <rect x="20" y="65" width="60" height="50" rx="10" fill={`${color}22`} stroke={`${color}80`} strokeWidth="1.5"/>
              {/* Collar */}
              <path d="M42 65 L50 80 L58 65" fill={`${color}18`} stroke={`${color}60`} strokeWidth="1"/>
              {/* Head */}
              <circle cx="50" cy="38" r="24" fill={`${color}15`} stroke={`${color}70`} strokeWidth="1.5"/>
              {/* Eyes */}
              <circle cx="43" cy="35" r="3" fill={color} opacity="0.7"/>
              <circle cx="57" cy="35" r="3" fill={color} opacity="0.7"/>
              {/* Smile */}
              <path d="M43 46 Q50 52 57 46" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7"/>
              {/* Stethoscope */}
              <path d="M35 75 Q30 85 35 90 Q40 95 45 90" stroke={`${color}90`} strokeWidth="2" fill="none" strokeLinecap="round"/>
              <circle cx="45" cy="90" r="4" fill="none" stroke={`${color}90`} strokeWidth="1.5"/>
              {/* Cross */}
              <rect x="47" y="82" width="6" height="2" rx="1" fill={color} opacity="0.8"/>
              <rect x="49" y="80" width="2" height="6" rx="1" fill={color} opacity="0.8"/>
              {/* Hologram lines */}
              <line x1="20" y1="58" x2="80" y2="58" stroke={`${color}30`} strokeWidth="0.5" strokeDasharray="3 3"/>
              <line x1="15" y1="68" x2="85" y2="68" stroke={`${color}20`} strokeWidth="0.5" strokeDasharray="2 4"/>
            </svg>
          </motion.div>
        </motion.div>
      </div>

      {/* Status pill */}
      <div className="flex flex-col items-center gap-2">
        <motion.div
          className="flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/20"
          animate={{ boxShadow: status === "analyzing"
            ? [`0 0 8px ${color}40`, `0 0 20px ${color}80`, `0 0 8px ${color}40`]
            : `0 0 8px ${color}30`,
          }}
          transition={{ duration: 1, repeat: status === "analyzing" ? Infinity : 0 }}
        >
          <motion.div
            animate={
              status === "analyzing"
                ? { scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }
                : { scale: 1, opacity: 1 }
            }
            transition={{ duration: 0.8, repeat: status === "analyzing" ? Infinity : 0 }}
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: color }}
          />
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
            {STATUS_LABELS[status]}
          </span>
        </motion.div>

        <span className="text-xs font-bold gradient-text uppercase tracking-widest">Dr. HealthAI</span>
        <span className="text-[0.65rem] text-gray-400">AI Medical Assistant</span>
      </div>

      {/* Heartbeat line */}
      <div className="w-28 overflow-hidden">
        <svg viewBox="0 0 120 28" className="w-full" style={{ filter: `drop-shadow(0 0 6px ${color})` }}>
          <polyline
            points="0,14 15,14 20,4 25,24 30,14 40,14 48,2 52,26 56,14 70,14 75,8 80,20 85,14 120,14"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="heartbeat-path"
          />
        </svg>
      </div>
    </motion.div>
  );
}
