"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface ListNode {
  val: any;
  next?: ListNode | null;
}

interface LinkedListViewProps {
  nodes?: ListNode[];
  values?: any[];
  highlightIndex?: number;
}

export function LinkedListView({ nodes, values = [10, 20, 30, 40], highlightIndex = -1 }: LinkedListViewProps) {
  const displayValues = values || (nodes ? nodes.map((n) => n.val) : []);

  return (
    <div className="w-full p-4 rounded-2xl bg-zinc-900/90 border border-purple-500/30 space-y-3 font-mono">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2 text-xs">
        <span className="font-bold text-purple-400 font-sans uppercase">Singly Linked List</span>
        <span className="text-[11px] text-zinc-500">HEAD ➔ NULL</span>
      </div>

      <div className="flex items-center justify-center gap-3 overflow-x-auto py-3">
        <span className="text-xs font-bold text-purple-400 uppercase font-sans">HEAD ➔</span>
        {displayValues.map((val, idx) => {
          const isHighlighted = idx === highlightIndex;
          return (
            <div key={idx} className="flex items-center gap-2 shrink-0">
              <motion.div
                animate={{
                  scale: isHighlighted ? 1.1 : 1,
                  borderColor: isHighlighted ? "#a855f7" : "#27272a",
                }}
                className={`flex rounded-xl border overflow-hidden transition-all ${
                  isHighlighted
                    ? "bg-purple-950/60 border-purple-500 shadow-lg shadow-purple-500/30 ring-2 ring-purple-500/40"
                    : "bg-zinc-950 border-zinc-800"
                }`}
              >
                <div className="px-3.5 py-2 text-xs font-bold text-purple-300 border-r border-zinc-800">
                  {JSON.stringify(val)}
                </div>
                <div className="px-2 py-2 text-[10px] text-zinc-500 font-sans flex items-center justify-center bg-zinc-900">
                  next
                </div>
              </motion.div>

              {idx < displayValues.length - 1 ? (
                <ArrowRight className="h-4 w-4 text-purple-400" />
              ) : (
                <span className="text-xs text-zinc-600 font-sans font-bold">➔ NULL</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
