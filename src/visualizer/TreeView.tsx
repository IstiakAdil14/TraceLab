"use client";

import { motion } from "framer-motion";

export interface TreeNodeData {
  val?: any;
  data?: any;
  value?: any;
  left?: TreeNodeData | null;
  right?: TreeNodeData | null;
  children?: TreeNodeData[];
}

interface TreeViewProps {
  root?: TreeNodeData;
}

export function TreeView({ root }: TreeViewProps) {
  if (!root) return null;

  const getVal = (node?: TreeNodeData | null) => {
    if (!node) return null;
    if (node.value !== undefined) return node.value;
    if (node.val !== undefined) return node.val;
    if (node.data !== undefined) return node.data;
    return null;
  };

  const leftChild = root.left || (Array.isArray(root.children) ? root.children[0] : null);
  const rightChild = root.right || (Array.isArray(root.children) ? root.children[1] : null);

  const rootVal = getVal(root);
  const leftVal = getVal(leftChild);
  const rightVal = getVal(rightChild);

  const leftLeftVal = getVal(leftChild?.left || (Array.isArray(leftChild?.children) ? leftChild.children[0] : null));
  const leftRightVal = getVal(leftChild?.right || (Array.isArray(leftChild?.children) ? leftChild.children[1] : null));

  const rightLeftVal = getVal(rightChild?.left || (Array.isArray(rightChild?.children) ? rightChild.children[0] : null));
  const rightRightVal = getVal(rightChild?.right || (Array.isArray(rightChild?.children) ? rightChild.children[1] : null));

  const hasLeft = leftVal !== null && leftVal !== undefined;
  const hasRight = rightVal !== null && rightVal !== undefined;
  const hasLeftLeft = leftLeftVal !== null && leftLeftVal !== undefined;
  const hasLeftRight = leftRightVal !== null && leftRightVal !== undefined;
  const hasRightLeft = rightLeftVal !== null && rightLeftVal !== undefined;
  const hasRightRight = rightRightVal !== null && rightRightVal !== undefined;

  return (
    <div className="w-full max-w-xl p-5 rounded-2xl bg-zinc-900/90 border border-indigo-500/40 shadow-xl shadow-indigo-500/10 backdrop-blur-xl space-y-4 font-mono">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
          <span className="font-bold font-sans uppercase">Real Tree Hierarchy Visualizer</span>
        </div>
        <span className="text-[10px] font-mono uppercase bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full text-indigo-400 font-bold">
          ROOT: {String(rootVal ?? "A")}
        </span>
      </div>

      <div className="flex flex-col items-center justify-center py-4 space-y-2 relative">
        {/* Level 0: Root Node */}
        <div className="flex flex-col items-center z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="h-11 w-11 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 border-2 border-indigo-300 flex items-center justify-center text-white font-extrabold text-base shadow-xl shadow-indigo-500/40 ring-4 ring-indigo-500/20"
          >
            {String(rootVal ?? "A")}
          </motion.div>
        </div>

        {/* SVG Connector Lines from Level 0 to Level 1 */}
        {(hasLeft || hasRight) && (
          <div className="w-full flex justify-center -my-2 relative h-10 pointer-events-none z-0">
            <svg className="w-80 h-10 overflow-visible stroke-indigo-400 stroke-[2.5]" fill="none">
              {hasLeft && <line x1="50%" y1="0" x2="28%" y2="100%" strokeLinecap="round" />}
              {hasRight && <line x1="50%" y1="0" x2="72%" y2="100%" strokeLinecap="round" />}
            </svg>
          </div>
        )}

        {/* Level 1: Left Node & Right Node Subtrees */}
        <div className="flex items-start justify-center gap-16 w-full relative z-10 pt-1">
          {/* Left Subtree (e.g. B -> D, E) */}
          <div className="flex flex-col items-center flex-1">
            {hasLeft ? (
              <div className="flex flex-col items-center w-full">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="h-10 w-10 rounded-full bg-zinc-900 border-2 border-indigo-400 flex items-center justify-center text-indigo-200 font-bold text-sm shadow-md"
                >
                  {String(leftVal)}
                </motion.div>

                {/* SVG Connectors from Left Child (B) to its children (D, E) */}
                {(hasLeftLeft || hasLeftRight) && (
                  <div className="w-full flex justify-center -my-1 relative h-8 pointer-events-none z-0">
                    <svg className="w-40 h-8 overflow-visible stroke-indigo-400/80 stroke-2" fill="none">
                      {hasLeftLeft && <line x1="50%" y1="0" x2="25%" y2="100%" strokeLinecap="round" />}
                      {hasLeftRight && <line x1="50%" y1="0" x2="75%" y2="100%" strokeLinecap="round" />}
                    </svg>
                  </div>
                )}

                {/* Level 2 Sub-children under Left Child */}
                <div className="flex items-center justify-center gap-6 pt-1 w-full">
                  {hasLeftLeft && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="h-8 w-8 rounded-full bg-zinc-950 border border-emerald-500/80 flex items-center justify-center text-emerald-300 text-xs font-extrabold shadow-sm ring-2 ring-emerald-500/20"
                    >
                      {String(leftLeftVal)}
                    </motion.div>
                  )}
                  {hasLeftRight && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="h-8 w-8 rounded-full bg-zinc-950 border border-emerald-500/80 flex items-center justify-center text-emerald-300 text-xs font-extrabold shadow-sm ring-2 ring-emerald-500/20"
                    >
                      {String(leftRightVal)}
                    </motion.div>
                  )}
                </div>
              </div>
            ) : (
              <span className="text-[10px] text-zinc-600 italic mt-2">left: null</span>
            )}
          </div>

          {/* Right Subtree (e.g. C) */}
          <div className="flex flex-col items-center flex-1">
            {hasRight ? (
              <div className="flex flex-col items-center w-full">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="h-10 w-10 rounded-full bg-zinc-900 border-2 border-indigo-400 flex items-center justify-center text-indigo-200 font-bold text-sm shadow-md"
                >
                  {String(rightVal)}
                </motion.div>

                {/* SVG Connectors from Right Child (C) to its children */}
                {(hasRightLeft || hasRightRight) && (
                  <div className="w-full flex justify-center -my-1 relative h-8 pointer-events-none z-0">
                    <svg className="w-40 h-8 overflow-visible stroke-indigo-400/80 stroke-2" fill="none">
                      {hasRightLeft && <line x1="50%" y1="0" x2="25%" y2="100%" strokeLinecap="round" />}
                      {hasRightRight && <line x1="50%" y1="0" x2="75%" y2="100%" strokeLinecap="round" />}
                    </svg>
                  </div>
                )}

                {/* Level 2 Sub-children under Right Child */}
                <div className="flex items-center justify-center gap-6 pt-1 w-full">
                  {hasRightLeft && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="h-8 w-8 rounded-full bg-zinc-950 border border-emerald-500/80 flex items-center justify-center text-emerald-300 text-xs font-extrabold shadow-sm ring-2 ring-emerald-500/20"
                    >
                      {String(rightLeftVal)}
                    </motion.div>
                  )}
                  {hasRightRight && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="h-8 w-8 rounded-full bg-zinc-950 border border-emerald-500/80 flex items-center justify-center text-emerald-300 text-xs font-extrabold shadow-sm ring-2 ring-emerald-500/20"
                    >
                      {String(rightRightVal)}
                    </motion.div>
                  )}
                </div>
              </div>
            ) : (
              <span className="text-[10px] text-zinc-600 italic mt-2">right: null</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
