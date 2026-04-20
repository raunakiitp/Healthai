import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import { Microscope, ShieldCheck, AlertTriangle, AlertOctagon, ListTodo, Home } from "lucide-react";

// Animated counter
function Counter({ target, suffix = "", duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: "-100px" });

  useEffect(() => {
    if (!inView) { setCount(0); return; }
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.round(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// The ECG SVG path
const ECG_PATH = "M0,50 L60,50 L80,50 L90,10 L100,90 L110,50 L140,50 L155,30 L165,70 L175,50 L220,50 L235,20 L245,80 L255,50 L300,50 L310,50 L330,50 L370,50 L385,15 L395,85 L405,50 L450,50 L460,50 L520,50";

export default function ScrollInsightSection({ result }) {
  const sectionRef = useRef(null);
  const ecgRef = useRef(null);
  const ecgInView = useInView(ecgRef, { once: false, margin: "-120px" });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 50, damping: 18 });

  // Parallax backgrounds
  const bgY = useTransform(smoothProgress, [0, 1], [-40, 40]);
  const contentY = useTransform(scrollYProgress, [0, 1], [30, -30]);

  // ECG path animation driven by scroll + inView
  const [ecgKey, setEcgKey] = useState(0);
  useEffect(() => {
    if (ecgInView) setEcgKey(k => k + 1);
  }, [ecgInView]);

  const conditionCount = result?.conditions?.length || 0;
  const actionCount = result?.actions?.length || 0;
  const riskLabel = result?.risk_level
    ? result.risk_level.charAt(0).toUpperCase() + result.risk_level.slice(1)
    : "—";

  const getRiskIcon = (level) => {
    switch (level) {
      case "high": return <AlertOctagon className="w-6 h-6 text-red-500 mx-auto" />;
      case "medium": return <AlertTriangle className="w-6 h-6 text-zinc-400 mx-auto" />;
      default: return <ShieldCheck className="w-6 h-6 text-white/50 mx-auto" />;
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative py-24 px-4 sm:px-6 overflow-hidden bg-black"
    >
      {/* Parallax radial backdrop */}
      <motion.div
        className="absolute inset-0 pointer-events-none will-transform"
        style={{ y: bgY }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-[90px] bg-white/5" />
      </motion.div>

      <motion.div
        className="relative max-w-4xl mx-auto will-transform"
        style={{ y: contentY }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12"
        >
          <span className="text-[10px] sm:text-xs font-semibold text-zinc-500 uppercase tracking-widest border border-white/10 px-3 py-1 rounded-full">Analysis Summary</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-4 text-white">
            Your <span className="text-zinc-400">Health Snapshot</span>
          </h2>
          <p className="text-zinc-500 mt-3 text-sm max-w-md mx-auto">
            Real-time AI clinical summary — scroll to explore
          </p>
        </motion.div>

        {/* ECG Line */}
        <div ref={ecgRef} className="mb-14">
          <motion.div
            initial={{ opacity: 0, scaleX: 0.8 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <svg
              key={ecgKey}
              viewBox="0 0 520 100"
              className="w-full ecg-svg"
              style={{ height: 80, filter: "drop-shadow(0 0 8px rgba(255,255,255,0.2))" }}
            >
              <defs>
                <linearGradient id="ecgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.1"/>
                  <stop offset="50%"  stopColor="#ffffff" stopOpacity="0.8"/>
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1"/>
                </linearGradient>
              </defs>
              {/* Background baseline */}
              <line x1="0" y1="50" x2="520" y2="50" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4 4"/>
              {/* Animated ECG */}
              <path
                d={ECG_PATH}
                fill="none"
                stroke="url(#ecgGrad)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={ecgInView ? "ecg-path animating" : "ecg-path"}
              />
              {/* Glowing dot at end */}
              {ecgInView && (
                <motion.circle
                  cx="520" cy="50" r="5"
                  fill="#ffffff"
                  className="ecg-dot"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.4 }}
                />
              )}
            </svg>
          </motion.div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Conditions Found", value: conditionCount, suffix: "", icon: <Microscope className="w-6 h-6 text-zinc-400 mx-auto" />, delay: 0 },
            { label: "Risk Level", value: riskLabel, raw: true, icon: getRiskIcon(result?.risk_level), delay: 0.06 },
            { label: "Actions Suggested", value: actionCount, suffix: "", icon: <ListTodo className="w-6 h-6 text-zinc-400 mx-auto" />, delay: 0.12 },
            { label: "Home Remedies", value: result?.home_care?.length || 0, suffix: "", icon: <Home className="w-6 h-6 text-zinc-400 mx-auto" />, delay: 0.18 },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 40, scale: 0.92 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: false, margin: "-60px" }}
              transition={{ duration: 0.6, delay: stat.delay, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4, scale: 1.03, transition: { duration: 0.2 } }}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center shadow-xl"
            >
              <div className="mb-3">{stat.icon}</div>
              <div className="text-3xl font-black text-white mb-1">
                {stat.raw ? stat.value : <Counter target={Number(stat.value) || 0} suffix={stat.suffix} />}
              </div>
              <div className="text-xs text-zinc-500 font-medium leading-tight">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Calm tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false, margin: "-60px" }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-center text-xs text-zinc-600 mt-10 tracking-widest uppercase"
        >
          Powered by Google Gemini · Not a substitute for professional medical advice
        </motion.p>
      </motion.div>
    </section>
  );
}
