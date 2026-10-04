import { parse } from "@babel/parser";
import * as t from "@babel/types";
import { RuntimeContext } from "./RuntimeContext";
import { RuntimeEvent } from "./events";

/**
 * ExecutionEngine
 * Real execution engine that parses source code into Babel AST, walks the AST nodes,
 * uses RuntimeContext to track execution state, and emits RuntimeEvent streams.
 */
export class ExecutionEngine {
  private ctx: RuntimeContext;
  private functionDefs: Map<string, { params: string[]; body: t.Statement }>;

  constructor() {
    this.ctx = new RuntimeContext();
    this.functionDefs = new Map();
  }

  public execute(code: string): RuntimeEvent[] {
    if (!code || !code.trim()) return [];

    try {
      const ast = parse(code, {
        sourceType: "module",
        plugins: ["jsx", "typescript"],
        errorRecovery: true,
      });

      ast.program.body.forEach((stmt) => this.executeStatement(stmt));

      return this.ctx.getEvents();
    } catch (error) {
      console.error("ExecutionEngine AST Error:", error);
      return this.ctx.getEvents();
    }
  }

  private getLine(node: t.Node): number {
    return node.loc?.start?.line || 1;
  }

  private evaluateExpression(node: t.Node | null | undefined): any {
    if (!node) return undefined;
    const line = this.getLine(node);

    if (t.isNumericLiteral(node) || t.isStringLiteral(node) || t.isBooleanLiteral(node)) {
      return node.value;
    }
    if (t.isNullLiteral(node)) return null;

    if (t.isIdentifier(node)) {
      return this.ctx.getVariable(node.name, line);
    }

    if (t.isArrayExpression(node)) {
      const elements = node.elements.map((el) => this.evaluateExpression(el as t.Node));
      return elements;
    }

    if (t.isMemberExpression(node)) {
      const arrName = t.isIdentifier(node.object) ? node.object.name : "arr";
      const indexVal = this.evaluateExpression(node.property);
      if (typeof indexVal === "number") {
        return this.ctx.accessArray(arrName, indexVal, line);
      }
      return undefined;
    }

    if (t.isCallExpression(node)) {
      const fnName = t.isIdentifier(node.callee) ? node.callee.name : "func";
      const argValues = node.arguments.map((arg) => this.evaluateExpression(arg));
      const fnDef = this.functionDefs.get(fnName);

      const paramsMap: Record<string, any> = {};
      if (fnDef) {
        fnDef.params.forEach((param, idx) => {
          paramsMap[param] = argValues[idx];
        });
      }

      this.ctx.pushCallFrame(fnName, paramsMap, line);

      let retVal: any = undefined;
      if (fnDef?.body) {
        const bodyNodes = t.isBlockStatement(fnDef.body) ? fnDef.body.body : [fnDef.body];
        for (const stmt of bodyNodes) {
          if (t.isReturnStatement(stmt)) {
            retVal = this.evaluateExpression(stmt.argument);
            break;
          } else {
            this.executeStatement(stmt);
          }
        }
      }

      this.ctx.popCallFrame(fnName, retVal, line);
      return retVal;
    }

    if (t.isBinaryExpression(node)) {
      const leftVal = this.evaluateExpression(node.left);
      const rightVal = this.evaluateExpression(node.right);
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

        this.ctx.emitEvent({
          id: this.ctx.generateEventId(),
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

    if (t.isAssignmentExpression(node)) {
      const rightVal = this.evaluateExpression(node.right);
      if (t.isIdentifier(node.left)) {
        const varName = node.left.name;
        let finalVal = rightVal;
        const currentVal = this.ctx.getVariable(varName, line) ?? 0;
        if (node.operator === "+=") finalVal = currentVal + rightVal;
        else if (node.operator === "-=") finalVal = currentVal - rightVal;
        else if (node.operator === "*=") finalVal = currentVal * rightVal;
        else if (node.operator === "/=") finalVal = currentVal / rightVal;

        this.ctx.setVariable(varName, finalVal, line);
        return finalVal;
      }
    }

    if (t.isUpdateExpression(node)) {
      if (t.isIdentifier(node.argument)) {
        const varName = node.argument.name;
        const currentVal = Number(this.ctx.getVariable(varName, line) ?? 0);
        const newVal = node.operator === "++" ? currentVal + 1 : currentVal - 1;
        this.ctx.setVariable(varName, newVal, line);
        return node.prefix ? newVal : currentVal;
      }
    }

    return undefined;
  }

  private executeStatement(node: t.Statement): void {
    if (!node) return;
    const line = this.getLine(node);

    if (t.isFunctionDeclaration(node) && t.isIdentifier(node.id)) {
      const fnName = node.id.name;
      const params = node.params.map((p) => (t.isIdentifier(p) ? p.name : "param"));
      this.functionDefs.set(fnName, { params, body: node.body });
    } else if (t.isVariableDeclaration(node)) {
      const kind = node.kind as "let" | "const" | "var";
      for (const declarator of node.declarations) {
        if (t.isIdentifier(declarator.id)) {
          const varName = declarator.id.name;
          let finalVal: any = undefined;
          if (declarator.init) {
            finalVal = this.evaluateExpression(declarator.init);
          }

          if (Array.isArray(finalVal)) {
            this.ctx.createArray(varName, finalVal, line);
          } else {
            this.ctx.setVariable(varName, finalVal !== undefined ? finalVal : null, line, kind);
          }
        }
      }
    } else if (t.isForStatement(node)) {
      if (node.init) {
        if (t.isVariableDeclaration(node.init)) this.executeStatement(node.init);
        else if (t.isExpression(node.init)) this.evaluateExpression(node.init);
      }

      let varName = "i";
      if (t.isVariableDeclaration(node.init) && t.isIdentifier(node.init.declarations[0]?.id)) {
        varName = node.init.declarations[0].id.name;
      }

      let maxIterations = 3;
      if (t.isBinaryExpression(node.test) && (t.isNumericLiteral(node.test.right) || t.isIdentifier(node.test.right))) {
        const limit = this.evaluateExpression(node.test.right);
        if (typeof limit === "number") maxIterations = limit;
      }

      let loopCounter = 0;
      const SAFETY_LIMIT = 50;

      while (loopCounter < SAFETY_LIMIT) {
        const currentVal = this.ctx.getVariable(varName, line) ?? loopCounter;
        let condRes = true;
        if (node.test) {
          condRes = Boolean(this.evaluateExpression(node.test));
        }

        if (!condRes) break;

        loopCounter++;
        const progressPercent = Math.min(100, Math.round((loopCounter / maxIterations) * 100));

        this.ctx.emitEvent({
          id: this.ctx.generateEventId(),
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
            node.body.body.forEach((s) => this.executeStatement(s));
          } else {
            this.executeStatement(node.body);
          }
        }

        if (node.update) {
          this.evaluateExpression(node.update);
        }
      }
    } else if (t.isWhileStatement(node)) {
      let loopCounter = 0;
      const SAFETY_LIMIT = 50;

      while (loopCounter < SAFETY_LIMIT) {
        let condText = "condition";
        let leftVal: any = undefined;
        let rightVal: any = undefined;
        let op = "<";

        if (t.isBinaryExpression(node.test)) {
          op = node.test.operator;
          leftVal = this.evaluateExpression(node.test.left);
          rightVal = this.evaluateExpression(node.test.right);
          condText = `${leftVal} ${op} ${rightVal}`;
        }

        const condRes = Boolean(this.evaluateExpression(node.test));

        this.ctx.emitEvent({
          id: this.ctx.generateEventId(),
          line,
          type: "CHECK_CONDITION",
          condition: condText,
          left: leftVal,
          operator: op,
          right: rightVal,
          result: condRes,
          branchTaken: condRes ? "then" : "else",
        });

        if (!condRes) break;

        loopCounter++;
        if (node.body) {
          if (t.isBlockStatement(node.body)) {
            node.body.body.forEach((s) => this.executeStatement(s));
          } else {
            this.executeStatement(node.body);
          }
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
        leftVal = this.evaluateExpression(testNode.left);
        rightVal = this.evaluateExpression(testNode.right);
      }

      const condResult = Boolean(this.evaluateExpression(testNode));

      this.ctx.emitEvent({
        id: this.ctx.generateEventId(),
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
          node.consequent.body.forEach((s) => this.executeStatement(s));
        } else {
          this.executeStatement(node.consequent);
        }
      } else if (!condResult && node.alternate) {
        if (t.isBlockStatement(node.alternate)) {
          node.alternate.body.forEach((s) => this.executeStatement(s));
        } else {
          this.executeStatement(node.alternate as t.Statement);
        }
      }
    } else if (t.isExpressionStatement(node)) {
      this.evaluateExpression(node.expression);
    } else if (t.isBlockStatement(node)) {
      node.body.forEach((s) => this.executeStatement(s));
    }
  }
}
