"use client";

import { useState } from "react";
import { LESSONS, Lesson } from "@/features/learning";
import { BookOpen, CheckCircle2, HelpCircle, Code2, Sparkles, ArrowRight, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";

interface LearningPanelProps {
  onLoadLessonCode: (code: string) => void;
}

export function LearningPanel({ onLoadLessonCode }: LearningPanelProps) {
  const [activeLessonId, setActiveLessonId] = useState<string>("variables");
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  const activeLesson = LESSONS.find((l) => l.id === activeLessonId) || LESSONS[0];

  const handleSelectLesson = (lesson: Lesson) => {
    setActiveLessonId(lesson.id);
    setSelectedQuizOption(null);
    setQuizSubmitted(false);
    onLoadLessonCode(lesson.code);
  };

  const handleLoadChallenge = () => {
    onLoadLessonCode(activeLesson.challenge.targetCode);
  };

  return (
    <div className="flex flex-col h-full w-full bg-zinc-950 border-r border-zinc-800/80 overflow-y-auto p-4 space-y-4">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-indigo-400" />
          <h2 className="text-sm font-bold text-white tracking-wide">Guided Learning Mode</h2>
        </div>
        <span className="text-[11px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-semibold">
          {LESSONS.length} Lessons Available
        </span>
      </div>

      {/* Lesson Selection Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {LESSONS.map((lesson) => (
          <button
            key={lesson.id}
            onClick={() => handleSelectLesson(lesson)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border shrink-0 ${
              lesson.id === activeLessonId
                ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20"
                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
            }`}
          >
            {lesson.title.split(" ")[0]}
          </button>
        ))}
      </div>

      {/* 1. Explanation Card */}
      <motion.div
        key={`exp_${activeLesson.id}`}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-2"
      >
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
          <Sparkles className="h-4 w-4 text-indigo-400" />
          <span>Lesson 1. {activeLesson.title}</span>
        </div>
        <p className="text-xs text-zinc-300 leading-relaxed font-sans">
          {activeLesson.explanation}
        </p>

        <button
          onClick={() => onLoadLessonCode(activeLesson.code)}
          className="mt-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
        >
          <span>Visualize Concept Code</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </motion.div>

      {/* 2. Mini Quiz */}
      <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-3 font-sans">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
          <HelpCircle className="h-4 w-4 text-amber-400" />
          <span>Mini Quiz</span>
        </div>

        <p className="text-xs font-medium text-zinc-200">{activeLesson.quiz.question}</p>

        <div className="space-y-2">
          {activeLesson.quiz.options.map((opt) => {
            const isSelected = selectedQuizOption === opt.id;
            const isCorrect = opt.id === activeLesson.quiz.correctOptionId;

            let btnStyle = "bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-800";
            if (quizSubmitted) {
              if (isCorrect) btnStyle = "bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold";
              else if (isSelected) btnStyle = "bg-red-950/60 border-red-500 text-red-300 line-through";
            } else if (isSelected) {
              btnStyle = "bg-indigo-950/60 border-indigo-500 text-indigo-200 font-bold";
            }

            return (
              <button
                key={opt.id}
                onClick={() => {
                  setSelectedQuizOption(opt.id);
                  setQuizSubmitted(true);
                }}
                className={`w-full p-2.5 rounded-lg border text-xs text-left transition-all ${btnStyle}`}
              >
                {opt.text}
              </button>
            );
          })}
        </div>

        {quizSubmitted && (
          <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 font-sans">
            <span className="font-bold text-emerald-400">Feedback: </span>
            {activeLesson.quiz.explanation}
          </div>
        )}
      </div>

      {/* 3. Challenge Card */}
      <div className="p-4 rounded-xl bg-zinc-900/90 border border-indigo-500/30 space-y-2 font-sans">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
          <Code2 className="h-4 w-4 text-emerald-400" />
          <span>Coding Challenge</span>
        </div>

        <div className="text-xs font-bold text-white">{activeLesson.challenge.title}</div>
        <p className="text-xs text-zinc-400">{activeLesson.challenge.description}</p>

        <button
          onClick={handleLoadChallenge}
          className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
        >
          <Lightbulb className="h-3.5 w-3.5" />
          <span>Load Challenge Code</span>
        </button>
      </div>
    </div>
  );
}
