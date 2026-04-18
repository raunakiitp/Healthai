import { useEffect } from "react";
import { useMotionValue, useSpring } from "framer-motion";

/**
 * Tracks mouse position and returns smooth MotionValues
 * normalized to [-0.5, 0.5] range.
 */
export function useMouseParallax(stiffness = 60, damping = 20) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const x = useSpring(rawX, { stiffness, damping });
  const y = useSpring(rawY, { stiffness, damping });

  useEffect(() => {
    let raf;
    let cx = 0, cy = 0;

    const onMove = (e) => {
      cx = e.clientX / window.innerWidth - 0.5;
      cy = e.clientY / window.innerHeight - 0.5;
    };

    const tick = () => {
      rawX.set(cx);
      rawY.set(cy);
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [rawX, rawY]);

  return { x, y };
}
