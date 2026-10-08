import React, { useState, useEffect, useCallback } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { Star, MoreVertical, Trash2, Tag as TagIcon, Play, RefreshCw, ChevronLeft, Link as LinkIcon, Sparkles } from 'lucide-react';
import { notesApi } from '../../api/notesApi';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function NoteEditor({ note, onUpdate, onDelete, onBack }) {
  const [title, setTitle] = useState(note.title || '');
  const [content, setContent] = useState(note.content || '');
  const [tags, setTags] = useState(note.tags || []);
  const [isFavorite, setIsFavorite] = useState(note.isFavorite || false);
  const [saveStatus, setSaveStatus] = useState('Saved');
  const [tagInput, setTagInput] = useState('');
  
  // AI State
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [showAiPanel, setShowAiPanel] = useState(false);

  // Auto-save logic
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (title !== note.title || content !== note.content || isFavorite !== note.isFavorite || JSON.stringify(tags) !== JSON.stringify(note.tags)) {
        handleSave();
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [title, content, tags, isFavorite]);

  const handleSave = async () => {
    setSaveStatus('Saving...');
    try {
      const updated = await notesApi.updateNote(note._id, {
        title,
        content,
        tags,
        isFavorite
      });
      onUpdate(updated);
      setSaveStatus('Saved');
    } catch (error) {
      setSaveStatus('Error saving');
      toast.error('Failed to save note');
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleAiAction = async (action) => {
    setIsAiLoading(true);
    setShowAiPanel(true);
    try {
      // If explain, try to get selected text. (This is a simplified approach, getting selection from document)
      let textToProcess = action === 'explain' ? window.getSelection().toString() : content;
      
      if (action === 'explain' && !textToProcess) {
        toast.error('Please highlight some text first');
        setIsAiLoading(false);
        return;
      }

      if (action === 'summarize' && !textToProcess) {
        toast.error('Note is empty');
        setIsAiLoading(false);
        return;
      }

      const res = await notesApi.aiAction(action, textToProcess);
      setAiResult(res.result);
    } catch (error) {
      toast.error('AI Request failed');
      setAiResult('Error generating response.');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background relative overflow-hidden">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button onClick={onBack} className="md:hidden p-1 -ml-2 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note Title"
            className="text-xl font-bold bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/50 w-full"
          />
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          <span className="text-xs text-muted-foreground hidden sm:inline-block">
            {saveStatus === 'Saving...' && <RefreshCw className="h-3 w-3 inline mr-1 animate-spin" />}
            {saveStatus}
          </span>

          <div className="h-4 w-px bg-border hidden sm:block"></div>

          <div className="flex items-center gap-1">
            <button 
              onClick={() => handleAiAction('explain')}
              className="px-2.5 py-1.5 text-xs font-medium bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-md border border-indigo-500/20 transition-colors flex items-center gap-1.5"
              title="Highlight text and click to explain"
            >
              <Sparkles className="h-3.5 w-3.5" /> Explain
            </button>
            <button 
              onClick={() => handleAiAction('summarize')}
              className="px-2.5 py-1.5 text-xs font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-md border border-emerald-500/20 transition-colors flex items-center gap-1.5"
            >
              <FileText className="h-3.5 w-3.5" /> Summarize
            </button>
          </div>

          <div className="h-4 w-px bg-border hidden sm:block"></div>

          <button 
            onClick={() => setIsFavorite(!isFavorite)}
            className={`p-1.5 rounded transition-colors ${isFavorite ? 'text-yellow-500 hover:bg-yellow-500/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
          >
            <Star className={`h-4 w-4 ${isFavorite ? 'fill-yellow-500' : ''}`} />
          </button>
          <button 
            onClick={onDelete}
            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Metadata Bar (Tags, Linked Problems) */}
      <div className="px-4 py-2 border-b border-border bg-card/30 flex flex-wrap items-center gap-x-4 gap-y-2">
        {/* Linked Problems */}
        {note.linkedProblems && note.linkedProblems.length > 0 && (
          <div className="flex items-center gap-2">
            <LinkIcon className="h-3.5 w-3.5 text-muted-foreground" />
            <div className="flex gap-1">
              {note.linkedProblems.map(p => (
                <Link key={p._id} to={`/problems/${p._id}`} className="text-xs bg-primary/10 text-primary hover:bg-primary/20 px-2 py-0.5 rounded transition-colors truncate max-w-[150px]">
                  {p.title}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        <div className="flex items-center gap-2 flex-1">
          <TagIcon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          <div className="flex flex-wrap gap-1 items-center">
            {tags.map(tag => (
              <span key={tag} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full flex items-center gap-1">
                #{tag}
                <button onClick={() => handleRemoveTag(tag)} className="hover:text-foreground">&times;</button>
              </span>
            ))}
            <input 
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Add tag..."
              className="text-xs bg-transparent border-none outline-none w-20 placeholder:text-muted-foreground/50 text-foreground"
            />
          </div>
        </div>
      </div>

      {/* Markdown Editor */}
      <div className="flex-1 overflow-hidden" data-color-mode="dark">
        <MDEditor
          value={content}
          onChange={setContent}
          height="100%"
          preview="live"
          className="h-full border-none !bg-background"
          textareaProps={{
            placeholder: 'Write your notes here in Markdown...'
          }}
        />
      </div>

      {/* AI Panel Overlay */}
      {showAiPanel && (
        <div className="absolute right-0 top-[100px] bottom-0 w-[400px] border-l border-border bg-card/95 backdrop-blur shadow-2xl flex flex-col z-10 transition-transform">
          <div className="flex items-center justify-between p-3 border-b border-border">
            <h3 className="font-bold text-sm flex items-center gap-2 text-indigo-400">
              <Sparkles className="h-4 w-4" /> AI Assistant
            </h3>
            <button onClick={() => setShowAiPanel(false)} className="text-muted-foreground hover:text-foreground text-xl leading-none">&times;</button>
          </div>
          <div className="p-4 overflow-y-auto flex-1 custom-scrollbar text-sm prose prose-invert max-w-none">
            {isAiLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
                <RefreshCw className="h-8 w-8 animate-spin text-indigo-500" />
                <p>Analyzing context...</p>
              </div>
            ) : (
              <MDEditor.Markdown source={aiResult} style={{ backgroundColor: 'transparent' }} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
