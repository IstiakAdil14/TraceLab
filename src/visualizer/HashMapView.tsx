"use client";

import { motion } from "framer-motion";

interface HashMapViewProps {
  entries?: [string, any][];
  activeKey?: string;
}

export function HashMapView({
  entries = [
    ["diff", 7],
    ["nums[0]", 2],
  ],
  activeKey,
}: HashMapViewProps) {
  return (
    <div className="w-full p-4 rounded-2xl bg-zinc-900/90 border border-amber-500/30 space-y-3 font-mono">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2 text-xs">
        <span className="font-bold text-amber-400 font-sans uppercase">Hash Map (Key ➔ Value)</span>
        <span className="text-[11px] text-zinc-500">{entries.length} Bucket(s)</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-1">
        {entries.map(([key, val], idx) => {
          const isActive = key === activeKey;
          return (
            <motion.div
              key={idx}
              animate={{
                scale: isActive ? 1.05 : 1,
                borderColor: isActive ? "#f59e0b" : "#27272a",
              }}
              className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                isActive
                  ? "bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/30 text-amber-300"
                  : "bg-zinc-950 border-zinc-800 text-zinc-300"
              }`}
            >
              <span className="text-xs font-bold text-indigo-400">{key}</span>
              <span className="text-zinc-600 font-sans font-bold">➔</span>
              <span className="text-xs font-bold text-emerald-400">{JSON.stringify(val)}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
