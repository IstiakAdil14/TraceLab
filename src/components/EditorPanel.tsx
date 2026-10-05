"use client";

import Editor, { OnMount } from "@monaco-editor/react";
import { FileCode, BookOpen, Wand2, Plus, Upload, FileCheck } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { parseCodeByLanguage } from "@/parser";
import { parseJupyterNotebook } from "@/parser/ipynbParser";
import { useExecutionStore } from "@/store/useExecutionStore";
import { ALGORITHM_EXAMPLES } from "@/features/algorithms";
import { SUPPORTED_LANGUAGES, SupportedLanguage, detectLanguageFromCode } from "@/types/languages";

interface EditorPanelProps {
  externalCode?: string;
}

export function EditorPanel({ externalCode }: EditorPanelProps) {
  const selectedLanguage = useExecutionStore((state) => state.selectedLanguage);
  const setSelectedLanguage = useExecutionStore((state) => state.setSelectedLanguage);

  const [selectedAlgo, setSelectedAlgo] = useState<string>("");
  const [autoDetect, setAutoDetect] = useState<boolean>(true);
  const [importedFileName, setImportedFileName] = useState<string | null>(null);

  const [code, setCode] = useState<string>(
    externalCode ||
      `// C TraceLab Execution
#include <stdio.h>

int main() {
    printf("Greetings! Welcome to TraceLab!\\n");
    int status = 1;
    if (status == 1) {
        printf("Ready to visualize your code step-by-step.\\n");
    }
    return 0;
}
`
  );

  const events = useExecutionStore((state) => state.events);
  const currentStepIndex = useExecutionStore((state) => state.currentStepIndex);
  const isPlaying = useExecutionStore((state) => state.isPlaying);
  const playbackSpeed = useExecutionStore((state) => state.playbackSpeed);

  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeLangInfo = SUPPORTED_LANGUAGES.find((l) => l.id === selectedLanguage) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    if (externalCode !== undefined) {
      setCode(externalCode);
      setSelectedAlgo("");
      const detected = detectLanguageFromCode(externalCode);
      if (detected) setSelectedLanguage(detected);
    }
  }, [externalCode, setSelectedLanguage]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  const handleSelectLanguage = (langId: SupportedLanguage) => {
    setSelectedLanguage(langId);
    setAutoDetect(false);

    const langInfo = SUPPORTED_LANGUAGES.find((l) => l.id === langId);
    if (selectedAlgo) {
      const currentAlgoObj = ALGORITHM_EXAMPLES.find((ex) => ex.id === selectedAlgo);
      if (currentAlgoObj?.codeMap && currentAlgoObj.codeMap[langId]) {
        setCode(currentAlgoObj.codeMap[langId]!);
      } else if (langInfo) {
        setCode(langInfo.defaultCode);
      }
    }
  };

  const handleSelectAlgorithm = (algoId: string) => {
    setSelectedAlgo(algoId);
    setImportedFileName(null);
    if (!algoId) return;

    const found = ALGORITHM_EXAMPLES.find((ex) => ex.id === algoId);
    if (found) {
      if (found.codeMap && found.codeMap[selectedLanguage]) {
        setCode(found.codeMap[selectedLanguage]!);
      } else {
        setCode(found.code);
      }
    }
  };

  const handleCodeChange = (newCode: string | undefined) => {
    const updated = newCode || "";

    // Check if user pasted raw Jupyter Notebook (.ipynb) JSON content directly into editor
    if (updated.trim().startsWith("{") && updated.includes('"cells"')) {
      try {
        const parsed = parseJupyterNotebook(updated);
        if (parsed.code && !parsed.code.startsWith("# Error")) {
          setCode(parsed.code);
          setSelectedLanguage("python");
          setAutoDetect(false);
          setImportedFileName("pasted_notebook.ipynb");
          return;
        }
      } catch (err) {
        // Fall through if not valid JSON
      }
    }

    setCode(updated);

    if (selectedAlgo !== "") {
      setSelectedAlgo("");
    }

    if (autoDetect && updated.trim()) {
      const detectedLang = detectLanguageFromCode(updated);
      if (detectedLang && detectedLang !== selectedLanguage) {
        setSelectedLanguage(detectedLang);
      }
    }
  };

  // Handle uploading Jupyter Notebook (.ipynb) or raw code files (.py, .c, .js, etc.)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportedFileName(file.name);
    setSelectedAlgo("");

    const reader = new FileReader();
    reader.onload = (evt) => {
      const fileContent = evt.target?.result as string;
      if (!fileContent) return;

      if (file.name.endsWith(".ipynb")) {
        const parsed = parseJupyterNotebook(fileContent);
        setCode(parsed.code);
        setSelectedLanguage("python");
        setAutoDetect(false);
      } else {
        setCode(fileContent);
        const detected = detectLanguageFromCode(fileContent);
        if (detected) setSelectedLanguage(detected);
      }
    };
    reader.readAsText(file);
  };

  const handleInsertVariable = (type: "number" | "array" | "loop") => {
    let snippet = "";
    if (selectedLanguage === "javascript") {
      if (type === "number") snippet = `\nlet x = 42;\n`;
      else if (type === "array") snippet = `\nlet nums = [10, 20, 30, 40];\n`;
      else if (type === "loop") snippet = `\nfor (let i = 0; i < 4; i++) {\n  let val = nums[i];\n}\n`;
    } else if (selectedLanguage === "python") {
      if (type === "number") snippet = `\nx = 42\n`;
      else if (type === "array") snippet = `\nnums = [10, 20, 30, 40]\n`;
      else if (type === "loop") snippet = `\nfor i in range(4):\n    val = nums[i]\n`;
    } else if (selectedLanguage === "java") {
      if (type === "number") snippet = `\nint x = 42;\n`;
      else if (type === "array") snippet = `\nint[] nums = {10, 20, 30, 40};\n`;
      else if (type === "loop") snippet = `\nfor (int i = 0; i < 4; i++) {\n    int val = nums[i];\n}\n`;
    } else if (selectedLanguage === "c") {
      if (type === "number") snippet = `\nint x = 42;\n`;
      else if (type === "array") snippet = `\nint nums[4] = {10, 20, 30, 40};\n`;
      else if (type === "loop") snippet = `\nfor (int i = 0; i < 4; i++) {\n    int val = nums[i];\n}\n`;
    } else if (selectedLanguage === "cpp") {
      if (type === "number") snippet = `\nint x = 42;\n`;
      else if (type === "array") snippet = `\nstd::vector<int> nums = {10, 20, 30, 40};\n`;
      else if (type === "loop") snippet = `\nfor (int i = 0; i < 4; i++) {\n    int val = nums[i];\n}\n`;
    }

    const updated = code + snippet;
    setCode(updated);
    setSelectedAlgo("");
  };

  useEffect(() => {
    const parsedEvents = parseCodeByLanguage(code, selectedLanguage);
    useExecutionStore.getState().setEvents(parsedEvents);
  }, [code, selectedLanguage]);

  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;

    const activeEvent = currentStepIndex >= 0 && currentStepIndex < events.length ? events[currentStepIndex] : null;
    const activeLine = activeEvent?.line;

    if (activeLine) {
      const monaco = monacoRef.current;
      const newDecorations = [
        {
          range: new monaco.Range(activeLine, 1, activeLine, 1),
          options: {
            isWholeLine: true,
            className: "active-execution-line",
            glyphMarginClassName: "active-execution-glyph",
          },
        },
      ];

      decorationsRef.current = editorRef.current.deltaDecorations(
        decorationsRef.current,
        newDecorations
      );
      editorRef.current.revealLineInCenter(activeLine);
    } else {
      decorationsRef.current = editorRef.current.deltaDecorations(
        decorationsRef.current,
        []
      );
    }
  }, [currentStepIndex, events]);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      useExecutionStore.getState().nextStep();
    }, playbackSpeed);
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed]);

  return (
    <div className="flex flex-col h-full w-full bg-zinc-950 border-r border-zinc-800/80 overflow-hidden">
      {/* Hidden File Input for .ipynb and .py files */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".ipynb,.py,.c,.cpp,.java,.js"
        className="hidden"
      />

      {/* Panel Header */}
      <div className="h-12 px-4 bg-zinc-900/90 border-b border-zinc-800/80 flex items-center justify-between shrink-0 gap-2">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-none py-1">
          {/* Active File Tab */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 font-mono font-semibold shrink-0">
            <FileCode className="h-3.5 w-3.5 text-indigo-400" />
            <span>{importedFileName || activeLangInfo.filename}</span>
          </div>

          {/* Import .ipynb Notebook Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition-all shrink-0 shadow-sm"
            title="Import Jupyter Notebook (.ipynb) or Python script (.py)"
          >
            <Upload className="h-3.5 w-3.5 text-purple-400" />
            <span>Import .ipynb / .py</span>
          </button>

          {/* Auto-Detect Toggle Button */}
          <button
            onClick={() => setAutoDetect(!autoDetect)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all shrink-0 ${
              autoDetect
                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20"
                : "bg-zinc-950 text-zinc-500 border-zinc-800 hover:text-zinc-300"
            }`}
            title="Toggle Automatic Code Language Detection"
          >
            <Wand2 className={`h-3 w-3 ${autoDetect ? "text-emerald-400 animate-pulse" : "text-zinc-500"}`} />
            <span>{autoDetect ? "Auto-Detect ON" : "Auto-Detect OFF"}</span>
          </button>

          {/* 5 Language Selector Pills */}
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800/90 shrink-0">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isActive = lang.id === selectedLanguage;
              return (
                <button
                  key={lang.id}
                  onClick={() => handleSelectLanguage(lang.id)}
                  title={lang.name}
                  className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20 font-bold scale-105"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                  }`}
                >
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                      isActive ? "bg-indigo-500 text-white" : "bg-zinc-800/80 text-zinc-400"
                    }`}
                  >
                    {lang.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Preset Algorithm Selection */}
          <div className="flex items-center gap-1.5 bg-zinc-950 px-2.5 py-1 rounded-lg border border-purple-500/30 shrink-0">
            <BookOpen className="h-3.5 w-3.5 text-purple-400" />
            <select
              value={selectedAlgo}
              onChange={(e) => handleSelectAlgorithm(e.target.value)}
              className="bg-transparent text-xs text-purple-300 font-semibold outline-none cursor-pointer"
            >
              <option value="" className="bg-zinc-900 text-emerald-400 font-bold">
                ✏️ Custom Code / User Input Mode
              </option>

              <optgroup label="Load Algorithm Template" className="bg-zinc-900 text-zinc-400 font-semibold">
                {ALGORITHM_EXAMPLES.map((algo) => (
                  <option key={algo.id} value={algo.id} className="bg-zinc-900 text-zinc-200">
                    {algo.name} ({algo.category})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* Quick Snippets & Line Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => handleInsertVariable("array")}
            className="hidden sm:flex items-center gap-1 text-[11px] bg-zinc-900 hover:bg-zinc-800 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-md font-mono transition-colors"
            title="Insert Array Variable"
          >
            <Plus className="h-3 w-3 text-indigo-400" /> Array
          </button>

          {currentStepIndex >= 0 && events[currentStepIndex]?.line && (
            <span className="text-indigo-400 font-mono text-[11px] bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20 font-semibold">
              ▶ Line {events[currentStepIndex].line}
            </span>
          )}
        </div>
      </div>

      {/* Code Editor Container */}
      <div className="flex-1 w-full h-full relative">
        <Editor
          height="100%"
          language={activeLangInfo.monacoLang}
          theme="vs-dark"
          value={code}
          onMount={handleEditorDidMount}
          onChange={handleCodeChange}
          options={{
            fontSize: 14,
            fontFamily: "Geist Mono, JetBrains Mono, monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 12, bottom: 12 },
            lineNumbersMinChars: 3,
            glyphMargin: true,
            smoothScrolling: true,
            cursorBlinking: "smooth",
          }}
        />
      </div>
    </div>
  );
}
