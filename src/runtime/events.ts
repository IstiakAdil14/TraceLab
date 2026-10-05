/**
 * TraceLab Event System
 * Defines all execution event types produced by the parser/runtime engine
 * and consumed by the visualizer and timeline state store.
 */

export interface VariableCreated {
  type: "CREATE_VARIABLE" | "VARIABLE_CREATED";
  id: string;
  name: string;
  value: unknown;
  kind?: "let" | "const" | "var";
  line?: number;
}

export interface VariableUpdated {
  type: "UPDATE_VARIABLE" | "VARIABLE_UPDATED";
  id: string;
  name: string;
  value: unknown;
  oldValue?: unknown;
  line?: number;
}

export interface VariableRead {
  type: "READ" | "READ_VARIABLE" | "VARIABLE_READ";
  id: string;
  name: string;
  value: unknown;
  line?: number;
}

export interface ExpressionEvaluated {
  type: "ADD" | "SUB" | "MUL" | "DIV" | "OPERATION" | "EVALUATE_EXPRESSION" | "EXPRESSION_EVALUATED";
  id: string;
  expression?: string;
  operator?: string;
  left?: unknown;
  right?: unknown;
  result: unknown;
  line?: number;
}

export interface ConditionChecked {
  type: "CHECK_CONDITION" | "CONDITION_CHECKED";
  id: string;
  condition: string;
  left?: unknown;
  right?: unknown;
  operator?: string;
  result: boolean;
  branchTaken?: "then" | "else";
  line?: number;
}

export interface LoopIteration {
  type: "LOOP_ITERATION" | "ITERATION";
  id: string;
  iteration: number;
  maxIterations?: number;
  progressPercent: number;
  variableName?: string;
  variableValue?: unknown;
  conditionText?: string;
  line?: number;
}

export interface ArrayCreated {
  type: "CREATE_ARRAY" | "ARRAY_CREATED";
  id: string;
  name: string;
  elements: unknown[];
  line?: number;
}

export interface ArrayAccessed {
  type: "ACCESS_ARRAY" | "ARRAY_ACCESSED";
  id: string;
  name: string;
  index: number;
  value: unknown;
  line?: number;
}

export interface FunctionCalled {
  type: "CALL_FUNCTION" | "FUNCTION_CALLED";
  id: string;
  name: string;
  parameters: Record<string, unknown>;
  stack: string[];
  line?: number;
}

export interface FunctionReturned {
  type: "RETURN_FUNCTION" | "FUNCTION_RETURNED";
  id: string;
  name: string;
  returnValue: unknown;
  stack?: string[];
  line?: number;
}

export interface ConsoleLogged {
  type: "CONSOLE_LOG" | "PRINT_OUTPUT";
  id: string;
  output: string;
  line?: number;
}

// Machine Learning Event System
export interface MLEpochStep {
  type: "ML_EPOCH" | "ML_ITERATION";
  id: string;
  epoch: number;
  totalEpochs: number;
  loss: number;
  weight: number;
  bias: number;
  learningRate?: number;
  dataPoints?: Array<{ x: number; y: number }>;
  line?: number;
}

export interface MLKMeansStep {
  type: "ML_KMEANS";
  id: string;
  iteration: number;
  centroids: Array<{ x: number; y: number }>;
  clusters: Array<{ point: { x: number; y: number }; clusterIndex: number }>;
  line?: number;
}

export interface MLNeuralStep {
  type: "ML_NEURAL";
  id: string;
  inputs: number[];
  weights: number[];
  bias: number;
  weightedSum: number;
  activation: number;
  prediction: number;
  target?: number;
  line?: number;
}

export type RuntimeEvent =
  | VariableCreated
  | VariableUpdated
  | VariableRead
  | ExpressionEvaluated
  | ConditionChecked
  | LoopIteration
  | ArrayCreated
  | ArrayAccessed
  | FunctionCalled
  | FunctionReturned
  | ConsoleLogged
  | MLEpochStep
  | MLKMeansStep
  | MLNeuralStep;
