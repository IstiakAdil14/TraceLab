import { RuntimeEvent } from "./events";

export interface Scope {
  id: string;
  name: string;
  parent?: Scope;
  variables: Map<string, any>;
}

/**
 * RuntimeContext
 * Maintains state during AST execution: scopes, variables, arrays, call stack frames, and emitted events.
 */
export class RuntimeContext {
  private globalScope: Scope;
  private currentScope: Scope;
  private callStackFrames: string[];
  private arrayMemory: Map<string, any[]>;
  private emittedEvents: RuntimeEvent[];
  private eventIdCounter: number;

  constructor() {
    this.globalScope = {
      id: "scope_global",
      name: "global",
      variables: new Map<string, any>(),
    };
    this.currentScope = this.globalScope;
    this.callStackFrames = ["main()"];
    this.arrayMemory = new Map<string, any[]>();
    this.emittedEvents = [];
    this.eventIdCounter = 1;
  }

  // --- Scope & Variable Operations ---
  public setVariable(name: string, value: any, line?: number, kind: "let" | "const" | "var" = "let"): void {
    const isNew = !this.hasVariable(name);
    this.currentScope.variables.set(name, value);

    if (Array.isArray(value)) {
      this.arrayMemory.set(name, value);
    }

    if (isNew) {
      this.emitEvent({
        id: this.generateEventId(),
        line: line || 1,
        type: "CREATE_VARIABLE",
        name,
        value,
        kind,
      });
    } else {
      this.emitEvent({
        id: this.generateEventId(),
        line: line || 1,
        type: "UPDATE_VARIABLE",
        name,
        value,
      });
    }
  }

  public getVariable(name: string, line?: number): any {
    let scope: Scope | undefined = this.currentScope;
    while (scope) {
      if (scope.variables.has(name)) {
        const val = scope.variables.get(name);
        this.emitEvent({
          id: this.generateEventId(),
          line: line || 1,
          type: "READ",
          name,
          value: val,
        });
        return val;
      }
      scope = scope.parent;
    }
    return undefined;
  }

  public hasVariable(name: string): boolean {
    let scope: Scope | undefined = this.currentScope;
    while (scope) {
      if (scope.variables.has(name)) return true;
      scope = scope.parent;
    }
    return false;
  }

  // --- Array Memory Operations ---
  public createArray(name: string, elements: any[], line?: number): void {
    this.arrayMemory.set(name, elements);
    this.setVariable(name, elements, line);
    this.emitEvent({
      id: this.generateEventId(),
      line: line || 1,
      type: "CREATE_ARRAY",
      name,
      elements,
    });
  }

  public accessArray(name: string, index: number, line?: number): any {
    const arr = this.arrayMemory.get(name) || this.getVariable(name, line);
    let val: any = undefined;
    if (Array.isArray(arr) && index >= 0 && index < arr.length) {
      val = arr[index];
    }

    this.emitEvent({
      id: this.generateEventId(),
      line: line || 1,
      type: "ACCESS_ARRAY",
      name,
      index,
      value: val,
    });

    return val;
  }

  // --- Call Stack Operations ---
  public pushCallFrame(fnName: string, parameters: Record<string, any>, line?: number): void {
    const frameLabel = `${fnName}(${Object.values(parameters).join(", ")})`;
    this.callStackFrames.push(frameLabel);

    // Create a new lexical child scope for the function execution
    const newScope: Scope = {
      id: `scope_${fnName}_${this.eventIdCounter}`,
      name: fnName,
      parent: this.currentScope,
      variables: new Map<string, any>(),
    };
    this.currentScope = newScope;

    Object.entries(parameters).forEach(([k, v]) => {
      this.currentScope.variables.set(k, v);
    });

    this.emitEvent({
      id: this.generateEventId(),
      line: line || 1,
      type: "CALL_FUNCTION",
      name: fnName,
      parameters,
      stack: [...this.callStackFrames],
    });
  }

  public popCallFrame(fnName: string, returnValue: any, line?: number): void {
    if (this.callStackFrames.length > 1) {
      this.callStackFrames.pop();
    }
    if (this.currentScope.parent) {
      this.currentScope = this.currentScope.parent;
    }

    this.emitEvent({
      id: this.generateEventId(),
      line: line || 1,
      type: "RETURN_FUNCTION",
      name: fnName,
      returnValue,
    });
  }

  // --- Event Emitter & State Query ---
  public emitEvent(event: RuntimeEvent): void {
    this.emittedEvents.push(event);
  }

  public getEvents(): RuntimeEvent[] {
    return [...this.emittedEvents];
  }

  public getCallStack(): string[] {
    return [...this.callStackFrames];
  }

  public generateEventId(): string {
    return `evt_${this.eventIdCounter++}`;
  }
}
