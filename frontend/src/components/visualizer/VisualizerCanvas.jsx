import React from 'react';
import { motion } from 'framer-motion';

export default function VisualizerCanvas({ state }) {
  if (!state) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500">
        Generate or input data to begin visualization.
      </div>
    );
  }

  const { array, comparing = [], swapping = [], sorted = [], highlightRange } = state;
  const maxVal = Math.max(...array, 1); // Avoid division by zero

  return (
    <div className="flex-1 flex flex-col justify-end items-center p-8 pb-16 relative">
      {/* Optional Range Highlight for Divide and Conquer */}
      {highlightRange && (
        <div className="absolute top-4 left-0 right-0 flex justify-center">
          <div className="px-4 py-1 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded text-xs font-bold">
            Working on range [{highlightRange[0]} ... {highlightRange[1]}]
          </div>
        </div>
      )}

      <div className="flex items-end justify-center h-full w-full gap-1 sm:gap-2 max-w-4xl">
        {array.map((val, idx) => {
          // Determine color based on state arrays
          let bgColor = 'bg-slate-300';
          let borderColor = 'border-slate-400';
          let shadow = '';

          if (swapping.includes(idx)) {
            bgColor = 'bg-orange-400';
            borderColor = 'border-orange-500';
            shadow = 'shadow-[0_0_15px_rgba(251,146,60,0.6)]';
          } else if (comparing.includes(idx)) {
            bgColor = 'bg-blue-400';
            borderColor = 'border-blue-500';
            shadow = 'shadow-[0_0_15px_rgba(96,165,250,0.6)]';
          } else if (sorted.includes(idx)) {
            bgColor = 'bg-emerald-400';
            borderColor = 'border-emerald-500';
            shadow = 'shadow-[0_0_10px_rgba(52,211,153,0.3)]';
          } else if (highlightRange && idx >= highlightRange[0] && idx <= highlightRange[1]) {
            bgColor = 'bg-indigo-300';
            borderColor = 'border-indigo-400';
          }

          const heightPercent = (val / maxVal) * 100;

          return (
            <motion.div
              key={val + "-" + idx} // using idx in key for array index based animations
              layout
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20
              }}
              className={`relative flex flex-col justify-end w-8 sm:w-12 rounded-t-sm border-t border-l border-r ${bgColor} ${borderColor} ${shadow}`}
              style={{ height: `${Math.max(heightPercent, 5)}%` }}
            >
              <span className="text-[10px] sm:text-xs font-bold text-slate-900 text-center mb-1">
                {val}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
