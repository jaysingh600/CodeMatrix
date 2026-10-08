import React from 'react';
import { Activity, Cpu, Bot } from 'lucide-react';

export default function VisualizerInfo({ metadata, currentState, onExplainClick }) {
  if (!metadata) return null;

  const pseudocodeLines = metadata.pseudocode.split('\n');

  return (
    <div className="w-80 border-l border-border bg-card overflow-y-auto custom-scrollbar flex flex-col">
      <div className="p-4 border-b border-border bg-muted/20">
        <h3 className="text-sm font-bold text-slate-200">{metadata.name}</h3>
      </div>
      
      <div className="p-4 space-y-6">
        {/* Complexity Badges */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#161b22] border border-slate-800 p-3 rounded-lg flex flex-col items-center justify-center">
            <span className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Activity className="h-3 w-3" /> Time (Avg)</span>
            <span className="text-sm font-bold font-mono text-emerald-400">{metadata.timeComplexity.average}</span>
          </div>
          <div className="bg-[#161b22] border border-slate-800 p-3 rounded-lg flex flex-col items-center justify-center">
            <span className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Cpu className="h-3 w-3" /> Space</span>
            <span className="text-sm font-bold font-mono text-blue-400">{metadata.spaceComplexity}</span>
          </div>
        </div>

        {/* Explanation */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Step Explanation</h4>
          <div className="bg-[#0d1117] border border-slate-800 rounded-lg p-3 min-h-[80px]">
            <p className="text-sm text-slate-300 leading-relaxed">
              {currentState?.explanation || 'Press Play to begin.'}
            </p>
          </div>
        </div>

        {/* AI Explain Button */}
        <button
          onClick={onExplainClick}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 border border-indigo-500/30 py-2 rounded-lg transition-colors text-sm font-medium"
        >
          <Bot className="h-4 w-4" /> Ask AI to Explain
        </button>

        {/* Pseudocode */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Pseudocode</h4>
          <div className="bg-[#0d1117] border border-slate-800 rounded-lg overflow-hidden font-mono text-[11px] leading-6 py-2">
            {pseudocodeLines.map((line, idx) => {
              // 1-indexed for mapping
              const lineNum = idx + 1;
              const isActive = currentState?.currentLine === lineNum;
              
              return (
                <div 
                  key={idx} 
                  className={`px-3 flex gap-3 ${isActive ? 'bg-primary/20 border-l-2 border-primary text-primary-foreground' : 'text-slate-400 border-l-2 border-transparent'}`}
                >
                  <span className="text-slate-600 select-none">{lineNum}</span>
                  <span className="whitespace-pre">{line}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
