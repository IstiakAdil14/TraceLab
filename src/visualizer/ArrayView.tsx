"use client";

import { motion } from "framer-motion";

interface ArrayViewProps {
  name: string;
  elements: any[];
  activeIndex?: number;
}

export function ArrayView({ name, elements, activeIndex = -1 }: ArrayViewProps) {
  return (
    <div className="w-full p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3 font-mono">
      <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800 pb-2">
        <span className="font-bold text-indigo-400 uppercase tracking-wider font-sans">Array Memory Structure</span>
        <span className="text-white font-bold">{name} = [{elements.join(", ")}]</span>
      </div>

      {/* Array Index Labels */}
      <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
        <span className="text-[10px] text-zinc-600 font-sans uppercase mr-1">Index:</span>
        {elements.map((_, idx) => (
          <div
            key={idx}
            className={`w-12 text-center font-bold ${
              idx === activeIndex ? "text-indigo-400 scale-110" : "text-zinc-500"
            }`}
          >
            {idx}
          </div>
        ))}
      </div>

      {/* Array Element Grid Slots */}
      <div className="flex items-center justify-center gap-2">
        {elements.map((val, idx) => {
          const isHighlighted = idx === activeIndex;
          return (
            <motion.div
              key={idx}
              animate={{
                scale: isHighlighted ? 1.12 : 1,
                borderColor: isHighlighted ? "#6366f1" : "#27272a",
              }}
              className={`w-12 h-14 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                isHighlighted
                  ? "bg-indigo-600/30 border-indigo-500 shadow-lg shadow-indigo-500/30 text-emerald-300 font-extrabold"
                  : "bg-zinc-950 border-zinc-800 text-zinc-200"
              }`}
            >
              <span className="text-base">{JSON.stringify(val)}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
