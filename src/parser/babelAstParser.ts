import { parse } from "@babel/parser";
import * as t from "@babel/types";
import { RuntimeEvent } from "@/runtime/events";

/**
 * TraceLab Babel AST Parser Engine
 * Converts JavaScript source code into a Babel AST (ESTree representation)
 * and translates AST nodes directly into TraceLab RuntimeEvents.
 */
export function parseCodeToAstEvents(code: string): RuntimeEvent[] {
  const events: RuntimeEvent[] = [];
  if (!code || !code.trim()) return events;

  const environment: Record<string, any> = {};
  const functionRegistry: Record<string, { params: string[]; body: t.Statement }> = {};
  const callStack: string[] = ["main()"];
  let eventCounter = 1;

  try {
    // Phase 13: Convert raw JS string into a Babel AST Tree
    const ast = parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
      errorRecovery: true,
    });

    const getLine = (node: t.Node): number => node.loc?.start?.line || 1;

    // Evaluates literal values from AST nodes
    const evaluateLiteral = (node: t.Node | null | undefined): any => {
      if (!node) return undefined;
      if (t.isNumericLiteral(node) || t.isStringLiteral(node) || t.isBooleanLiteral(node)) {
        return node.value;
      }
      if (t.isNullLiteral(node)) return null;
      if (t.isIdentifier(node)) return environment[node.name];
      if (t.isArrayExpression(node)) {
        return node.elements.map((el) => evaluateLiteral(el as t.Node));
      }
      return undefined;
    };

    // Recursively processes AST Expression nodes
    const evaluateAstExpression = (node: t.Node | null | undefined, line: number): any => {
      if (!node) return undefined;

      if (t.isNumericLiteral(node) || t.isStringLiteral(node) || t.isBooleanLiteral(node)) {
        return node.value;
      }
      if (t.isNullLiteral(node)) return null;

      if (t.isIdentifier(node)) {
        const varName = node.name;
        const val = environment[varName];
        events.push({
          id: `evt_${eventCounter++}`,
          line,
          type: "READ",
          name: varName,
          value: val,
        });
        return val;
      }

      if (t.isArrayExpression(node)) {
        return node.elements.map((el) => evaluateAstExpression(el as t.Node, line));
      }

      if (t.isMemberExpression(node)) {
        const arrName = t.isIdentifier(node.object) ? node.object.name : "arr";
        const indexVal = evaluateAstExpression(node.property, line);
        const arr = environment[arrName];
        let val: any = undefined;

        if (Array.isArray(arr) && typeof indexVal === "number") {
          val = arr[indexVal];
          events.push({
            id: `evt_${eventCounter++}`,
            line,
            type: "ACCESS_ARRAY",
            name: arrName,
            index: indexVal,
            value: val,
          });
        }
        return val;
      }

      if (t.isCallExpression(node)) {
        const fnName = t.isIdentifier(node.callee) ? node.callee.name : "func";
        const argValues = node.arguments.map((arg) => evaluateAstExpression(arg, line));
        const fnDef = functionRegistry[fnName];

        const savedEnv = { ...environment };

        const paramsMap: Record<string, any> = {};
        if (fnDef) {
          fnDef.params.forEach((param, idx) => {
            const val = argValues[idx];
            paramsMap[param] = val;
            environment[param] = val;
          });
        }

        const callLabel = `${fnName}(${Object.values(paramsMap).join(", ")})`;
        callStack.push(callLabel);

        events.push({
          id: `evt_${eventCounter++}`,
          line,
          type: "CALL_FUNCTION",
          name: fnName,
          parameters: paramsMap,
          stack: [...callStack],
        });

        // Execute AST function body
        let retVal: any = undefined;
        if (fnDef?.body) {
          const bodyNodes = t.isBlockStatement(fnDef.body) ? fnDef.body.body : [fnDef.body];
          for (const stmt of bodyNodes) {
            if (t.isReturnStatement(stmt)) {
              retVal = evaluateAstExpression(stmt.argument, getLine(stmt));
              break;
            } else {
              executeAstStatement(stmt);
            }
          }
        }

        callStack.pop();
        Object.assign(environment, savedEnv);

        events.push({
          id: `evt_${eventCounter++}`,
          line,
          type: "RETURN_FUNCTION",
          name: fnName,
          returnValue: retVal,
        });

        return retVal;
      }

      if (t.isBinaryExpression(node)) {
        const leftVal = evaluateAstExpression(node.left, line);
        const rightVal = evaluateAstExpression(node.right, line);
        let res: any;

        switch (node.operator) {
          case "+": res = leftVal + rightVal; break;
          case "-": res = leftVal - rightVal; break;
          case "*": res = leftVal * rightVal; break;
          case "/": res = leftVal / rightVal; break;
          case ">": res = leftVal > rightVal; break;
          case "<": res = leftVal < rightVal; break;
          case ">=": res = leftVal >= rightVal; break;
          case "<=": res = leftVal <= rightVal; break;
          case "==":
          case "===": res = leftVal === rightVal; break;
          case "!=":
          case "!==": res = leftVal !== rightVal; break;
          default: res = leftVal + rightVal;
        }

        const isComparison = [">", "<", ">=", "<=", "==", "===", "!=", "!=="].includes(node.operator);
        if (!isComparison) {
          const opType =
            node.operator === "+" ? "ADD" : node.operator === "-" ? "SUB" : node.operator === "*" ? "MUL" : node.operator === "/" ? "DIV" : "OPERATION";

          events.push({
            id: `evt_${eventCounter++}`,
            line,
            type: opType,
            operator: node.operator,
            left: leftVal,
            right: rightVal,
            result: res,
            expression: `${leftVal} ${node.operator} ${rightVal}`,
          });
        }

        return res;
      }

      return undefined;
    };

    // Recursively processes AST Statement nodes
    const executeAstStatement = (node: t.Statement) => {
      if (!node) return;
      const line = getLine(node);

      if (t.isFunctionDeclaration(node) && t.isIdentifier(node.id)) {
        const fnName = node.id.name;
        const params = node.params.map((p) => (t.isIdentifier(p) ? p.name : "param"));
        functionRegistry[fnName] = { params, body: node.body };
      } else if (t.isVariableDeclaration(node)) {
        const kind = node.kind as "let" | "const" | "var";
        for (const declarator of node.declarations) {
          if (t.isIdentifier(declarator.id)) {
            const varName = declarator.id.name;
            let finalValue: any = undefined;
            if (declarator.init) {
              finalValue = evaluateAstExpression(declarator.init, line);
            }
            environment[varName] = finalValue;

            events.push({
              id: `evt_${eventCounter++}`,
              line,
              type: "CREATE_VARIABLE",
              name: varName,
              value: finalValue !== undefined ? finalValue : null,
              kind,
            });

            if (Array.isArray(finalValue)) {
              events.push({
                id: `evt_${eventCounter++}`,
                line,
                type: "CREATE_ARRAY",
                name: varName,
                elements: finalValue,
              });
            }
          }
        }
      } else if (t.isForStatement(node)) {
        if (node.init) {
          if (t.isVariableDeclaration(node.init)) executeAstStatement(node.init);
          else if (t.isExpression(node.init)) evaluateAstExpression(node.init, line);
        }

        let varName = "i";
        if (t.isVariableDeclaration(node.init) && t.isIdentifier(node.init.declarations[0]?.id)) {
          varName = node.init.declarations[0].id.name;
        }

        let maxIterations = 3;
        if (t.isBinaryExpression(node.test)) {
          const limitVal = evaluateLiteral(node.test.right);
          if (typeof limitVal === "number") maxIterations = limitVal;
        }

        let loopCounter = 0;
        const SAFETY_LIMIT = 50;

        while (loopCounter < SAFETY_LIMIT) {
          const currentVal = environment[varName] ?? loopCounter;
          let condRes = true;
          if (node.test) {
            condRes = Boolean(evaluateAstExpression(node.test, line));
          }

          if (!condRes) break;

          loopCounter++;
          const progressPercent = Math.min(100, Math.round((loopCounter / maxIterations) * 100));

          events.push({
            id: `evt_${eventCounter++}`,
            line,
            type: "LOOP_ITERATION",
            iteration: loopCounter,
            maxIterations,
            progressPercent,
            variableName: varName,
            variableValue: currentVal,
            conditionText: `${varName} < ${maxIterations}`,
          });

          if (node.body) {
            if (t.isBlockStatement(node.body)) {
              node.body.body.forEach(executeAstStatement);
            } else {
              executeAstStatement(node.body);
            }
          }

          if (node.update) {
            evaluateAstExpression(node.update, line);
          }
        }
      } else if (t.isIfStatement(node)) {
        const testNode = node.test;
        let condText = "condition";
        let leftVal: any = undefined;
        let rightVal: any = undefined;
        let op = ">";

        if (t.isBinaryExpression(testNode)) {
          const leftName = t.isIdentifier(testNode.left) ? testNode.left.name : "left";
          const rightName = t.isIdentifier(testNode.right) ? testNode.right.name : "right";
          condText = `${leftName} ${testNode.operator} ${rightName}`;
          op = testNode.operator;
        }

        const condResult = Boolean(evaluateAstExpression(testNode, line));

        if (t.isBinaryExpression(testNode)) {
          leftVal = t.isIdentifier(testNode.left) ? environment[testNode.left.name] : evaluateLiteral(testNode.left);
          rightVal = t.isIdentifier(testNode.right) ? environment[testNode.right.name] : evaluateLiteral(testNode.right);
        }

        events.push({
          id: `evt_${eventCounter++}`,
          line,
          type: "CHECK_CONDITION",
          condition: condText,
          left: leftVal,
          right: rightVal,
          operator: op,
          result: condResult,
          branchTaken: condResult ? "then" : "else",
        });

        if (condResult && node.consequent) {
          if (t.isBlockStatement(node.consequent)) {
            node.consequent.body.forEach(executeAstStatement);
          } else {
            executeAstStatement(node.consequent);
          }
        } else if (!condResult && node.alternate) {
          if (t.isBlockStatement(node.alternate)) {
            node.alternate.body.forEach(executeAstStatement);
          } else {
            executeAstStatement(node.alternate as t.Statement);
          }
        }
      } else if (t.isExpressionStatement(node)) {
        evaluateAstExpression(node.expression, line);
      } else if (t.isBlockStatement(node)) {
        node.body.forEach(executeAstStatement);
      }
    };

    ast.program.body.forEach(executeAstStatement);

    return events;
  } catch (error) {
    console.error("Babel AST Parsing Error:", error);
    return [];
  }
}
