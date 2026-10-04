"use client";

import { Play, Pause, SkipForward, SkipBack, RotateCcw, Gauge } from "lucide-react";
import { useExecutionStore } from "@/store/useExecutionStore";
import { useEffect } from "react";

export function ControlBar() {
  const events = useExecutionStore((state) => state.events);
  const currentStepIndex = useExecutionStore((state) => state.currentStepIndex);
  const isPlaying = useExecutionStore((state) => state.isPlaying);
  const playbackSpeed = useExecutionStore((state) => state.playbackSpeed);
  const togglePlay = useExecutionStore((state) => state.togglePlay);
  const setIsPlaying = useExecutionStore((state) => state.setIsPlaying);
  const nextStep = useExecutionStore((state) => state.nextStep);
  const previousStep = useExecutionStore((state) => state.previousStep);
  const goToStep = useExecutionStore((state) => state.goToStep);
  const reset = useExecutionStore((state) => state.reset);
  const setPlaybackSpeed = useExecutionStore((state) => state.setPlaybackSpeed);

  const totalSteps = events.length;
  const currentStepDisplay = totalSteps > 0 && currentStepIndex >= 0 ? currentStepIndex + 1 : 0;

  // Global Keyboard Shortcuts (ArrowRight -> Next, ArrowLeft -> Prev, Space -> Toggle Play)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;

      // Never intercept keyboard events when user is typing inside Monaco Editor, inputs, textareas, or contenteditables
      if (
        target &&
        (
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) ||
          target.isContentEditable ||
          target.closest(".monaco-editor") !== null ||
          target.closest("[contenteditable='true']") !== null ||
          target.getAttribute("role") === "textbox"
        )
      ) {
        return;
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        nextStep();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        previousStep();
      } else if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextStep, previousStep, togglePlay]);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between w-full px-4 py-2 bg-zinc-900/90 border-t border-zinc-800/80 gap-3 shrink-0">
      {/* Control Buttons Group */}
      <div className="flex items-center gap-2">
        {/* Reset Button */}
        <button
          type="button"
          onClick={reset}
          disabled={totalSteps === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-300 hover:text-white text-xs font-medium border border-zinc-700/50 transition-all active:scale-95"
          title="Reset Execution (Home)"
        >
          <RotateCcw className="h-3.5 w-3.5 text-zinc-400" />
          <span>Reset</span>
        </button>

        {/* Previous Button */}
        <button
          type="button"
          onClick={previousStep}
          disabled={currentStepIndex <= 0}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-300 hover:text-white text-xs font-medium border border-zinc-700/50 transition-all active:scale-95"
          title="Previous Step (Left Arrow)"
        >
          <SkipBack className="h-3.5 w-3.5 text-indigo-400" />
          <span>Previous</span>
        </button>

        {/* Run Button */}
        <button
          type="button"
          onClick={togglePlay}
          disabled={totalSteps === 0}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
            isPlaying
              ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
              : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20"
          }`}
          title="Run / Resume Execution (Space)"
        >
          <Play className="h-3.5 w-3.5 fill-current" />
          <span>Run</span>
        </button>

        {/* Pause Button */}
        <button
          type="button"
          onClick={() => setIsPlaying(false)}
          disabled={!isPlaying}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-amber-400 text-xs font-medium border border-amber-500/20 transition-all active:scale-95"
          title="Pause Execution"
        >
          <Pause className="h-3.5 w-3.5" />
          <span>Pause</span>
        </button>

        {/* Next Button */}
        <button
          type="button"
          onClick={nextStep}
          disabled={totalSteps === 0 || currentStepIndex >= totalSteps - 1}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-300 hover:text-white text-xs font-medium border border-zinc-700/50 transition-all active:scale-95"
          title="Next Step (Right Arrow)"
        >
          <SkipForward className="h-3.5 w-3.5 text-indigo-400" />
          <span>Next</span>
        </button>
      </div>

      {/* Interactive Step Slider Scrubber */}
      <div className="flex-1 max-w-xs mx-2 flex items-center gap-2">
        <input
          type="range"
          min={0}
          max={totalSteps > 0 ? totalSteps - 1 : 0}
          value={currentStepIndex >= 0 ? currentStepIndex : 0}
          onChange={(e) => goToStep(Number(e.target.value))}
          disabled={totalSteps === 0}
          className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none disabled:opacity-40"
        />
      </div>

      {/* Speed Selector & Step Counter Display */}
      <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
        {/* Speed Controls */}
        <div className="flex items-center gap-1 bg-zinc-950 px-2 py-1 rounded-md border border-zinc-800 text-[11px]">
          <Gauge className="h-3 w-3 text-indigo-400 mr-1" />
          {[
            { label: "0.5x", speed: 1200 },
            { label: "1x", speed: 800 },
            { label: "2x", speed: 400 },
          ].map((sp) => (
            <button
              key={sp.label}
              onClick={() => setPlaybackSpeed(sp.speed)}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                playbackSpeed === sp.speed
                  ? "bg-indigo-600 text-white font-bold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {sp.label}
            </button>
          ))}
        </div>

        {/* Step Badge */}
        <span className="px-2.5 py-1 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-300 whitespace-nowrap">
          Step: <strong className="text-indigo-400">{currentStepDisplay}</strong> / {totalSteps}
        </span>
      </div>
    </div>
  );
}
