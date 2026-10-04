"use client";

import { motion } from "framer-motion";

interface GraphViewProps {
  nodes?: number[];
  activeNode?: number;
}

export function GraphView({ nodes = [1, 2, 3, 4, 5], activeNode = 1 }: GraphViewProps) {
  return (
    <div className="w-full p-4 rounded-2xl bg-zinc-900/90 border border-emerald-500/30 space-y-3 font-mono">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2 text-xs">
        <span className="font-bold text-emerald-400 font-sans uppercase">Graph Network Topology</span>
        <span className="text-[11px] text-zinc-500">Active Node: #{activeNode}</span>
      </div>

      <div className="h-44 w-full bg-zinc-950 rounded-xl border border-zinc-800 p-4 relative flex items-center justify-center">
        {/* Node Circles */}
        {nodes.map((node, idx) => {
          const isActive = node === activeNode;
          const angle = (idx / nodes.length) * 2 * Math.PI;
          const radius = 60;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <motion.div
              key={node}
              style={{ x, y }}
              animate={{
                scale: isActive ? 1.2 : 1,
                borderColor: isActive ? "#10b981" : "#27272a",
              }}
              className={`absolute h-10 w-10 rounded-full border-2 flex items-center justify-center font-bold text-xs shadow-lg transition-all ${
                isActive
                  ? "bg-emerald-600 border-emerald-400 text-white shadow-emerald-500/30 ring-4 ring-emerald-500/20"
                  : "bg-zinc-900 border-zinc-800 text-zinc-300"
              }`}
            >
              {node}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
