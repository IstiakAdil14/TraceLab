"use client";

import { useExecutionStore } from "@/store/useExecutionStore";
import { MLEpochStep, MLKMeansStep, MLNeuralStep } from "@/runtime/events";
import { Brain, TrendingDown, Target, Zap, Activity, Cpu } from "lucide-react";

export function MachineLearningView() {
  const { events, currentStepIndex } = useExecutionStore();

  const currentEvent = events[currentStepIndex];

  // Extract ML event data up to the current step
  const mlEvents = events.slice(0, currentStepIndex + 1).filter(
    (e) => e.type === "ML_EPOCH" || e.type === "ML_ITERATION" || e.type === "ML_KMEANS" || e.type === "ML_NEURAL"
  ) as Array<MLEpochStep | MLKMeansStep | MLNeuralStep>;

  const latestMlEvent = mlEvents[mlEvents.length - 1];

  // Default sample dataset for Linear Regression visualization if no dynamic data provided
  const samplePoints = [
    { x: 1, y: 2.1 },
    { x: 2, y: 3.9 },
    { x: 3, y: 6.1 },
    { x: 4, y: 8.2 },
    { x: 5, y: 9.8 },
  ];

  // Get current epoch, weight, bias, loss
  const epoch = latestMlEvent?.type === "ML_EPOCH" || latestMlEvent?.type === "ML_ITERATION" ? latestMlEvent.epoch : mlEvents.length;
  const totalEpochs = latestMlEvent?.type === "ML_EPOCH" ? latestMlEvent.totalEpochs : 20;
  const weight = latestMlEvent?.type === "ML_EPOCH" ? latestMlEvent.weight : 1.95;
  const bias = latestMlEvent?.type === "ML_EPOCH" ? latestMlEvent.bias : 0.15;
  const loss = latestMlEvent?.type === "ML_EPOCH" ? latestMlEvent.loss : Math.max(0.02, 2.5 / (epoch || 1));

  // Extract loss history for mini loss graph
  const lossHistory = mlEvents
    .filter((e): e is MLEpochStep => e.type === "ML_EPOCH" || e.type === "ML_ITERATION")
    .map((e) => e.loss);

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 p-4 overflow-y-auto space-y-4">
      {/* Header Badge */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>Machine Learning & Gradient Descent Visualizer</span>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-semibold border border-purple-500/30 uppercase tracking-wider">
                ML Engine
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Real-time model parameter optimization, weight updates & loss reduction tracking
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center shadow-sm">
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span>Epoch</span>
          </div>
          <div className="text-xl font-extrabold text-indigo-400">
            {epoch} <span className="text-xs font-normal text-slate-500">/ {totalEpochs}</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center shadow-sm">
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
            <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
            <span>MSE Loss</span>
          </div>
          <div className="text-xl font-extrabold text-rose-400">
            {loss.toFixed(4)}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center shadow-sm">
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Weight (w)</span>
          </div>
          <div className="text-xl font-extrabold text-amber-400">
            {weight.toFixed(3)}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center shadow-sm">
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            <span>Bias (b)</span>
          </div>
          <div className="text-xl font-extrabold text-emerald-400">
            {bias.toFixed(3)}
          </div>
        </div>
      </div>

      {/* Main 2D Scatter Plot & Line Fitting Canvas */}
      <div className="flex-1 min-h-[220px] bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between relative shadow-lg overflow-hidden">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
          <span className="flex items-center gap-1.5 text-purple-400">
            <Cpu className="w-4 h-4" />
            Linear Regression Model Fit: <code className="text-amber-300 font-mono">y = {weight.toFixed(2)}x + {bias.toFixed(2)}</code>
          </span>
          <span className="text-[10px] text-slate-500 font-normal">2D Feature Coordinate Space</span>
        </div>

        {/* 2D Canvas SVG Plot */}
        <div className="w-full h-48 bg-slate-950/70 border border-slate-800/80 rounded-xl relative p-3 flex items-center justify-center overflow-hidden">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 300 150">
            {/* Grid Axes */}
            <line x1="30" y1="130" x2="280" y2="130" stroke="#334155" strokeWidth="1.5" strokeDasharray="3,3" />
            <line x1="30" y1="10" x2="30" y2="130" stroke="#334155" strokeWidth="1.5" strokeDasharray="3,3" />

            {/* Regression Line y = wx + b */}
            {(() => {
              const x1 = 1;
              const y1 = weight * x1 + bias;
              const x2 = 5;
              const y2 = weight * x2 + bias;

              // Map coordinates to SVG dimensions
              const svgX1 = 30 + x1 * 45;
              const svgY1 = 130 - y1 * 11;
              const svgX2 = 30 + x2 * 45;
              const svgY2 = 130 - y2 * 11;

              return (
                <line
                  x1={svgX1}
                  y1={svgY1}
                  x2={svgX2}
                  y2={svgY2}
                  stroke="#c084fc"
                  strokeWidth="3"
                  className="transition-all duration-300 drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]"
                />
              );
            })()}

            {/* Data Scatter Points */}
            {samplePoints.map((pt, idx) => {
              const cx = 30 + pt.x * 45;
              const cy = 130 - pt.y * 11;
              const predictedY = weight * pt.x + bias;
              const predCy = 130 - predictedY * 11;

              return (
                <g key={idx}>
                  {/* Error Residual Line */}
                  <line
                    x1={cx}
                    y1={cy}
                    x2={cx}
                    y2={predCy}
                    stroke="#f43f5e"
                    strokeWidth="1.5"
                    strokeDasharray="2,2"
                    className="opacity-70"
                  />
                  {/* Data Point Dot */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r="5"
                    className="fill-cyan-400 stroke-slate-900 stroke-2 drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]"
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Mini Loss Reduction Graph */}
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="text-slate-400 text-[11px]">
            Loss Reduction History:
          </div>
          <div className="flex items-center gap-1.5">
            {lossHistory.length > 0 ? (
              lossHistory.slice(-8).map((l, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <div
                    className="w-2.5 rounded-t bg-gradient-to-t from-purple-600 to-rose-400 transition-all"
                    style={{ height: `${Math.min(30, Math.max(4, l * 15))}px` }}
                  />
                  <span className="text-[9px] text-slate-500">{idx + 1}</span>
                </div>
              ))
            ) : (
              <span className="text-slate-500 text-[11px] font-mono">Convergence Stable (MSE Loss: {loss.toFixed(4)})</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
