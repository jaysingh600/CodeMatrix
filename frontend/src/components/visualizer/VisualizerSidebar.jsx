import React from 'react';
import { ChevronRight } from 'lucide-react';

const categories = [
  {
    name: 'Sorting',
    algorithms: [
      { id: 'bubble-sort', name: 'Bubble Sort' },
      { id: 'merge-sort', name: 'Merge Sort' },
      { id: 'quick-sort', name: 'Quick Sort (Coming Soon)' },
    ]
  },
  {
    name: 'Searching',
    algorithms: [
      { id: 'binary-search', name: 'Binary Search (Coming Soon)' }
    ]
  }
];

export default function VisualizerSidebar({ selectedAlgorithmId, onSelect }) {
  return (
    <div className="w-64 border-r border-border bg-[#101216] overflow-y-auto custom-scrollbar flex flex-col">
      <div className="p-4 border-b border-border sticky top-0 bg-[#101216]/90 backdrop-blur z-10">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Algorithms</h3>
      </div>
      
      <div className="flex-1 py-2">
        {categories.map((cat, idx) => (
          <div key={idx} className="mb-4">
            <h4 className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              {cat.name}
            </h4>
            <div className="space-y-0.5">
              {cat.algorithms.map(alg => {
                const isActive = selectedAlgorithmId === alg.id;
                const isComingSoon = alg.name.includes('Coming Soon');
                return (
                  <button
                    key={alg.id}
                    disabled={isComingSoon}
                    onClick={() => onSelect(alg.id)}
                    className={`w-full flex items-center justify-between px-4 py-2 text-sm text-left transition-colors ${
                      isActive 
                        ? 'bg-primary/10 text-primary font-semibold border-r-2 border-primary' 
                        : isComingSoon 
                          ? 'text-slate-600 cursor-not-allowed'
                          : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                    }`}
                  >
                    <span>{alg.name.replace(' (Coming Soon)', '')}</span>
                    {isActive && <ChevronRight className="h-4 w-4" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
