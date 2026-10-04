"use client";

import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";

interface StackViewProps {
  items: any[];
  title?: string;
}

export function StackView({ items, title = "Call Stack (LIFO)" }: StackViewProps) {
  return (
    <div className="w-full p-4 rounded-2xl bg-zinc-900/90 border border-indigo-500/30 space-y-3 font-mono">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2 text-xs">
        <span className="font-bold text-indigo-300 font-sans uppercase">{title}</span>
        <span className="text-[11px] text-zinc-500">{items.length} Frame(s)</span>
      </div>

      <div className="flex flex-col items-center justify-center space-y-2 py-1">
        {items.length === 0 ? (
          <div className="text-xs text-zinc-500 italic">Stack is empty</div>
        ) : (
          [...items].reverse().map((item, idx) => {
            const isTop = idx === 0;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`w-full max-w-sm px-4 py-2 rounded-xl border flex items-center justify-between transition-all ${
                  isTop
                    ? "bg-indigo-600/30 border-indigo-500 text-indigo-100 shadow-md shadow-indigo-500/20 font-bold scale-105"
                    : "bg-zinc-950 border-zinc-800 text-zinc-400"
                }`}
              >
                <span className="text-xs">{JSON.stringify(item)}</span>
                {isTop && (
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <ArrowUp className="h-3 w-3" /> TOP
                  </span>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
