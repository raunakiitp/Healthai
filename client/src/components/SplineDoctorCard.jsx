import { SplineScene } from './ui/SplineScene';
import { Card } from './ui/Card';
import { Spotlight } from './ui/Spotlight';
import { motion } from 'framer-motion';
import { Stethoscope, Brain, Activity } from 'lucide-react';

// Doctor Spline scene — full-body interactive doctor model
// Source: public Spline community scene (medical/doctor theme)
const DOCTOR_SCENE = "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode";

const FEATURES = [
  { icon: Brain,        label: "AI Diagnosis",     desc: "Powered by Gemini" },
  { icon: Stethoscope,  label: "Health Analysis",  desc: "Symptom assessment" },
  { icon: Activity,     label: "Risk Assessment",  desc: "Instant results"    },
];

export function SplineDoctorCard() {
  return (
    <Card className="w-full h-[560px] sm:h-[600px] bg-black/90 relative overflow-hidden border-blue-500/20">
      {/* Dramatic spotlight beam */}
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="#3b96f2"
      />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(59,150,242,1) 1px, transparent 1px), linear-gradient(90deg, rgba(59,150,242,1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="flex h-full flex-col md:flex-row">
        {/* ── LEFT: Text badges ── */}
        <div className="md:w-[42%] p-6 sm:p-8 relative z-10 flex flex-col justify-center gap-6">
          {/* Status pill */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 w-fit px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-xs font-semibold text-blue-400 uppercase tracking-widest"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            AI Medical Consultant
          </motion.div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-b from-white to-blue-200 leading-tight mb-3">
              Meet Your
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
                AI Doctor
              </span>
            </h2>
            <p className="text-neutral-400 text-sm leading-relaxed max-w-xs">
              Describe your symptoms. Our AI doctor analyses your condition and
              gives you personalised health insights — in seconds.
            </p>
          </motion.div>

          {/* Feature pills */}
          <motion.div
            className="flex flex-col gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            {FEATURES.map(({ icon: Icon, label, desc }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.75 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/8 bg-white/5 backdrop-blur-sm"
                whileHover={{ x: 4, borderColor: "rgba(59,150,242,0.3)", transition: { duration: 0.2 } }}
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-white text-xs font-semibold">{label}</p>
                  <p className="text-neutral-500 text-[0.65rem]">{desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Drag hint */}
          <p className="text-neutral-600 text-[0.65rem] tracking-wider uppercase">
            🖱 Drag to interact
          </p>
        </div>

        {/* ── RIGHT: Spline 3D Scene ── */}
        <div className="flex-1 relative">
          {/* Gradient overlay left edge for blending */}
          <div className="absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-black/80 to-transparent z-10 pointer-events-none" />
          {/* Glow behind scene */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 rounded-full bg-blue-500/10 blur-3xl" />
          </div>
          <SplineScene
            scene={DOCTOR_SCENE}
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
    </Card>
  );
}
