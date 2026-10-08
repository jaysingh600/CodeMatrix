import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bot, Loader2 } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import { aiApi } from '../../api/aiApi';

export default function AiVisualizerDrawer({ isOpen, onClose, state, metadata }) {
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState(null);

  useEffect(() => {
    if (isOpen && state && metadata) {
      fetchExplanation();
    }
  }, [isOpen, state, metadata]);

  const fetchExplanation = async () => {
    try {
      setLoading(true);
      setExplanation(null);

      // We use the existing getHint endpoint, but pass a specific prompt format
      // In a real app, you'd add a dedicated visualizer explain endpoint to aiController
      const promptContext = `
        Algorithm: ${metadata.name}
        Current Array State: [${state.array.join(', ')}]
        Current Line in Pseudocode: ${state.currentLine}
        System Explanation: ${state.explanation}
        Comparing Indices: ${state.comparing.join(', ')}
        Swapping Indices: ${state.swapping.join(', ')}
      `;

      // We'll simulate a custom prompt by abusing the problemId logic or creating a new endpoint.
      // Since we don't have a dedicated endpoint yet, we'll create one in backend!
      const result = await aiApi.explainVisualizerStep(promptContext);
      setExplanation(result.explanation);
    } catch (error) {
      setExplanation("Sorry, I couldn't generate an explanation right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed top-0 right-0 h-full w-[400px] bg-[#0f111a] border-l border-slate-800 shadow-2xl z-50 flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#161b22]">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/50">
                <Bot className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-200">AI Step Explanation</h3>
                <p className="text-xs text-slate-400">{metadata?.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6" data-color-mode="dark">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-40 text-indigo-400 gap-4">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-sm">Analyzing current step...</p>
              </div>
            ) : explanation ? (
              <div className="prose prose-invert prose-sm max-w-none">
                <MDEditor.Markdown source={explanation} style={{ background: 'transparent', color: 'inherit' }} />
              </div>
            ) : (
              <p className="text-slate-500 text-center">No explanation available.</p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
