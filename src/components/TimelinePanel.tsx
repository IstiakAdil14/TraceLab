"use client";

import { ControlBar } from "./ControlBar";
import { History, Activity, Play, CheckCircle2 } from "lucide-react";
import { useExecutionStore } from "@/store/useExecutionStore";
import { useEffect, useRef } from "react";

export function TimelinePanel() {
  const events = useExecutionStore((state) => state.events);
  const currentStepIndex = useExecutionStore((state) => state.currentStepIndex);
  const goToStep = useExecutionStore((state) => state.goToStep);

  const activeStepRef = useRef<HTMLButtonElement | null>(null);

  // Auto-scroll active step pill into view when currentStepIndex changes
  useEffect(() => {
    if (activeStepRef.current) {
      activeStepRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [currentStepIndex]);

  return (
    <div className="flex flex-col w-full bg-zinc-950 border-t border-zinc-800/80 shrink-0">
      {/* Top Control Bar with Run, Pause, Next, Previous, Reset */}
      <ControlBar />

      {/* Timeline Event History & Step Navigation Strip */}
      <div className="h-28 px-4 py-3 bg-zinc-950 flex flex-col justify-between overflow-hidden">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-1.5 font-medium text-zinc-300">
            <History className="h-3.5 w-3.5 text-indigo-400" />
            <span>Execution Timeline Debugger</span>
          </div>
          <span className="text-[11px] text-zinc-400 font-mono">
            {events.length > 0
              ? `Step ${currentStepIndex >= 0 ? currentStepIndex + 1 : 0} of ${events.length}`
              : "No steps generated"}
          </span>
        </div>

        {/* Step List Pills Container: Step 1, Step 2, Step 3, Step 4... */}
        <div className="h-14 w-full rounded-xl bg-zinc-900/70 border border-zinc-800/80 flex items-center gap-2.5 px-3 overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-700">
          {events.length === 0 ? (
            <div className="flex items-center gap-2 text-xs text-zinc-500 w-full justify-center">
              <Activity className="h-4 w-4 text-zinc-600 shrink-0" />
              <span className="italic">Execution timeline will populate as code steps execute...</span>
            </div>
          ) : (
            events.map((evt, idx) => {
              const isActive = idx === currentStepIndex;
              const isPast = idx < currentStepIndex;
              const stepNumber = idx + 1;

              // Format event snippet preview
              let details = "";
              if ("output" in evt) {
                details = `out: "${(evt as any).output}"`;
              } else if ("name" in evt && "value" in evt) {
                details = `${(evt as any).name} = ${JSON.stringify((evt as any).value)}`;
              } else if ("expression" in evt) {
                details = `${(evt as any).expression} = ${JSON.stringify((evt as any).result)}`;
              } else if ("left" in evt && "right" in evt) {
                details = `${(evt as any).left} ${(evt as any).operator || "+"} ${(evt as any).right}`;
              }

              return (
                <button
                  key={evt.id ? `${evt.id}_${idx}` : `step_${idx}`}
                  ref={isActive ? activeStepRef : null}
                  onClick={() => goToStep(idx)}
                  className={`flex flex-col justify-center px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all border shrink-0 min-w-[120px] ${
                    isActive
                      ? "bg-indigo-600/30 border-indigo-500 text-indigo-200 ring-2 ring-indigo-500/40 shadow-lg shadow-indigo-500/20 scale-105"
                      : isPast
                      ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700"
                      : "bg-zinc-950/60 border-zinc-800/50 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-[10px] font-bold">
                    <span className="text-indigo-400">Step {stepNumber}</span>
                    {evt.line && <span className="text-zinc-500">L{evt.line}</span>}
                  </div>

                  <div className="text-[11px] font-semibold text-zinc-200 truncate mt-0.5">
                    {evt.type}
                  </div>

                  {details && (
                    <div className="text-[10px] text-zinc-400 truncate opacity-80">
                      {details}
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
