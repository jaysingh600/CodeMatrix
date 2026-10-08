import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Trash2, Loader2, Sparkles, AlertCircle, Code, FastForward, Play } from 'lucide-react';
import { mentorApi } from '../api/mentorApi';
import MDEditor from '@uiw/react-md-editor';
import toast from 'react-hot-toast';

const QUICK_ACTIONS = [
  { label: "I'm stuck", prompt: "I don't know how to start. Can you guide me step by step?", icon: AlertCircle },
  { label: "Give me an idea", prompt: "What data structures or algorithms would be useful here?", icon: Sparkles },
  { label: "Debug my code", prompt: "My code is failing. Can you point out the flaw?", icon: BugIcon },
  { label: "Show dry run", prompt: "Can you provide a step-by-step dry run of a small example?", icon: Play },
  { label: "Analyze complexity", prompt: "What is the time and space complexity of this approach?", icon: FastForward },
  { label: "Interview Me", prompt: "Act like a technical interviewer. Ask me one question at a time to solve this.", icon: Bot },
];

function BugIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m8 2 1.88 1.88" />
      <path d="M14.12 3.88 16 2" />
      <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
      <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" />
      <path d="M12 20v-9" />
      <path d="M6.53 9C4.6 8.8 3 7.1 3 5" />
      <path d="M6 13H2" />
      <path d="M3 21c0-2.1 1.7-3.9 3.8-4" />
      <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" />
      <path d="M22 13h-4" />
      <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" />
    </svg>
  );
}

const AiMentorDrawer = ({ isOpen, onClose, problem, language, sourceCode }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && problem) {
      fetchHistory();
    }
  }, [isOpen, problem]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchHistory = async () => {
    setInitialLoading(true);
    try {
      const history = await mentorApi.getHistory(problem._id);
      setMessages(history);
    } catch (err) {
      toast.error('Failed to load chat history');
    } finally {
      setInitialLoading(false);
    }
  };

  const clearHistory = async () => {
    if (window.confirm('Clear all conversation history?')) {
      try {
        await mentorApi.clearHistory(problem._id);
        setMessages([]);
        toast.success('History cleared');
      } catch (err) {
        toast.error('Failed to clear history');
      }
    }
  };

  const handleSend = async (customPrompt = null, additionalContext = null) => {
    const messageToSend = customPrompt || input;
    if (!messageToSend.trim() || !problem) return;

    // Optimistic update
    const tempId = Date.now().toString();
    setMessages(prev => [...prev, { _id: tempId, role: 'user', content: messageToSend }]);
    setInput('');
    setLoading(true);

    try {
      const result = await mentorApi.sendMessage(problem._id, language, sourceCode, messageToSend, additionalContext);
      setMessages(prev => [
        ...prev.filter(m => m._id !== tempId),
        result.userMessage,
        result.aiMessage
      ]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error communicating with Mentor');
      // Remove optimistic message if failed
      setMessages(prev => prev.filter(m => m._id !== tempId));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-y-0 right-0 z-50 w-full sm:w-[450px] lg:w-[500px] bg-[#0A0A0A] border-l border-border shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="h-14 border-b border-border flex justify-between items-center px-4 bg-muted/20 shrink-0">
          <div className="flex items-center gap-2 font-semibold">
            <div className="h-8 w-8 rounded-full bg-secondary/20 flex items-center justify-center relative">
              <Bot className="h-4 w-4 text-secondary relative z-10" />
              {loading && <span className="absolute inset-0 rounded-full animate-ping bg-secondary/30 opacity-75"></span>}
            </div>
            AI Mentor
          </div>
          <div className="flex items-center gap-2">
            <button onClick={clearHistory} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors" title="Clear Chat">
              <Trash2 className="h-4 w-4" />
            </button>
            <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar bg-card/50">
          {initialLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {messages.length === 0 && (
                <div className="flex gap-3 mt-4">
                  <div className="h-8 w-8 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-secondary" />
                  </div>
                  <div className="bg-muted/50 rounded-2xl rounded-tl-sm px-4 py-3 text-sm border border-border">
                    Hello! I'm your CodeMatrix AI mentor. I see you're working on <strong>{problem?.title}</strong>. 
                    <br/><br/>
                    I will not give you the final answer right away. Instead, I am here to help you reason through it. What do you need help with?
                  </div>
                </div>
              )}
              
              {messages.map((msg) => (
                <div key={msg._id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary/20' : 'bg-secondary/20'}`}>
                    {msg.role === 'user' ? <span className="text-xs font-bold">ME</span> : <Bot className="h-4 w-4 text-secondary" />}
                  </div>
                  <div className={`rounded-2xl px-4 py-3 text-sm max-w-[85%] border ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground border-primary rounded-tr-sm' 
                      : 'bg-muted/50 border-border rounded-tl-sm overflow-x-hidden'
                  }`}>
                    {msg.role === 'user' ? (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    ) : (
                      <div data-color-mode="dark" className="prose prose-invert max-w-none text-sm text-foreground/90">
                        <MDEditor.Markdown source={msg.content} style={{ backgroundColor: 'transparent', color: 'inherit' }} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-secondary" />
                  </div>
                  <div className="bg-muted/50 rounded-2xl rounded-tl-sm px-4 py-3 text-sm border border-border flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
        
        {/* Input Area */}
        <div className="p-3 border-t border-border bg-background shrink-0">
          <div className="flex flex-nowrap overflow-x-auto gap-2 mb-3 pb-1 custom-scrollbar">
            {QUICK_ACTIONS.map((action, idx) => {
              const Icon = action.icon;
              return (
                <button 
                  key={idx}
                  onClick={() => handleSend(action.prompt)}
                  disabled={loading}
                  className="flex items-center gap-1.5 whitespace-nowrap text-xs border border-border bg-muted/30 rounded-full px-3 py-1.5 hover:bg-muted hover:border-primary/50 transition-all text-muted-foreground hover:text-foreground disabled:opacity-50"
                >
                  <Icon className="h-3 w-3" />
                  {action.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 mb-2">
             <button 
                onClick={() => handleSend("Please analyze the current code I have written in the editor. Identify any logic errors, missing edge cases, or complexity improvements.", "The user explicitly wants you to review the current source code.")}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-md transition-colors"
             >
                <Code className="h-3 w-3" /> Analyze Current Code
             </button>
          </div>

          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
            className="relative flex items-center"
          >
            <input 
              type="text" 
              placeholder="Ask the AI mentor..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="w-full bg-muted border border-input rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
            />
            <button 
              type="submit"
              disabled={!input.trim() || loading}
              className="absolute right-2 p-2 text-primary hover:bg-primary/10 rounded-full transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </motion.div>
    </>
  );
};

export default AiMentorDrawer;
