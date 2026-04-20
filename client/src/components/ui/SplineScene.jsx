import { Suspense, lazy } from 'react';

const Spline = lazy(() => import('@splinetool/react-spline'));

export function SplineScene({ scene, className }) {
  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Loading 3D Scene…</span>
        </div>
      }
    >
      <Spline scene={scene} className={className} />
    </Suspense>
  );
}
