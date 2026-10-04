"use client";

import { Code2, BookOpen, Layers } from "lucide-react";
import { UserAccountHeader } from "@/components/UserAccountHeader";

interface NavbarProps {
  activeMode: "playground" | "learning";
  onModeChange: (mode: "playground" | "learning") => void;
}

export function Navbar({ activeMode, onModeChange }: NavbarProps) {
  return (
    <header className="h-14 w-full bg-zinc-950/90 border-b border-zinc-800/80 px-4 flex items-center justify-between shrink-0 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <div className="h-full w-full bg-zinc-950 rounded-[7px] flex items-center justify-center">
            <Code2 className="h-4 w-4 text-indigo-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight text-white text-base">TraceLab</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              v1.0
            </span>
          </div>
          <p className="text-xs text-zinc-400 hidden sm:block">Visual Runtime Platform for Learning Programming</p>
        </div>
      </div>

      {/* Center: Mode Toggles */}
      <div className="flex items-center gap-2">
        <div className="flex items-center p-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
          <button
            onClick={() => onModeChange("playground")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              activeMode === "playground"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Playground Mode</span>
          </button>

          <button
            onClick={() => onModeChange("learning")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              activeMode === "learning"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Guided Learning Mode</span>
          </button>
        </div>
      </div>

      {/* Right Side: User Account, OAuth & Progress Header */}
      <UserAccountHeader />
    </header>
  );
}
