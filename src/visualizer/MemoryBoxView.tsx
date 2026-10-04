"use client";

import { motion } from "framer-motion";

interface MemoryBoxViewProps {
  name: string;
  value: any;
  line?: number;
  isNew?: boolean;
}

export function MemoryBoxView({ name, value, line, isNew }: MemoryBoxViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: isNew ? 1.05 : 1 }}
      transition={{ duration: 0.3 }}
      className={`p-3.5 rounded-xl border font-mono transition-all ${
        isNew
          ? "bg-indigo-950/40 border-indigo-500/80 ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-500/10"
          : "bg-zinc-900/80 border-zinc-800 hover:border-zinc-700"
      }`}
    >
      <div className="flex items-center justify-between text-[10px] text-zinc-400 border-b border-zinc-800/60 pb-1 mb-2">
        <span className="uppercase text-[9px] tracking-wider text-indigo-400 font-sans font-bold">
          Memory Slot
        </span>
        {line && <span className="text-zinc-500">Line {line}</span>}
      </div>

      <div className="bg-zinc-950 rounded-lg p-2.5 border border-zinc-800/90 text-center font-mono">
        <div className="text-zinc-600 text-[9px] font-mono leading-none mb-1">┌───────┐</div>
        <div className="text-base font-bold text-emerald-400 flex items-center justify-center gap-2">
          <span className="text-indigo-300">{name}</span>
          <span className="text-zinc-500">=</span>
          <span className="text-amber-400">{JSON.stringify(value)}</span>
        </div>
        <div className="text-zinc-600 text-[9px] font-mono leading-none mt-1">└───────┘</div>
      </div>
    </motion.div>
  );
}
