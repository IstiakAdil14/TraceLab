"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { EditorPanel } from "@/components/EditorPanel";
import { VisualizerPanel } from "@/components/VisualizerPanel";
import { TimelinePanel } from "@/components/TimelinePanel";
import { LearningPanel } from "@/components/LearningPanel";

export default function Home() {
  const [activeMode, setActiveMode] = useState<"playground" | "learning">("playground");
  const [externalCode, setExternalCode] = useState<string | undefined>(undefined);

  const handleLoadLessonCode = (code: string) => {
    setExternalCode(code);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 font-sans">
      {/* Top Navbar */}
      <Navbar activeMode={activeMode} onModeChange={setActiveMode} />

      {/* Main Split Content Layout */}
      <main className="flex flex-1 w-full min-h-0 overflow-hidden">
        {/* Left Side: Learning Panel (in Guided Learning Mode) or Code Editor */}
        {activeMode === "learning" ? (
          <section className="w-[360px] shrink-0 h-full flex flex-col border-r border-zinc-800">
            <LearningPanel onLoadLessonCode={handleLoadLessonCode} />
          </section>
        ) : null}

        {/* Code Editor Panel */}
        <section className="flex-1 h-full flex flex-col min-w-[320px]">
          <EditorPanel externalCode={externalCode} />
        </section>

        {/* Visualization Panel (Right) */}
        <section className="w-1/2 h-full flex flex-col min-w-[320px]">
          <VisualizerPanel />
        </section>
      </main>

      {/* Bottom Timeline Panel */}
      <TimelinePanel />
    </div>
  );
}
