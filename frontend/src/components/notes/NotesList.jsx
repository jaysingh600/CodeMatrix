import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { FileText, Star } from 'lucide-react';

export default function NotesList({ notes, selectedNoteId, onSelectNote, loading }) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse bg-muted/50 h-20 rounded-md"></div>
        ))}
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <FileText className="h-8 w-8 mx-auto mb-3 opacity-20" />
        <p className="text-sm">No notes found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {notes.map(note => (
        <div 
          key={note._id}
          onClick={() => onSelectNote(note._id)}
          className={`p-3 rounded-md cursor-pointer transition-colors border ${selectedNoteId === note._id ? 'bg-primary/5 border-primary/20' : 'bg-transparent border-transparent hover:bg-muted/50'} flex flex-col gap-1`}
        >
          <div className="flex justify-between items-start gap-2">
            <h3 className={`text-sm font-semibold truncate ${selectedNoteId === note._id ? 'text-primary' : 'text-foreground'}`}>
              {note.title || 'Untitled Note'}
            </h3>
            {note.isFavorite && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 flex-shrink-0 mt-1" />}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {note.content ? note.content.replace(/[#*`_~]/g, '') : 'No content...'}
          </p>
          <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground/70">
            <span>{formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}</span>
            {note.linkedProblems?.length > 0 && (
              <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                {note.linkedProblems.length} Linked
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
