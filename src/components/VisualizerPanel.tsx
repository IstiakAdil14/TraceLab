"use client";

import { Eye, Box, Cpu, ArrowDown, GitBranch, CheckCircle2, XCircle, ArrowRight, Repeat, Layers, Workflow, BarChart3, Search, Hash, Sparkles, Layers3, Terminal } from "lucide-react";
import { useExecutionStore } from "@/store/useExecutionStore";
import { VariableCreated, VariableUpdated, VariableRead, ExpressionEvaluated, ConditionChecked, LoopIteration, ArrayCreated, ArrayAccessed, FunctionCalled, FunctionReturned, ConsoleLogged } from "@/runtime/events";
import { motion } from "framer-motion";
import { TreeView } from "@/visualizer/TreeView";
import { MachineLearningView } from "@/visualizer/MachineLearningView";

export function VisualizerPanel() {
  const events = useExecutionStore((state) => state.events);
  const currentStepIndex = useExecutionStore((state) => state.currentStepIndex);

  // Derive active variable memory state up to currentStepIndex
  const activeVariables: Record<string, { value: any; line?: number; isNew?: boolean }> = {};
  const currentEvent = currentStepIndex >= 0 && currentStepIndex < events.length ? events[currentStepIndex] : null;

  if (currentStepIndex >= 0 && currentStepIndex < events.length) {
    const visibleEvents = events.slice(0, currentStepIndex + 1);
    
    visibleEvents.forEach((evt, idx) => {
      if (evt.type === "CREATE_VARIABLE" || evt.type === "VARIABLE_CREATED") {
        const vEvt = evt as VariableCreated;
        activeVariables[vEvt.name] = {
          value: vEvt.value,
          line: vEvt.line,
          isNew: idx === currentStepIndex,
        };
      } else if (evt.type === "UPDATE_VARIABLE" || evt.type === "VARIABLE_UPDATED") {
        const uEvt = evt as VariableUpdated;
        activeVariables[uEvt.name] = {
          value: uEvt.value,
          line: uEvt.line,
          isNew: idx === currentStepIndex,
        };
      }
    });
  }

  const variableEntries = Object.entries(activeVariables);

  // Detect active ML model variables (weight, bias, loss, epoch)
  const isMlActive =
    "weight" in activeVariables ||
    "bias" in activeVariables ||
    "loss" in activeVariables ||
    "epoch" in activeVariables ||
    events.some((e) => e.type === "ML_EPOCH" || e.type === "ML_ITERATION");


  // Detect active array for sorting/searching visualizer
  const activeArray = Object.values(activeVariables).find((v) => Array.isArray(v.value))?.value as any[] | undefined;

  // Detect active Tree Node object for Tree Visualizer
  const activeTreeRoot = Object.values(activeVariables).find(
    (v) =>
      v.value &&
      typeof v.value === "object" &&
      !Array.isArray(v.value) &&
      ("val" in v.value || "data" in v.value) &&
      ("left" in v.value || "right" in v.value)
  )?.value;

  // Collect printed console log outputs up to currentStepIndex
  const printedLogs: { text: string; line?: number }[] = [];
  if (currentStepIndex >= 0 && currentStepIndex < events.length) {
    events.slice(0, currentStepIndex + 1).forEach((evt) => {
      if (evt.type === "CONSOLE_LOG" || evt.type === "PRINT_OUTPUT") {
        printedLogs.push({ text: (evt as ConsoleLogged).output, line: evt.line });
      }
    });
  }

  const isOperationEvent = (evt: any) =>
    evt && ["ADD", "SUB", "MUL", "DIV", "OPERATION", "EVALUATE_EXPRESSION", "EXPRESSION_EVALUATED"].includes(evt.type);

  const isReadEvent = (evt: any) =>
    evt && ["READ", "READ_VARIABLE", "VARIABLE_READ"].includes(evt.type);

  const isConditionEvent = (evt: any) =>
    evt && ["CHECK_CONDITION", "CONDITION_CHECKED"].includes(evt.type);

  const isLoopEvent = (evt: any) =>
    evt && ["LOOP_ITERATION", "ITERATION"].includes(evt.type);

  const isArrayEvent = (evt: any) =>
    evt && ["CREATE_ARRAY", "ARRAY_CREATED", "ACCESS_ARRAY", "ARRAY_ACCESSED"].includes(evt.type);

  const isFunctionEvent = (evt: any) =>
    evt && ["CALL_FUNCTION", "FUNCTION_CALLED", "RETURN_FUNCTION", "FUNCTION_RETURNED"].includes(evt.type);

  const isPrintEvent = (evt: any) =>
    evt && ["CONSOLE_LOG", "PRINT_OUTPUT"].includes(evt.type);

  return (
    <div className="flex flex-col h-full w-full bg-zinc-950 overflow-hidden">
      {/* Panel Header */}
      <div className="h-10 px-4 bg-zinc-900/80 border-b border-zinc-800/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-xs font-medium text-zinc-300">
          <Eye className="h-4 w-4 text-emerald-400" />
          <span>Visualization Area</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] bg-gradient-to-r from-emerald-500/20 to-indigo-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-emerald-400" /> Real-Time Execution Visualizer
          </span>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 p-6 relative overflow-auto bg-gradient-to-b from-zinc-950 to-zinc-900/50 flex flex-col items-center justify-start space-y-6">
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

        {/* Dynamic Machine Learning Visualizer */}
        {isMlActive && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl z-10"
          >
            <MachineLearningView />
          </motion.div>
        )}

        {/* Dynamic Binary Tree Visualizer */}
        {activeTreeRoot && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-xl z-10 flex justify-center"
          >
            <TreeView root={activeTreeRoot} />
          </motion.div>
        )}


        {/* Algorithm Bar Chart & Array Structure Visualizer */}
        {activeArray && Array.isArray(activeArray) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-xl z-10 p-5 rounded-2xl bg-zinc-900/90 border border-indigo-500/40 shadow-xl shadow-indigo-500/10 backdrop-blur-xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
                <BarChart3 className="h-4 w-4 text-indigo-400" />
                <span>Array Structure & Index Map</span>
              </div>
              <span className="text-[10px] font-mono uppercase bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded text-indigo-400 font-bold">
                ARRAY [{activeArray.length}]
              </span>
            </div>

            {/* Index Map Grid Header & Values Row */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3 font-mono">
              <div className="flex items-center justify-between text-xs text-zinc-400 font-sans border-b border-zinc-800/80 pb-2">
                <span className="font-semibold text-zinc-300">Index & Element Alignment</span>
                <span className="text-[11px] text-indigo-400 font-mono">Length = {activeArray.length}</span>
              </div>

              {/* Index Row */}
              <div className="flex items-center justify-center gap-3">
                <div className="w-14 text-right text-xs text-zinc-500 font-sans font-semibold">Index</div>
                <div className="flex items-center gap-2">
                  {activeArray.map((_, idx) => {
                    const isAccessed = currentEvent?.type === "ACCESS_ARRAY" && (currentEvent as any).index === idx;
                    return (
                      <motion.div
                        key={idx}
                        animate={{ scale: isAccessed ? 1.15 : 1 }}
                        className={`w-12 h-7 rounded-md border flex items-center justify-center text-xs font-bold transition-all ${
                          isAccessed
                            ? "bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-500/40 ring-2 ring-indigo-400 font-extrabold"
                            : "bg-zinc-900 text-indigo-400 border-zinc-800"
                        }`}
                      >
                        {idx}
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Value Row */}
              <div className="flex items-center justify-center gap-3">
                <div className="w-14 text-right text-xs text-zinc-400 font-sans font-semibold">Value</div>
                <div className="flex items-center gap-2">
                  {activeArray.map((val, idx) => {
                    const isAccessed = currentEvent?.type === "ACCESS_ARRAY" && (currentEvent as any).index === idx;
                    const isLeft = activeVariables["left"]?.value === val;
                    const isRight = activeVariables["right"]?.value === val;
                    const isHighlighted = isAccessed || isLeft || isRight;

                    return (
                      <motion.div
                        key={idx}
                        animate={{ scale: isHighlighted ? 1.15 : 1 }}
                        className={`w-12 h-12 rounded-xl border flex items-center justify-center text-sm font-bold transition-all ${
                          isAccessed
                            ? "bg-emerald-600 text-white border-emerald-400 shadow-xl shadow-emerald-500/40 ring-2 ring-emerald-400 font-extrabold"
                            : isLeft || isRight
                            ? "bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-500/40"
                            : "bg-zinc-900 text-emerald-400 border-zinc-800 hover:border-zinc-700"
                        }`}
                      >
                        {val}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Pillar Bars Container */}
            <div className="h-32 w-full bg-zinc-950 rounded-xl border border-zinc-800 p-4 flex items-end justify-center gap-3 relative">
              {activeArray.map((val, idx) => {
                const maxVal = Math.max(...activeArray.map((v) => Number(v) || 1), 10);
                const heightPercent = Math.max(20, Math.min(100, (Number(val) / maxVal) * 100));
                const isLeft = activeVariables["left"]?.value === val;
                const isRight = activeVariables["right"]?.value === val;

                return (
                  <div key={idx} className="flex flex-col items-center gap-1 flex-1 max-w-[48px]">
                    <span className="text-[11px] font-mono font-bold text-zinc-300">{val}</span>
                    <motion.div
                      animate={{
                        height: `${heightPercent}%`,
                        backgroundColor: isLeft || isRight ? "#818cf8" : "#3f3f46",
                      }}
                      transition={{ duration: 0.3 }}
                      className={`w-full rounded-t-lg transition-all border ${
                        isLeft || isRight
                          ? "border-indigo-400 shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-500/40"
                          : "border-zinc-700"
                      }`}
                    />
                    <span className="text-[10px] font-mono text-zinc-500">[{idx}]</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Function Call & Recursion Visualizer Card */}
        {currentEvent && isFunctionEvent(currentEvent) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl z-10 p-5 rounded-2xl bg-zinc-900/90 border border-indigo-500/40 shadow-xl shadow-indigo-500/10 backdrop-blur-xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
                <Layers3 className="h-4 w-4 text-indigo-400" />
                <span>Recursion & Call Stack Engine</span>
              </div>
              <span className="text-[10px] font-mono uppercase bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded text-indigo-400 font-bold">
                {currentEvent.type === "RETURN_FUNCTION" ? "UNWINDING RETURN" : "RECURSIVE STACK"}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3 font-mono">
              <div className="text-xs text-zinc-400 uppercase tracking-wider font-sans font-semibold text-center flex items-center justify-center gap-2">
                <span>Recursion Stack Cascade</span>
                {currentEvent.type === "RETURN_FUNCTION" && (
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                    Unwinding Phase
                  </span>
                )}
              </div>

              <div className="flex flex-col items-center justify-center space-y-2 py-2">
                {(() => {
                  const stack: string[] = (currentEvent as FunctionCalled).stack || ["main()", "factorial(4)", "factorial(3)", "factorial(2)", "factorial(1)"];
                  const frames = stack.filter((s) => s !== "main()");

                  if (frames.length === 0) {
                    return (
                      <div className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs">
                        main()
                      </div>
                    );
                  }

                  return frames.map((frameLabel, idx) => {
                    const isTop = idx === frames.length - 1;
                    return (
                      <div key={idx} className="flex flex-col items-center w-full max-w-md">
                        {idx > 0 && (
                          <div className="text-indigo-400 my-1">
                            <ArrowDown className="h-4 w-4 animate-pulse" />
                          </div>
                        )}

                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: idx * 0.1 }}
                          className={`w-full px-4 py-2.5 rounded-xl border flex items-center justify-between transition-all ${
                            isTop
                              ? "bg-indigo-600/30 border-indigo-500 text-indigo-100 shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-500/40 font-bold scale-105"
                              : "bg-zinc-900/80 border-zinc-800 text-zinc-400"
                          }`}
                        >
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-mono">
                              Depth {idx + 1}
                            </span>
                            <span>{frameLabel}</span>
                          </div>

                          {isTop && (
                            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-bold animate-pulse">
                              {currentEvent.type === "RETURN_FUNCTION" ? "Returning" : "Active"}
                            </span>
                          )}
                        </motion.div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {currentEvent.type === "RETURN_FUNCTION" && (
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-center font-mono space-y-1">
                <div className="text-xs text-emerald-400 font-sans font-semibold">Unwind Return Value</div>
                <div className="text-lg font-bold text-emerald-300">
                  {(currentEvent as FunctionReturned).name}() Returned = {JSON.stringify((currentEvent as FunctionReturned).returnValue)}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Loop Visualizer Card */}
        {currentEvent && isLoopEvent(currentEvent) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl z-10 p-5 rounded-2xl bg-zinc-900/90 border border-emerald-500/40 shadow-xl shadow-emerald-500/10 backdrop-blur-xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                <Repeat className="h-4 w-4 text-emerald-400 animate-spin" />
                <span>Loop Execution Engine</span>
              </div>
              <span className="text-[10px] font-mono uppercase bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-emerald-400 font-bold">
                FOR LOOP
              </span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3 text-center font-mono">
              <div className="text-xs text-zinc-400 uppercase tracking-wider font-sans font-semibold">
                Iteration Status
              </div>

              <div className="text-2xl font-extrabold text-emerald-400 tracking-tight">
                Iteration {(currentEvent as LoopIteration).iteration}
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700/80 text-base font-bold">
                <span className="text-indigo-300">{(currentEvent as LoopIteration).variableName || "i"}</span>
                <span className="text-zinc-500">=</span>
                <span className="text-amber-400">{JSON.stringify((currentEvent as LoopIteration).variableValue ?? 0)}</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400 font-sans">Loop Progress</span>
                <span className="text-emerald-400 font-bold">
                  {(currentEvent as LoopIteration).progressPercent}%
                </span>
              </div>

              <div className="h-3 w-full rounded-full bg-zinc-950 border border-zinc-800 p-0.5 relative overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentEvent as LoopIteration).progressPercent}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 shadow-md shadow-emerald-500/20"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Condition Visualizer Card */}
        {currentEvent && isConditionEvent(currentEvent) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl z-10 p-5 rounded-2xl bg-zinc-900/90 border border-purple-500/40 shadow-xl shadow-purple-500/10 backdrop-blur-xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-purple-300">
                <GitBranch className="h-4 w-4 text-purple-400" />
                <span>Condition Visualizer</span>
              </div>
              <span className="text-[10px] font-mono uppercase bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded text-purple-400">
                IF-ELSE BRANCH
              </span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-center font-mono">
              <div className="text-xs text-zinc-400 uppercase tracking-wider font-sans">Condition Check</div>
              <div className="text-lg font-bold text-zinc-200">
                if ( {(currentEvent as ConditionChecked).condition} )
              </div>

              <div className="flex items-center justify-center gap-3 text-base text-zinc-300 py-1">
                <span>{(currentEvent as ConditionChecked).left !== undefined ? JSON.stringify((currentEvent as ConditionChecked).left) : "a"}</span>
                <span className="text-purple-400 font-bold">{(currentEvent as ConditionChecked).operator || ">"}</span>
                <span>{(currentEvent as ConditionChecked).right !== undefined ? JSON.stringify((currentEvent as ConditionChecked).right) : "b"}</span>
              </div>

              <div className="pt-1">
                {(currentEvent as ConditionChecked).result ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-bold">
                    <CheckCircle2 className="h-4 w-4" /> TRUE
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-bold">
                    <XCircle className="h-4 w-4" /> FALSE
                  </span>
                )}
              </div>
            </div>

            <div className="pt-2">
              <div className="text-xs text-zinc-400 mb-3 text-center font-medium font-sans">
                Branching Execution Path
              </div>

              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  animate={{
                    scale: (currentEvent as ConditionChecked).result ? 1.03 : 0.97,
                    opacity: (currentEvent as ConditionChecked).result ? 1 : 0.4,
                  }}
                  className={`p-3.5 rounded-xl border text-center font-mono transition-all ${
                    (currentEvent as ConditionChecked).result
                      ? "bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30 text-emerald-300"
                      : "bg-zinc-950 border-zinc-800 text-zinc-600 line-through"
                  }`}
                >
                  <div className="text-xs font-bold font-sans uppercase mb-1">True Path</div>
                  <div className="text-[11px] flex items-center justify-center gap-1">
                    <span>IF branch executed</span>
                    {(currentEvent as ConditionChecked).result && <ArrowRight className="h-3 w-3 text-emerald-400" />}
                  </div>
                </motion.div>

                <motion.div
                  animate={{
                    scale: !(currentEvent as ConditionChecked).result ? 1.03 : 0.97,
                    opacity: !(currentEvent as ConditionChecked).result ? 1 : 0.4,
                  }}
                  className={`p-3.5 rounded-xl border text-center font-mono transition-all ${
                    !(currentEvent as ConditionChecked).result
                      ? "bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/30 text-amber-300"
                      : "bg-zinc-950 border-zinc-800 text-zinc-600 line-through"
                  }`}
                >
                  <div className="text-xs font-bold font-sans uppercase mb-1">False Path</div>
                  <div className="text-[11px] flex items-center justify-center gap-1">
                    <span>Else executed</span>
                    {!(currentEvent as ConditionChecked).result && <ArrowRight className="h-3 w-3 text-amber-400" />}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Expression Evaluation Visualizer Card */}
        {currentEvent && (isReadEvent(currentEvent) || isOperationEvent(currentEvent)) && (
          <div className="w-full max-w-xl z-10 p-5 rounded-2xl bg-zinc-900/90 border border-indigo-500/40 shadow-xl shadow-indigo-500/10 backdrop-blur-xl transition-all animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5 mb-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
                <Cpu className="h-4 w-4 text-indigo-400 animate-pulse" />
                <span>Active Expression Step</span>
              </div>
              <span className="text-[10px] font-mono uppercase bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded text-indigo-400">
                {currentEvent.type}
              </span>
            </div>

            {isReadEvent(currentEvent) && (
              <div className="flex items-center justify-center gap-3 py-4 text-lg font-mono bg-zinc-950/80 rounded-xl border border-zinc-800">
                <span className="text-indigo-400 font-bold">{(currentEvent as VariableRead).name}</span>
                <span className="text-zinc-500">→</span>
                <span className="text-emerald-400 font-bold">{JSON.stringify((currentEvent as VariableRead).value)}</span>
              </div>
            )}

            {isOperationEvent(currentEvent) && (
              <div className="space-y-4 text-center font-mono py-2">
                <div className="flex items-center justify-center gap-6 text-sm">
                  <div className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300">
                    left: <span className="text-amber-400 font-bold">{JSON.stringify((currentEvent as ExpressionEvaluated).left)}</span>
                  </div>
                  <span className="text-indigo-400 text-lg font-bold">{(currentEvent as ExpressionEvaluated).operator || "+"}</span>
                  <div className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300">
                    right: <span className="text-amber-400 font-bold">{JSON.stringify((currentEvent as ExpressionEvaluated).right)}</span>
                  </div>
                </div>

                <div className="flex justify-center text-indigo-400 my-1">
                  <ArrowDown className="h-5 w-5 animate-bounce" />
                </div>

                <div className="inline-block px-5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xl font-bold shadow-lg shadow-emerald-500/10">
                  Result = {JSON.stringify((currentEvent as ExpressionEvaluated).result)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Terminal Console Output Card */}
        {printedLogs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl z-10 p-5 rounded-2xl bg-zinc-900/90 border border-emerald-500/40 shadow-xl shadow-emerald-500/10 backdrop-blur-xl space-y-3"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                <Terminal className="h-4 w-4 text-emerald-400" />
                <span>Console Terminal Output</span>
              </div>
              <span className="text-[10px] font-mono uppercase bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-emerald-400 font-bold">
                PRINT STREAM
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-emerald-400 text-xs space-y-2 max-h-40 overflow-y-auto">
              {printedLogs.map((log, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 border-b border-zinc-900/80 pb-1.5 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-600 font-bold">$</span>
                    <span className="font-bold text-emerald-300">{log.text}</span>
                  </div>
                  {log.line && <span className="text-[10px] text-zinc-600 font-sans">Line {log.line}</span>}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Active Memory Variables Section */}
        {variableEntries.length > 0 && (
          <div className="w-full max-w-2xl relative z-10 space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                <Box className="h-4 w-4 text-indigo-400" />
                <span>Memory Slot Variables</span>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">
                {variableEntries.length} slot(s)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {variableEntries.map(([name, { value, line, isNew }]) => {
                if (Array.isArray(value)) {
                  return (
                    <div
                      key={name}
                      className="col-span-full p-4 rounded-xl border bg-zinc-900/90 border-zinc-800 space-y-2 font-mono"
                    >
                      <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800 pb-1.5">
                        <span className="uppercase text-[10px] font-bold text-indigo-400">Array Variable</span>
                        <span className="font-bold text-white">{name} = {JSON.stringify(value)}</span>
                      </div>

                      <div className="flex items-center justify-center gap-2 pt-1">
                        {value.map((v, i) => (
                          <div key={i} className="flex flex-col items-center">
                            <span className="text-[10px] text-zinc-500 mb-1">[{i}]</span>
                            <div className="w-10 h-10 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-emerald-400 font-bold">
                              {v}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={name}
                    className={`p-3.5 rounded-xl border font-mono transition-all duration-300 ${
                      isNew
                        ? "bg-indigo-950/40 border-indigo-500/80 ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-500/10 scale-105"
                        : "bg-zinc-900/80 border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 border-b border-zinc-800/60 pb-1 mb-2">
                      <span className="uppercase text-[9px] tracking-wider text-indigo-400 font-sans font-bold">
                        Memory Slot
                      </span>
                      {line && <span className="text-zinc-500">Line {line}</span>}
                    </div>

                    <div className="bg-zinc-950 rounded-lg p-2.5 border border-zinc-800/90 text-center font-mono overflow-hidden">
                      <div className="text-zinc-600 text-[9px] font-mono leading-none mb-1">┌───────┐</div>
                      <div className="text-sm font-bold text-emerald-400 flex items-center justify-center gap-2 truncate">
                        <span className="text-indigo-300">{name}</span>
                        <span className="text-zinc-500">=</span>
                        <span className="text-amber-400 font-semibold truncate">
                          {typeof value === "object" && value !== null && !Array.isArray(value)
                            ? ("val" in value || "data" in value)
                              ? `Node(${value.val ?? value.data})`
                              : "{ Object }"
                            : JSON.stringify(value)}
                        </span>
                      </div>
                      <div className="text-zinc-600 text-[9px] font-mono leading-none mt-1">└───────┘</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
