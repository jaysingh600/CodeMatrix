import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lightbulb, BookOpen, GitBranch, Terminal, FileCode2, 
  Bug, Zap, HelpCircle, Activity, LayoutTemplate, X, Check, Copy, Loader2, Bot
} from 'lucide-react';
import { Button } from './ui/button';
import toast from 'react-hot-toast';
import MDEditor from '@uiw/react-md-editor';

const HINT_TYPES = [
  { id: 'Concept', title: 'Concept Hint', icon: BookOpen, desc: 'What CS concept applies here?', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { id: 'Pattern', title: 'Pattern Hint', icon: GitBranch, desc: 'What is the algorithmic pattern?', color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
  { id: 'Algorithm', title: 'Algorithm', icon: Activity, desc: 'High-level strategy without code.', color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { id: 'Pseudocode', title: 'Pseudocode', icon: FileCode2, desc: 'Language-independent logic.', color: 'text-fuchsia-400', bg: 'bg-fuchsia-400/10' },
  { id: 'CodeSkeleton', title: 'Code Skeleton', icon: LayoutTemplate, desc: 'A partially completed template.', color: 'text-pink-400', bg: 'bg-pink-400/10' },
  { id: 'Debug', title: 'Debug My Code', icon: Bug, desc: 'Analyze syntax and logical errors.', color: 'text-orange-400', bg: 'bg-orange-400/10' },
  { id: 'Optimize', title: 'Optimize Complexity', icon: Zap, desc: 'Suggest time/space improvements.', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  { id: 'ExplainMistake', title: 'Explain Mistake', icon: HelpCircle, desc: 'Why did my last run fail?', color: 'text-red-400', bg: 'bg-red-400/10' },
  { id: 'Complexity', title: 'Analyze Complexity', icon: Terminal, desc: 'Time & Space complexity analysis.', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { id: 'FullSolution', title: 'Full Solution', icon: Check, desc: 'Complete, optimal solution.', color: 'text-destructive', bg: 'bg-destructive/10' },
];

const AiHintModal = ({ isOpen, onClose, onSelectHint, loading, hintResponse, onReset }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (hintResponse?.hint) {
      navigator.clipboard.writeText(hintResponse.hint);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[#0A0A0A] border border-border rounded-xl shadow-2xl max-w-4xl w-full flex flex-col max-h-[90vh] overflow-hidden relative"
        >
          {/* Header */}
          <div className="p-4 border-b border-border flex justify-between items-center bg-card shrink-0">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <Bot className="h-5 w-5" />
              CodeMatrix AI Mentor
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-card/50">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground animate-pulse">Generating your personalized hint...</p>
              </div>
            ) : hintResponse ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-foreground">{hintResponse.title}</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                      {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                      Copy
                    </Button>
                  </div>
                </div>
                
                <div className="bg-[#0D0D0D] p-5 rounded-lg border border-border" data-color-mode="dark">
                  <MDEditor.Markdown 
                    source={hintResponse.hint} 
                    style={{ backgroundColor: 'transparent', color: 'inherit' }}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button variant="outline" onClick={onReset}>Choose Another Hint</Button>
                  <Button variant="default" onClick={onClose}>Back to Code</Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">How can I help you?</h2>
                  <p className="text-muted-foreground">Select a hint type. The AI will guide you without giving away the full answer immediately.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {HINT_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        onClick={() => onSelectHint(type.id)}
                        className="group flex flex-col items-start p-4 bg-muted/20 border border-border rounded-xl text-left transition-all hover:bg-muted/40 hover:border-primary/50"
                      >
                        <div className={`p-2 rounded-lg mb-3 ${type.bg}`}>
                          <Icon className={`h-5 w-5 ${type.color}`} />
                        </div>
                        <h4 className="font-semibold text-foreground mb-1">{type.title}</h4>
                        <p className="text-xs text-muted-foreground">{type.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AiHintModal;
