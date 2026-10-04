"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface QueueViewProps {
  items: any[];
  title?: string;
}

export function QueueView({ items, title = "Queue (FIFO)" }: QueueViewProps) {
  return (
    <div className="w-full p-4 rounded-2xl bg-zinc-900/90 border border-emerald-500/30 space-y-3 font-mono">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2 text-xs">
        <span className="font-bold text-emerald-400 font-sans uppercase">{title}</span>
        <span className="text-[11px] text-zinc-500">{items.length} Item(s)</span>
      </div>

      <div className="flex items-center justify-center gap-2 overflow-x-auto py-2">
        <span className="text-[10px] uppercase text-emerald-400 font-bold font-sans">Front ➔</span>
        {items.length === 0 ? (
          <div className="text-xs text-zinc-500 italic">Queue is empty</div>
        ) : (
          items.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-emerald-300 font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-md"
            >
              <span>{JSON.stringify(item)}</span>
              {idx < items.length - 1 && <ArrowRight className="h-3 w-3 text-zinc-600" />}
            </motion.div>
          ))
        )}
        <span className="text-[10px] uppercase text-zinc-500 font-bold font-sans">➔ Rear</span>
      </div>
    </div>
  );
}
