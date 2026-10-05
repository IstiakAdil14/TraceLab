import { ExecutionEngine } from "@/runtime/ExecutionEngine";
import { RuntimeEvent } from "@/runtime/events";
import { SupportedLanguage } from "@/types/languages";

interface FunctionDef {
  name: string;
  params: string[];
  bodyLines: { lineText: string; lineNum: number }[];
  startLine: number;
  endLine: number;
}

const MAX_RECURSION_DEPTH = 30;

/**
 * Multi-Language Execution Engine & Parser for TraceLab
 * Supports JavaScript, Python, Java, C, and C++.
 * Emits unified RuntimeEvents consumed by the visualization engine.
 */
export function parseCodeByLanguage(code: string, language: SupportedLanguage): RuntimeEvent[] {
  if (!code || !code.trim()) return [];

  // For JavaScript, attempt Babel AST ExecutionEngine first
  if (language === "javascript") {
    try {
      const jsEngine = new ExecutionEngine();
      const jsEvents = jsEngine.execute(code);
      if (jsEvents && jsEvents.length > 0) {
        return jsEvents;
      }
    } catch (err) {
      // Fallback to multi-language line parser
    }
  }

  // Multi-language parser for Python, Java, C, C++
  const events: RuntimeEvent[] = [];
  let eventId = 1;
  const generateId = () => `evt_ml_${eventId++}`;

  const lines = code.split("\n");
  const env: Record<string, any> = {};
  const arrays: Record<string, any[]> = {};
  const functionRegistry: Record<string, FunctionDef> = {};
  const skipLines = new Set<number>();

  // --- Pre-Pass: Register Functions & Mark Lines to Skip in Main Pass ---
  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const rawLine = lines[i];
    const line = rawLine.trim();
    if (!line || line.startsWith("//") || line.startsWith("#") || line.startsWith("/*")) continue;

    // Python function def: def add(a, b):
    const pyDefMatch = line.match(/^def\s+([a-zA-Z_]\w*)\s*\((.*?)\):?$/);
    if (pyDefMatch) {
      const fnName = pyDefMatch[1];
      const params = pyDefMatch[2].split(",").map((s) => s.trim()).filter(Boolean);

      const bodyLines: { lineText: string; lineNum: number }[] = [];
      let lookAhead = i + 1;
      while (lookAhead < lines.length) {
        const nextRaw = lines[lookAhead];
        const nextTrim = nextRaw.trim();
        if (nextTrim && (nextRaw.startsWith(" ") || nextRaw.startsWith("\t"))) {
          bodyLines.push({ lineText: nextTrim, lineNum: lookAhead + 1 });
          skipLines.add(lookAhead + 1);
          lookAhead++;
        } else {
          break;
        }
      }

      functionRegistry[fnName] = {
        name: fnName,
        params,
        bodyLines,
        startLine: lineNum,
        endLine: lookAhead,
      };
      skipLines.add(lineNum);
      continue;
    }

    // C / C++ / Java function def: int add(int a, int b) { ... }
    const cDefMatch = line.match(/^(?:int|float|double|char|void|short|long|auto)\s+([a-zA-Z_]\w*)\s*\((.*?)\)/);
    if (cDefMatch && cDefMatch[1] !== "main" && !line.endsWith(";")) {
      const fnName = cDefMatch[1];
      const rawParams = cDefMatch[2];
      const params = extractParamNames(rawParams);

      const bodyLines: { lineText: string; lineNum: number }[] = [];
      let lookAhead = i + 1;
      let depth = line.includes("{") ? 1 : 0;
      let foundBrace = line.includes("{");

      while (lookAhead < lines.length) {
        const nextRaw = lines[lookAhead];
        const nextTrim = nextRaw.trim();

        if (nextTrim === "{") {
          foundBrace = true;
          depth++;
        } else if (nextTrim === "}") {
          depth--;
          if (foundBrace && depth === 0) {
            skipLines.add(lookAhead + 1);
            lookAhead++;
            break;
          }
        } else if (nextTrim) {
          bodyLines.push({ lineText: nextTrim, lineNum: lookAhead + 1 });
        }
        skipLines.add(lookAhead + 1);
        lookAhead++;
      }

      functionRegistry[fnName] = {
        name: fnName,
        params,
        bodyLines,
        startLine: lineNum,
        endLine: lookAhead,
      };
      skipLines.add(lineNum);
      continue;
    }
  }

  // Helper to emit variable events
  const emitVar = (name: string, val: any, lineNum: number, kind: "let" | "const" | "var" = "let") => {
    const rootName = name.split(".")[0];
    const isNew = !(rootName in env);

    if (name.includes(".")) {
      setNestedProperty(env, name, val);
    } else {
      env[name] = val;
    }

    if (Array.isArray(val)) arrays[name] = val;

    const rootVal = env[rootName];
    const clonedVal = deepClone(rootVal);

    if (isNew) {
      events.push({
        id: generateId(),
        line: lineNum,
        type: "CREATE_VARIABLE",
        name: rootName,
        value: clonedVal,
        kind,
      });
    } else {
      events.push({
        id: generateId(),
        line: lineNum,
        type: "UPDATE_VARIABLE",
        name: rootName,
        value: clonedVal,
      });
    }
  };

  // Helper to emit array events
  const emitArray = (name: string, elements: any[], lineNum: number) => {
    arrays[name] = elements;
    env[name] = elements;
    events.push({
      id: generateId(),
      line: lineNum,
      type: "CREATE_ARRAY",
      name,
      elements,
    });
  };

  // Helper to parse print statements across C, C++, Java, Python
  const parsePrintOutput = (line: string, lineNum: number, currentEnv: Record<string, any>): boolean => {
    let outputText: string | null = null;

    // C printf: printf("results: %d", SUM);
    const printfMatch = line.match(/^printf\s*\(\s*"(.*?)"\s*(?:,\s*(.+))?\s*\);?$/);
    if (printfMatch) {
      let fmt = printfMatch[1];
      const argsStr = printfMatch[2];
      if (argsStr) {
        const args = splitByTopLevelComma(argsStr);
        args.forEach((arg) => {
          const val = evaluateExpressionStr(arg, currentEnv, undefined, arrays, undefined, functionRegistry, events, generateId, lineNum);
          fmt = fmt.replace(/%[dfsdi]/, val !== undefined ? String(val) : "0");
        });
      }
      outputText = fmt.replace(/\\n/g, "");
    }

    // C++ std::cout << "results: " << SUM << std::endl;
    else if (line.includes("cout") && line.includes("<<")) {
      const parts = line.split("<<").map((s) => s.trim()).filter((s) => s && !s.includes("cout") && s !== ";" && !s.includes("endl"));
      const evaluatedParts = parts.map((p) => {
        const cleaned = p.replace(/^"/, "").replace(/"$/, "").trim();
        if (p.startsWith('"') && p.endsWith('"')) return cleaned;
        return evaluateExpressionStr(p, currentEnv, undefined, arrays, undefined, functionRegistry, events, generateId, lineNum);
      });
      outputText = evaluatedParts.join("");
    }

    // Java System.out.println("results: " + SUM);
    else if (line.includes("System.out.print")) {
      const match = line.match(/System\.out\.print(?:ln)?\s*\((.+)\);?/);
      if (match) {
        const expr = match[1];
        if (expr.includes("+")) {
          const parts = expr.split("+").map((s) => s.trim());
          outputText = parts
            .map((p) => {
              if (p.startsWith('"') && p.endsWith('"')) return p.slice(1, -1);
              return evaluateExpressionStr(p, currentEnv, undefined, arrays, undefined, functionRegistry, events, generateId, lineNum);
            })
            .join("");
        } else {
          outputText = String(evaluateExpressionStr(expr, currentEnv, undefined, arrays, undefined, functionRegistry, events, generateId, lineNum));
        }
      }
    }

    // Python print(...)
    else if (line.startsWith("print(") || line.startsWith("print ")) {
      const match = line.match(/^print\s*\((.+)\):?$/);
      if (match) {
        const args = splitByTopLevelComma(match[1]);
        outputText = args
          .map((a) => {
            if (a.startsWith('"') && a.endsWith('"')) return a.slice(1, -1);
            if (a.startsWith("'") && a.endsWith("'")) return a.slice(1, -1);
            const val = evaluateExpressionStr(a, currentEnv, undefined, arrays, undefined, functionRegistry, events, generateId, lineNum);
            return val !== undefined ? String(val) : a;
          })
          .join(" ");
      }
    }

    if (outputText !== null) {
      events.push({
        id: generateId(),
        line: lineNum,
        type: "CONSOLE_LOG",
        output: outputText,
      });
      return true;
    }

    return false;
  };

  // Helper to execute a single non-loop statement
  const executeSingleLine = (rawLine: string, lineNum: number, currentEnv: Record<string, any> = env): boolean => {
    let line = rawLine.trim();
    if (!line || line.startsWith("//") || line.startsWith("#") || line.startsWith("/*") || line.startsWith("class ") || line.startsWith("def ")) return false;

    // Expand increment/decrement e.g. i++; or ++i; -> i = i + 1
    const incMatch = line.match(/^(?:([a-zA-Z_]\w*)\+\+|\+\+([a-zA-Z_]\w*));?$/);
    if (incMatch) {
      const varName = incMatch[1] || incMatch[2];
      line = `${varName} = ${varName} + 1`;
    }
    const decMatch = line.match(/^(?:([a-zA-Z_]\w*)--|--([a-zA-Z_]\w*));?$/);
    if (decMatch) {
      const varName = decMatch[1] || decMatch[2];
      line = `${varName} = ${varName} - 1`;
    }

    // Expand compound assignments e.g. sum += i -> sum = sum + i
    const compoundMatch = line.match(/^([a-zA-Z_][\w\->\.]*)\s*(\+=|-=|\*=|\/=)\s*(.+);?$/);
    if (compoundMatch) {
      const varName = compoundMatch[1];
      const op = compoundMatch[2][0]; // +, -, *, /
      const expr = compoundMatch[3].replace(/;$/, "").trim();
      line = `${varName} = ${varName} ${op} ${expr}`;
    }

    // --- Check Print Statements First ---
    if (parsePrintOutput(line, lineNum, currentEnv)) return true;

    // --- Python Parser ---
    if (language === "python") {
      // Object/Node Instantiation: root = Node(1) or root = Node("A")
      const objInstMatch = line.match(/^([a-zA-Z_][\w\.]*)\s*=\s*([A-Z]\w*)\((.*)\)$/);
      if (objInstMatch) {
        const targetPath = objInstMatch[1];
        const argValStr = objInstMatch[3].trim();
        const argVal = evaluateExpressionStr(argValStr, currentEnv, undefined, arrays, undefined, functionRegistry, events, generateId, lineNum);
        const nodeVal = argVal !== undefined ? argVal : 1;
        const nodeObj = {
          val: nodeVal,
          data: nodeVal,
          left: null,
          right: null,
          children: [],
        };
        emitVar(targetPath, nodeObj, lineNum);
        return true;
      }

      // Object Method Call e.g. root.add_child(b) or list.append(x)
      const methodCallMatch = line.match(/^([a-zA-Z_][\w\.]*)\.([a-zA-Z_]\w*)\((.*)\);?$/);
      if (methodCallMatch) {
        const targetObjName = methodCallMatch[1];
        const methodName = methodCallMatch[2];
        const argStr = methodCallMatch[3].trim();
        const argVal = argStr ? (argStr in currentEnv ? currentEnv[argStr] : evaluateExpressionStr(argStr, currentEnv, undefined, arrays, undefined, functionRegistry, events, generateId, lineNum)) : undefined;

        let targetObj = resolvePropertyPath(targetObjName, currentEnv);
        if (!targetObj || typeof targetObj !== "object") {
          targetObj = { val: "Node", data: "Node", left: null, right: null, children: [] };
          currentEnv[targetObjName] = targetObj;
        }

        if (["add_child", "append", "push", "add"].includes(methodName) && argVal !== undefined) {
          if (!Array.isArray(targetObj.children)) {
            targetObj.children = [];
          }
          targetObj.children.push(argVal);

          // Map children to left & right if not already set
          if (!targetObj.left) targetObj.left = argVal;
          else if (!targetObj.right) targetObj.right = argVal;

          events.push({
            id: generateId(),
            line: lineNum,
            type: "CALL_FUNCTION",
            name: `${targetObjName}.${methodName}`,
            parameters: { child: argVal },
            stack: ["main()", `${targetObjName}.${methodName}(${argStr})`],
          });

          emitVar(targetObjName, targetObj, lineNum);
          return true;
        } else {
          events.push({
            id: generateId(),
            line: lineNum,
            type: "CALL_FUNCTION",
            name: `${targetObjName}.${methodName}`,
            parameters: argVal !== undefined ? { arg: argVal } : {},
            stack: ["main()", `${targetObjName}.${methodName}()`],
          });
          return true;
        }
      }

      // Standalone Function Call e.g. display_tree(root) or main() or print_tree(root) or add(2, 3)
      const fnCallMatch = line.match(/^([a-zA-Z_]\w*)\((.*)\);?$/);
      if (fnCallMatch && !line.startsWith("if") && !line.startsWith("for") && !line.startsWith("while")) {
        const fnName = fnCallMatch[1];
        const argStr = fnCallMatch[2].trim();
        const resVal = evaluateFunctionCall(fnName, argStr, currentEnv, arrays, functionRegistry, events, generateId, lineNum);
        if (resVal !== undefined) return true;
      }

      // Python Array Element Update: arr[3] = 100
      const pyArrUpdateMatch = line.match(/^([a-zA-Z_]\w*)\[(.+)\]\s*=\s*(.+)$/);
      if (pyArrUpdateMatch && !line.startsWith("if") && !line.startsWith("for") && !line.startsWith("while")) {
        const arrName = pyArrUpdateMatch[1];
        const idxExpr = pyArrUpdateMatch[2].trim();
        const valExpr = pyArrUpdateMatch[3].trim();

        const indexVal = evaluateExpressionStr(idxExpr, currentEnv, undefined, arrays, undefined, functionRegistry, events, generateId, lineNum);
        const newElemVal = evaluateExpressionStr(valExpr, currentEnv, undefined, arrays, undefined, functionRegistry, events, generateId, lineNum);

        const targetArr = arrays[arrName] || currentEnv[arrName];
        if (Array.isArray(targetArr) && indexVal >= 0) {
          targetArr[indexVal] = newElemVal;
          emitArray(arrName, targetArr, lineNum);
          return true;
        }
      }

      // Python Array: arr = [5, 2, 8, 1, 4]
      const pyArrMatch = line.match(/^([a-zA-Z_]\w*)\s*=\s*\[(.*)\]$/);
      if (pyArrMatch) {
        const name = pyArrMatch[1];
        const rawEls = pyArrMatch[2].split(",").map((s) => s.trim()).filter(Boolean);
        const els = rawEls.map((s) => (isNaN(Number(s)) ? s.replace(/['"]/g, "") : Number(s)));
        emitArray(name, els, lineNum);
        return true;
      }

      // Python Multiple Assignment e.g. a, b = 3, 4
      const pyMultiMatch = line.match(/^([a-zA-Z_]\w*(?:\s*,\s*[a-zA-Z_]\w*)+)\s*=\s*(.+)$/);
      if (pyMultiMatch) {
        const names = pyMultiMatch[1].split(",").map((s) => s.trim());
        const exprs = pyMultiMatch[2].split(",").map((s) => s.trim());
        names.forEach((name, i) => {
          const valStr = exprs[i] || "0";
          const val = evaluateExpressionStr(valStr, currentEnv, undefined, arrays, undefined, functionRegistry, events, generateId, lineNum);
          emitVar(name, val, lineNum);
        });
        return true;
      }

      // Python Property Assignment or Variable Assignment e.g. root.left = ... or x = 10 or x = add(2, 3)
      const pyVarMatch = line.match(/^([a-zA-Z_][\w\.]*)\s*=\s*(.+)$/);
      if (pyVarMatch && !line.startsWith("for") && !line.startsWith("if") && !line.startsWith("def") && !line.startsWith("while")) {
        const targetPath = pyVarMatch[1];
        const expr = pyVarMatch[2];

        const val = evaluateExpressionStr(
          expr,
          currentEnv,
          (op, left, right, res) => {
            events.push({
              id: generateId(),
              line: lineNum,
              type: op === "+" ? "ADD" : op === "-" ? "SUB" : op === "*" ? "MUL" : op === "/" ? "DIV" : "OPERATION",
              expression: `${left} ${op} ${right}`,
              operator: op,
              left,
              right,
              result: res,
            });
          },
          arrays,
          (arrName, indexVal, accessedVal) => {
            events.push({
              id: generateId(),
              line: lineNum,
              type: "ACCESS_ARRAY",
              name: arrName,
              index: indexVal,
              value: accessedVal,
            });
          },
          functionRegistry,
          events,
          generateId,
          lineNum
        );

        emitVar(targetPath, val, lineNum);
        return true;
      }

      // Python Condition: if left > right:
      const pyCondMatch = line.match(/^if\s+(.+):?$/);
      if (pyCondMatch) {
        const cond = pyCondMatch[1].replace(/:$/, "");
        const condDetails = parseConditionDetails(cond, currentEnv);
        events.push({
          id: generateId(),
          line: lineNum,
          type: "CHECK_CONDITION",
          condition: condDetails.conditionText,
          left: condDetails.left,
          operator: condDetails.op,
          right: condDetails.right,
          result: condDetails.result,
          branchTaken: condDetails.result ? "then" : "else",
        });
        return true;
      }
    }

    // --- C / C++ / Java Parser ---
    if (language === "c" || language === "cpp" || language === "java") {
      // Ignore boilerplate imports/classes
      if (
        line.startsWith("#include") ||
        line.startsWith("using namespace") ||
        line.startsWith("public class") ||
        line.startsWith("package") ||
        line === "{" ||
        line === "}" ||
        line === "return 0;"
      ) {
        return true;
      }

      // Main Function entry point
      if (line.includes("main(") || line.includes("main (")) {
        events.push({
          id: generateId(),
          line: lineNum,
          type: "CALL_FUNCTION",
          name: "main",
          parameters: {},
          stack: ["main()"],
        });
        return true;
      }

      // Object/Node Instantiation e.g. Node* root = new Node(1); or root->left = new Node(2);
      const cObjMatch = line.match(/^(?:Node\*\s+)?([a-zA-Z_][\w\->\.]*)\s*=\s*(?:new\s+)?([A-Z]\w*)\((.*)\);?$/);
      if (cObjMatch) {
        const rawPath = cObjMatch[1].replace(/->/g, ".");
        const argValStr = cObjMatch[3].trim();
        const argVal = evaluateExpressionStr(argValStr, currentEnv, undefined, arrays, undefined, functionRegistry, events, generateId, lineNum);
        const nodeVal = argVal !== undefined ? argVal : 1;
        const nodeObj = {
          val: nodeVal,
          data: nodeVal,
          left: null,
          right: null,
          children: [],
        };
        emitVar(rawPath, nodeObj, lineNum);
        return true;
      }

      // C/C++/Java Array Element Update e.g. arr[3] = 100;
      const arrUpdateMatch = line.match(/^([a-zA-Z_]\w*)\[(.+)\]\s*=\s*(.+);?$/);
      if (arrUpdateMatch && !line.startsWith("if") && !line.startsWith("for") && !line.startsWith("while")) {
        const arrName = arrUpdateMatch[1];
        const idxExpr = arrUpdateMatch[2].trim();
        const valExpr = arrUpdateMatch[3].trim();

        const indexVal = evaluateExpressionStr(idxExpr, currentEnv, undefined, arrays, undefined, functionRegistry, events, generateId, lineNum);
        const newElemVal = evaluateExpressionStr(valExpr, currentEnv, undefined, arrays, undefined, functionRegistry, events, generateId, lineNum);

        const targetArr = arrays[arrName] || currentEnv[arrName];
        if (Array.isArray(targetArr) && indexVal >= 0) {
          targetArr[indexVal] = newElemVal;
          emitArray(arrName, targetArr, lineNum);
          return true;
        }
      }

      // C/C++/Java Array: int arr[5] = {5, 2, 8, 1, 4}; or int[] arr = {5, 2, 8, 1, 4}; or std::vector<int> arr = {5, 2, 8, 1, 4};
      const arrMatch = line.match(/(?:int|float|double|char|std::vector<int>|int\[\])\s+([a-zA-Z_]\w*)(?:\[\d*\])?\s*=\s*\{([^}]+)\}/);
      if (arrMatch) {
        const name = arrMatch[1];
        const rawEls = arrMatch[2].split(",").map((s) => s.trim()).filter(Boolean);
        const els = rawEls.map((s) => Number(s));
        emitArray(name, els, lineNum);
        return true;
      }

      // C/C++/Java Type Declaration (e.g. int result = factorial(4); or int x = arr[2]; or int a = 3, b = 4, SUM;)
      const typeDeclMatch = line.match(/^(int|float|double|char|long|short|auto)\s+(.+);?$/);
      if (typeDeclMatch && !line.startsWith("for") && !line.startsWith("if") && !line.startsWith("while") && !line.includes("{")) {
        const declBody = typeDeclMatch[2].replace(/;$/, "").trim();
        const parts = splitByTopLevelComma(declBody);

        parts.forEach((part) => {
          if (part.includes("=")) {
            const eqIdx = part.indexOf("=");
            const name = part.slice(0, eqIdx).trim();
            const expr = part.slice(eqIdx + 1).trim();

            const val = evaluateExpressionStr(
              expr,
              currentEnv,
              (op, left, right, res) => {
                events.push({
                  id: generateId(),
                  line: lineNum,
                  type: op === "+" ? "ADD" : op === "-" ? "SUB" : op === "*" ? "MUL" : op === "/" ? "DIV" : "OPERATION",
                  expression: `${left} ${op} ${right}`,
                  operator: op,
                  left,
                  right,
                  result: res,
                });
              },
              arrays,
              (arrName, indexVal, accessedVal) => {
                events.push({
                  id: generateId(),
                  line: lineNum,
                  type: "ACCESS_ARRAY",
                  name: arrName,
                  index: indexVal,
                  value: accessedVal,
                });
              },
              functionRegistry,
              events,
              generateId,
              lineNum
            );
            emitVar(name, val, lineNum);
          } else {
            const name = part.trim();
            if (name) {
              emitVar(name, 0, lineNum);
            }
          }
        });
        return true;
      }

      // C/C++/Java Variable Assignment (e.g. SUM = a + b; or result = factorial(4); or x = arr[2];)
      const varAssignMatch = line.match(/^([a-zA-Z_][\w\->\.]*)\s*=\s*(.+);?$/);
      if (varAssignMatch && !line.startsWith("for") && !line.startsWith("if") && !line.startsWith("while")) {
        const rawPath = varAssignMatch[1].replace(/->/g, ".");
        let expr = varAssignMatch[2].replace(/;$/, "").trim();

        const val = evaluateExpressionStr(
          expr,
          currentEnv,
          (op, left, right, res) => {
            events.push({
              id: generateId(),
              line: lineNum,
              type: op === "+" ? "ADD" : op === "-" ? "SUB" : op === "*" ? "MUL" : op === "/" ? "DIV" : "OPERATION",
              expression: `${left} ${op} ${right}`,
              operator: op,
              left,
              right,
              result: res,
            });
          },
          arrays,
          (arrName, indexVal, accessedVal) => {
            events.push({
              id: generateId(),
              line: lineNum,
              type: "ACCESS_ARRAY",
              name: arrName,
              index: indexVal,
              value: accessedVal,
            });
          },
          functionRegistry,
          events,
          generateId,
          lineNum
        );
        emitVar(rawPath, val, lineNum);
        return true;
      }

      // Standalone Function Call e.g. add(2, 3); or print_tree(root);
      const fnCallMatch = line.match(/^([a-zA-Z_]\w*)\((.*)\);?$/);
      if (fnCallMatch && !line.startsWith("if") && !line.startsWith("for") && !line.startsWith("while")) {
        const fnName = fnCallMatch[1];
        const argStr = fnCallMatch[2].trim();
        const resVal = evaluateFunctionCall(fnName, argStr, currentEnv, arrays, functionRegistry, events, generateId, lineNum);
        if (resVal !== undefined) return true;
      }

      // C/C++/Java Condition: if (left > right)
      const ifMatch = line.match(/^if\s*\((.+)\)/);
      if (ifMatch) {
        const cond = ifMatch[1];
        const condDetails = parseConditionDetails(cond, currentEnv);
        events.push({
          id: generateId(),
          line: lineNum,
          type: "CHECK_CONDITION",
          condition: condDetails.conditionText,
          left: condDetails.left,
          operator: condDetails.op,
          right: condDetails.right,
          result: condDetails.result,
          branchTaken: condDetails.result ? "then" : "else",
        });
        return true;
      }
    }

    return false;
  };

  // Main Parsing Loop over lines
  for (let idx = 0; idx < lines.length; idx++) {
    const lineNum = idx + 1;
    if (skipLines.has(lineNum)) continue;

    const rawLine = lines[idx];
    const line = rawLine.trim();
    if (!line) continue;

    // --- Check Python For / While Loops ---
    if (language === "python") {
      const pyLoopMatch = line.match(/^for\s+([a-zA-Z_]\w*)\s+in\s+range\((.+)\):?$/);
      if (pyLoopMatch) {
        const varName = pyLoopMatch[1];
        const rangeArg = pyLoopMatch[2].split(",").map((s) => s.trim());
        let maxIt = 5;
        if (rangeArg.length === 1) maxIt = isNaN(Number(rangeArg[0])) ? 5 : Number(rangeArg[0]);
        else if (rangeArg.length >= 2) maxIt = isNaN(Number(rangeArg[1])) ? 5 : Number(rangeArg[1]);

        // Collect indented body lines
        const bodyLines: { lineText: string; lineNum: number }[] = [];
        let lookAhead = idx + 1;
        while (lookAhead < lines.length) {
          const nextRaw = lines[lookAhead];
          const nextTrim = nextRaw.trim();
          if (nextTrim && (nextRaw.startsWith(" ") || nextRaw.startsWith("\t"))) {
            bodyLines.push({ lineText: nextTrim, lineNum: lookAhead + 1 });
            lookAhead++;
          } else {
            break;
          }
        }

        // Execute loop iterations
        for (let iter = 0; iter < Math.min(maxIt, 50); iter++) {
          env[varName] = iter;
          events.push({
            id: generateId(),
            line: lineNum,
            type: "LOOP_ITERATION",
            iteration: iter + 1,
            maxIterations: maxIt,
            progressPercent: Math.min(100, Math.round(((iter + 1) / maxIt) * 100)),
            variableName: varName,
            variableValue: iter,
            conditionText: `${varName} < ${maxIt}`,
          });

          bodyLines.forEach((b) => executeSingleLine(b.lineText, b.lineNum, env));
        }

        idx = lookAhead - 1;
        continue;
      }

      const pyWhileMatch = line.match(/^while\s+(.+):?$/);
      if (pyWhileMatch) {
        const condStr = pyWhileMatch[1].replace(/:$/, "").trim();

        // Collect indented body lines
        const bodyLines: { lineText: string; lineNum: number }[] = [];
        let lookAhead = idx + 1;
        while (lookAhead < lines.length) {
          const nextRaw = lines[lookAhead];
          const nextTrim = nextRaw.trim();
          if (nextTrim && (nextRaw.startsWith(" ") || nextRaw.startsWith("\t"))) {
            bodyLines.push({ lineText: nextTrim, lineNum: lookAhead + 1 });
            lookAhead++;
          } else {
            break;
          }
        }

        // Execute while iterations with condition checking
        let loopCount = 0;
        const SAFETY_LIMIT = 50;

        while (loopCount < SAFETY_LIMIT) {
          const condDetails = parseConditionDetails(condStr, env);

          events.push({
            id: generateId(),
            line: lineNum,
            type: "CHECK_CONDITION",
            condition: condDetails.conditionText,
            left: condDetails.left,
            operator: condDetails.op,
            right: condDetails.right,
            result: condDetails.result,
            branchTaken: condDetails.result ? "then" : "else",
          });

          if (!condDetails.result) break;

          loopCount++;
          bodyLines.forEach((b) => executeSingleLine(b.lineText, b.lineNum, env));
        }

        idx = lookAhead - 1;
        continue;
      }
    }

    // --- Check C / C++ / Java Loop Headers (for & while) ---
    if (language === "c" || language === "cpp" || language === "java") {
      const forMatch = line.match(/^for\s*\(\s*(?:int\s+)?([a-zA-Z_]\w*)\s*=\s*(\d+);\s*\1\s*<\s*(\d+);\s*.*\)/);
      if (forMatch) {
        const varName = forMatch[1];
        const startVal = Number(forMatch[2]);
        const maxIt = Number(forMatch[3]);

        // Collect block body lines enclosed in { ... }
        const bodyLines: { lineText: string; lineNum: number }[] = [];
        let lookAhead = idx + 1;
        let depth = 0;
        let foundBrace = false;

        while (lookAhead < lines.length) {
          const nextRaw = lines[lookAhead];
          const nextTrim = nextRaw.trim();

          if (nextTrim === "{") {
            foundBrace = true;
            depth++;
          } else if (nextTrim === "}") {
            depth--;
            if (foundBrace && depth === 0) {
              lookAhead++;
              break;
            }
          } else if (nextTrim) {
            bodyLines.push({ lineText: nextTrim, lineNum: lookAhead + 1 });
          }
          lookAhead++;
        }

        // Execute loop iterations
        for (let iter = startVal; iter < Math.min(maxIt, 50); iter++) {
          env[varName] = iter;
          events.push({
            id: generateId(),
            line: lineNum,
            type: "LOOP_ITERATION",
            iteration: iter - startVal + 1,
            maxIterations: maxIt - startVal,
            progressPercent: Math.min(100, Math.round(((iter - startVal + 1) / (maxIt - startVal)) * 100)),
            variableName: varName,
            variableValue: iter,
            conditionText: `${varName} < ${maxIt}`,
          });

          bodyLines.forEach((b) => executeSingleLine(b.lineText, b.lineNum, env));
        }

        idx = lookAhead - 1;
        continue;
      }

      const whileMatch = line.match(/^while\s*\((.+)\)/);
      if (whileMatch) {
        const condStr = whileMatch[1];

        // Collect block body lines enclosed in { ... }
        const bodyLines: { lineText: string; lineNum: number }[] = [];
        let lookAhead = idx + 1;
        let depth = 0;
        let foundBrace = false;

        while (lookAhead < lines.length) {
          const nextRaw = lines[lookAhead];
          const nextTrim = nextRaw.trim();

          if (nextTrim === "{") {
            foundBrace = true;
            depth++;
          } else if (nextTrim === "}") {
            depth--;
            if (foundBrace && depth === 0) {
              lookAhead++;
              break;
            }
          } else if (nextTrim) {
            bodyLines.push({ lineText: nextTrim, lineNum: lookAhead + 1 });
          }
          lookAhead++;
        }

        // Execute while iterations with explicit condition checking
        let loopCount = 0;
        const SAFETY_LIMIT = 50;

        while (loopCount < SAFETY_LIMIT) {
          const condDetails = parseConditionDetails(condStr, env);

          events.push({
            id: generateId(),
            line: lineNum,
            type: "CHECK_CONDITION",
            condition: condDetails.conditionText,
            left: condDetails.left,
            operator: condDetails.op,
            right: condDetails.right,
            result: condDetails.result,
            branchTaken: condDetails.result ? "then" : "else",
          });

          if (!condDetails.result) break;

          loopCount++;
          bodyLines.forEach((b) => executeSingleLine(b.lineText, b.lineNum, env));
        }

        idx = lookAhead - 1;
        continue;
      }
    }

    // Process regular single line
    executeSingleLine(rawLine, lineNum, env);
  }

  return events;
}

// Extracts clean parameter names from C/C++/Java/Python parameter list string
function extractParamNames(rawParamsStr: string): string[] {
  if (!rawParamsStr.trim()) return [];
  return rawParamsStr.split(",").map((p) => {
    const parts = p.trim().split(/\s+/);
    return parts[parts.length - 1].replace(/[\*&]/g, "");
  }).filter(Boolean);
}

// Helper to evaluate function call e.g. add(2, 3) or factorial(4)
function evaluateFunctionCall(
  fnName: string,
  argsStr: string,
  currentEnv: Record<string, any>,
  arrays: Record<string, any[]>,
  functionRegistry: Record<string, FunctionDef>,
  events: RuntimeEvent[],
  generateId: () => string,
  lineNum: number,
  parentStack: string[] = ["main()"]
): any {
  // Safety check against recursion stack overflow
  if (parentStack.length > MAX_RECURSION_DEPTH) {
    return 1;
  }

  // Check Builtin Math functions first
  if (fnName === "pow" || fnName === "Math.pow") {
    const args = splitByTopLevelComma(argsStr).map((a) => evaluateExpressionStr(a, currentEnv, undefined, arrays, undefined, functionRegistry, events, generateId, lineNum, parentStack));
    return Math.pow(Number(args[0] || 0), Number(args[1] || 0));
  }
  if (fnName === "sqrt" || fnName === "Math.sqrt") {
    const arg = evaluateExpressionStr(argsStr, currentEnv, undefined, arrays, undefined, functionRegistry, events, generateId, lineNum, parentStack);
    return Math.sqrt(Number(arg || 0));
  }
  if (fnName === "abs" || fnName === "Math.abs") {
    const arg = evaluateExpressionStr(argsStr, currentEnv, undefined, arrays, undefined, functionRegistry, events, generateId, lineNum, parentStack);
    return Math.abs(Number(arg || 0));
  }
  if (fnName === "max" || fnName === "Math.max") {
    const args = splitByTopLevelComma(argsStr).map((a) => evaluateExpressionStr(a, currentEnv, undefined, arrays, undefined, functionRegistry, events, generateId, lineNum, parentStack));
    return Math.max(Number(args[0] || 0), Number(args[1] || 0));
  }
  if (fnName === "min" || fnName === "Math.min") {
    const args = splitByTopLevelComma(argsStr).map((a) => evaluateExpressionStr(a, currentEnv, undefined, arrays, undefined, functionRegistry, events, generateId, lineNum, parentStack));
    return Math.min(Number(args[0] || 0), Number(args[1] || 0));
  }

  // User-defined Function Execution
  const fnDef = functionRegistry[fnName];
  if (!fnDef) return undefined;

  const rawArgs = splitByTopLevelComma(argsStr);
  const argValues = rawArgs.map((a) => evaluateExpressionStr(a, currentEnv, undefined, arrays, undefined, functionRegistry, events, generateId, lineNum, parentStack));

  const fnEnv: Record<string, any> = { ...currentEnv };
  const paramsMap: Record<string, any> = {};

  fnDef.params.forEach((param, i) => {
    const val = argValues[i] !== undefined ? argValues[i] : 0;
    fnEnv[param] = val;
    paramsMap[param] = val;
  });

  const currentCallSig = `${fnName}(${argsStr})`;
  const newStack = [...parentStack, currentCallSig];

  events.push({
    id: generateId(),
    line: lineNum,
    type: "CALL_FUNCTION",
    name: fnName,
    parameters: paramsMap,
    stack: newStack,
  });

  let returnVal: any = undefined;
  let i = 0;

  while (i < fnDef.bodyLines.length) {
    const b = fnDef.bodyLines[i];
    const lineText = b.lineText.trim();
    if (!lineText) { i++; continue; }

    // Conditional statement check inside function body e.g. if(n == 1) or if (n <= 1)
    const ifMatch = lineText.match(/^if\s*\((.+)\)/);
    if (ifMatch) {
      const condStr = ifMatch[1];
      const condDetails = parseConditionDetails(condStr, fnEnv);

      events.push({
        id: generateId(),
        line: b.lineNum,
        type: "CHECK_CONDITION",
        condition: condDetails.conditionText,
        left: condDetails.left,
        operator: condDetails.op,
        right: condDetails.right,
        result: condDetails.result,
        branchTaken: condDetails.result ? "then" : "else",
      });

      if (!condDetails.result) {
        // Skip consequent single line or block
        i++;
        if (i < fnDef.bodyLines.length && fnDef.bodyLines[i].lineText.trim() === "{") {
          let depth = 1;
          i++;
          while (i < fnDef.bodyLines.length && depth > 0) {
            const t = fnDef.bodyLines[i].lineText.trim();
            if (t === "{") depth++;
            else if (t === "}") depth--;
            i++;
          }
        } else {
          i++;
        }
        continue;
      } else {
        // Condition is true! Move into consequent
        i++;
        if (i < fnDef.bodyLines.length && fnDef.bodyLines[i].lineText.trim() === "{") {
          i++;
        }
        continue;
      }
    }

    if (lineText.startsWith("return ")) {
      const retExpr = lineText.replace(/^return\s+/, "").replace(/;$/, "").trim();
      returnVal = evaluateExpressionStr(
        retExpr,
        fnEnv,
        (op, left, right, res) => {
          events.push({
            id: generateId(),
            line: b.lineNum,
            type: op === "+" ? "ADD" : op === "-" ? "SUB" : op === "*" ? "MUL" : op === "/" ? "DIV" : "OPERATION",
            expression: `${left} ${op} ${right}`,
            operator: op,
            left,
            right,
            result: res,
          });
        },
        arrays,
        undefined,
        functionRegistry,
        events,
        generateId,
        b.lineNum,
        newStack
      );

      events.push({
        id: generateId(),
        line: b.lineNum,
        type: "RETURN_FUNCTION",
        name: fnName,
        returnValue: returnVal,
        stack: newStack,
      });
      break;
    }

    i++;
  }

  return returnVal;
}

// Splits comma-separated strings at top level (ignoring commas inside [], {}, ())
function splitByTopLevelComma(str: string): string[] {
  const parts: string[] = [];
  let current = "";
  let depthBracket = 0;
  let depthBrace = 0;
  let depthParen = 0;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === "[") depthBracket++;
    else if (char === "]") depthBracket--;
    else if (char === "{") depthBrace++;
    else if (char === "}") depthBrace--;
    else if (char === "(") depthParen++;
    else if (char === ")") depthParen--;

    if (char === "," && depthBracket === 0 && depthBrace === 0 && depthParen === 0) {
      parts.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  if (current.trim()) {
    parts.push(current.trim());
  }
  return parts;
}

// Finds binary operators strictly at top level (ignoring operators inside parentheses like factorial(n - 1))
function findTopLevelBinaryOp(str: string): { leftRaw: string; op: string; rightRaw: string } | null {
  let depthParen = 0;
  let depthBracket = 0;
  let depthBrace = 0;

  for (let i = str.length - 1; i >= 0; i--) {
    const char = str[i];
    if (char === ")") depthParen++;
    else if (char === "(") depthParen--;
    else if (char === "]") depthBracket++;
    else if (char === "[") depthBracket--;
    else if (char === "}") depthBrace++;
    else if (char === "{") depthBrace--;

    if (depthParen === 0 && depthBracket === 0 && depthBrace === 0) {
      if (char === "+" || char === "-" || char === "*" || char === "/") {
        if (i > 0 && !["+", "-", "*", "/", "(", "="].includes(str[i - 1].trim())) {
          return {
            leftRaw: str.slice(0, i).trim(),
            op: char,
            rightRaw: str.slice(i + 1).trim(),
          };
        }
      }
    }
  }

  return null;
}

// Helper for evaluating condition details e.g. "i < 3" -> left: 0, op: "<", right: 3, result: true
function parseConditionDetails(cond: string, env: Record<string, any>): { conditionText: string; left: any; op: string; right: any; result: boolean } {
  const match = cond.match(/^([a-zA-Z_][\w\.]*|\d+)\s*(>|<|>=|<=|==|!=)\s*([a-zA-Z_][\w\.]*|\d+)$/);
  if (match) {
    const leftRaw = match[1];
    const op = match[2];
    const rightRaw = match[3];

    const left = leftRaw in env ? env[leftRaw] : leftRaw.includes(".") ? resolvePropertyPath(leftRaw, env) : Number(leftRaw);
    const right = rightRaw in env ? env[rightRaw] : rightRaw.includes(".") ? resolvePropertyPath(rightRaw, env) : Number(rightRaw);

    let res = true;
    switch (op) {
      case ">": res = left > right; break;
      case "<": res = left < right; break;
      case ">=": res = left >= right; break;
      case "<=": res = left <= right; break;
      case "==": res = left == right; break;
      case "!=": res = left != right; break;
    }

    return {
      conditionText: `${left} ${op} ${right}`,
      left,
      op,
      right,
      result: res,
    };
  }

  const res = evaluateConditionStr(cond, env);
  return {
    conditionText: cond,
    left: undefined,
    op: "check",
    right: undefined,
    result: res,
  };
}

// Resolves object property paths e.g. root.data or root.left.data
function resolvePropertyPath(pathStr: string, env: Record<string, any>): any {
  const parts = pathStr.replace(/->/g, ".").split(".").map((s) => s.trim());
  let curr = env[parts[0]];

  for (let i = 1; i < parts.length; i++) {
    if (curr === null || curr === undefined || typeof curr !== "object") return undefined;
    curr = curr[parts[i]];
  }

  return curr;
}

// Sets nested property on object e.g. setNestedProperty(env, "root.left", nodeObj)
function setNestedProperty(env: Record<string, any>, pathStr: string, value: any): void {
  const parts = pathStr.replace(/->/g, ".").split(".").map((s) => s.trim());
  if (parts.length === 1) {
    env[parts[0]] = value;
    return;
  }

  let curr = env[parts[0]];
  if (!curr || typeof curr !== "object") {
    curr = { val: "Node", data: "Node", left: null, right: null };
    env[parts[0]] = curr;
  }

  for (let i = 1; i < parts.length - 1; i++) {
    const key = parts[i];
    if (!curr[key] || typeof curr[key] !== "object" || curr[key] === null) {
      curr[key] = { val: "Node", data: "Node", left: null, right: null };
    }
    curr = curr[key];
  }

  curr[parts[parts.length - 1]] = value;
}

// Helpers for expression parsing
function evaluateExpressionStr(
  expr: string,
  env: Record<string, any>,
  onOperation?: (op: string, left: any, right: any, res: any) => void,
  arrays?: Record<string, any[]>,
  onAccessArray?: (arrName: string, index: number, val: any) => void,
  functionRegistry?: Record<string, FunctionDef>,
  events?: RuntimeEvent[],
  generateId?: () => string,
  lineNum?: number,
  parentStack: string[] = ["main()"]
): any {
  let cleaned = expr.replace(/;$/, "").trim();
  if (!cleaned) return undefined;
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) return cleaned.slice(1, -1);
  if (cleaned.startsWith("'") && cleaned.endsWith("'")) return cleaned.slice(1, -1);
  if (!isNaN(Number(cleaned))) return Number(cleaned);

  // Safety check against recursion stack overflow
  if (parentStack.length > MAX_RECURSION_DEPTH) {
    return 1;
  }

  // Function Call evaluation e.g. add(2, 3) or factorial(4)
  const fnCallMatch = cleaned.match(/^([a-zA-Z_]\w*)\s*\((.*)\)$/);
  if (fnCallMatch && functionRegistry && events && generateId && lineNum !== undefined) {
    const fnName = fnCallMatch[1];
    const argsStr = fnCallMatch[2].trim();
    if (fnName in functionRegistry || ["pow", "sqrt", "abs", "max", "min"].includes(fnName)) {
      const res = evaluateFunctionCall(fnName, argsStr, env, arrays || {}, functionRegistry, events, generateId, lineNum, parentStack);
      if (res !== undefined) return res;
    }
  }

  if (cleaned in env) return env[cleaned];

  // Array indexing e.g. arr[2] or arr[i] or arr[i + 1]
  const arrIdxMatch = cleaned.match(/^([a-zA-Z_]\w*)\[(.+)\]$/);
  if (arrIdxMatch) {
    const arrName = arrIdxMatch[1];
    const idxExpr = arrIdxMatch[2].trim();
    let indexVal = 0;

    if (env[idxExpr] !== undefined) indexVal = Number(env[idxExpr]);
    else if (idxExpr.includes("+")) {
      const parts = idxExpr.split("+").map((p) => p.trim());
      const base = env[parts[0]] !== undefined ? Number(env[parts[0]]) : isNaN(Number(parts[0])) ? 0 : Number(parts[0]);
      const offset = isNaN(Number(parts[1])) ? 0 : Number(parts[1]);
      indexVal = base + offset;
    } else if (idxExpr.includes("-")) {
      const parts = idxExpr.split("-").map((p) => p.trim());
      const base = env[parts[0]] !== undefined ? Number(env[parts[0]]) : isNaN(Number(parts[0])) ? 0 : Number(parts[0]);
      const offset = isNaN(Number(parts[1])) ? 0 : Number(parts[1]);
      indexVal = base - offset;
    } else if (!isNaN(Number(idxExpr))) {
      indexVal = Number(idxExpr);
    }

    const targetArr = (arrays && arrays[arrName]) || env[arrName] || [];
    const val = Array.isArray(targetArr) && indexVal >= 0 && indexVal < targetArr.length ? targetArr[indexVal] : undefined;

    if (onAccessArray) onAccessArray(arrName, indexVal, val);
    return val;
  }

  // Property path lookup e.g. root.data, root.left.data
  if (cleaned.includes(".") || cleaned.includes("->")) {
    const propVal = resolvePropertyPath(cleaned, env);
    if (propVal !== undefined) return propVal;
  }

  // Binary operations e.g. a + b or sum + i or x * 2 or n * factorial(n - 1)
  const topOp = findTopLevelBinaryOp(cleaned);
  if (topOp) {
    const left = evaluateExpressionStr(topOp.leftRaw, env, undefined, arrays, onAccessArray, functionRegistry, events, generateId, lineNum, parentStack);
    const right = evaluateExpressionStr(topOp.rightRaw, env, undefined, arrays, onAccessArray, functionRegistry, events, generateId, lineNum, parentStack);

    let res: any;
    if (topOp.op === "+") res = Number(left) + Number(right);
    else if (topOp.op === "-") res = Number(left) - Number(right);
    else if (topOp.op === "*") res = Number(left) * Number(right);
    else if (topOp.op === "/") res = Number(left) / Number(right);

    if (onOperation) onOperation(topOp.op, left, right, res);
    return res;
  }

  return cleaned;
}

function evaluateConditionStr(cond: string, env: Record<string, any>): boolean {
  const match = cond.match(/^([a-zA-Z_][\w\.]*|\d+)\s*(>|<|>=|<=|==|!=)\s*([a-zA-Z_][\w\.]*|\d+)$/);
  if (match) {
    const leftRaw = match[1];
    const op = match[2];
    const rightRaw = match[3];

    const left = leftRaw in env ? env[leftRaw] : leftRaw.includes(".") ? resolvePropertyPath(leftRaw, env) : Number(leftRaw);
    const right = rightRaw in env ? env[rightRaw] : rightRaw.includes(".") ? resolvePropertyPath(rightRaw, env) : Number(rightRaw);

    switch (op) {
      case ">": return left > right;
      case "<": return left < right;
      case ">=": return left >= right;
      case "<=": return left <= right;
      case "==": return left == right;
      case "!=": return left != right;
    }
  }
  return true;
}

function deepClone(obj: any): any {
  if (obj === null || typeof obj !== "object") return obj;
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch {
    return obj;
  }
}
