import { ExecutionEngine } from "@/runtime/ExecutionEngine";
import { RuntimeEvent } from "@/runtime/events";
import { parseCodeByLanguage } from "./multiLanguageParser";
import { SupportedLanguage } from "@/types/languages";

/**
 * TraceLab Main Parser & Multi-Language Execution Engine Entrypoint
 * Walks AST/Lexer nodes, evaluates real scope/variables/callStack/arrays state,
 * and emits a clean stream of RuntimeEvents for the visualizer across JavaScript, Python, Java, C, and C++.
 */
export function parseJavaScript(code: string): RuntimeEvent[] {
  const engine = new ExecutionEngine();
  return engine.execute(code);
}

export { parseCodeByLanguage };
