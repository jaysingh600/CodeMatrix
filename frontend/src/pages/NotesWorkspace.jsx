import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import NotesSidebar from '../components/notes/NotesSidebar';
import NotesList from '../components/notes/NotesList';
import NoteEditor from '../components/notes/NoteEditor';
import { notesApi } from '../api/notesApi';
import toast from 'react-hot-toast';

export default function NotesWorkspace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [folders, setFolders] = useState([]);
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  
  // Filters
  const [activeFolderId, setActiveFolderId] = useState(null);
  const [isFavoriteFilter, setIsFavoriteFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Loading states
  const [loadingFolders, setLoadingFolders] = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(true);

  // Initial load
  useEffect(() => {
    loadFolders();
  }, []);

  // Load notes based on filters
  useEffect(() => {
    loadNotes();
  }, [activeFolderId, isFavoriteFilter, searchQuery]);

  // Load specific note from URL if present
  useEffect(() => {
    const noteId = searchParams.get('noteId');
    if (noteId && notes.length > 0) {
      const found = notes.find(n => n._id === noteId);
      if (found) {
        setSelectedNote(found);
      } else {
        // If not in current list, fetch it
        notesApi.getNoteById(noteId).then(note => {
          setSelectedNote(note);
        }).catch(err => {
          console.error("Failed to load specific note from URL", err);
          searchParams.delete('noteId');
          setSearchParams(searchParams);
        });
      }
    }
  }, [searchParams, notes]);

  const loadFolders = async () => {
    setLoadingFolders(true);
    try {
      const data = await notesApi.getFolders();
      setFolders(data);
    } catch (error) {
      toast.error('Failed to load folders');
    } finally {
      setLoadingFolders(false);
    }
  };

  const loadNotes = async () => {
    setLoadingNotes(true);
    try {
      const params = {};
      if (activeFolderId) params.folderId = activeFolderId;
      if (isFavoriteFilter) params.isFavorite = true;
      if (searchQuery) params.search = searchQuery;
      
      const data = await notesApi.getNotes(params);
      setNotes(data);
    } catch (error) {
      toast.error('Failed to load notes');
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleCreateNote = async () => {
    try {
      const newNote = await notesApi.createNote({
        title: 'Untitled Note',
        folderId: activeFolderId || null
      });
      setNotes([newNote, ...notes]);
      handleSelectNote(newNote._id);
    } catch (error) {
      toast.error('Failed to create note');
    }
  };

  const handleSelectNote = (id) => {
    setSearchParams({ noteId: id });
  };

  const handleUpdateNote = (updatedNote) => {
    setSelectedNote(updatedNote);
    setNotes(notes.map(n => n._id === updatedNote._id ? updatedNote : n));
  };

  const handleDeleteNote = async (id) => {
    try {
      await notesApi.deleteNote(id);
      setNotes(notes.filter(n => n._id !== id));
      if (selectedNote?._id === id) {
        setSelectedNote(null);
        searchParams.delete('noteId');
        setSearchParams(searchParams);
      }
      toast.success('Note deleted');
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  return (
    <div className="flex h-[calc(100vh-56px)] bg-background text-foreground overflow-hidden">
      {/* 1. Sidebar (Folders, Filters) */}
      <div className="w-64 border-r border-border hidden md:block bg-card/50">
        <NotesSidebar 
          folders={folders}
          activeFolderId={activeFolderId}
          setActiveFolderId={setActiveFolderId}
          isFavoriteFilter={isFavoriteFilter}
          setIsFavoriteFilter={setIsFavoriteFilter}
          onFoldersChange={loadFolders}
          loading={loadingFolders}
        />
      </div>

      {/* 2. Note List (Middle Panel) */}
      <div className={`w-full md:w-80 border-r border-border bg-card/30 flex flex-col ${selectedNote ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-border">
          <input 
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm outline-none focus:border-primary"
          />
        </div>
        
        <div className="p-2 border-b border-border flex justify-between items-center">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-2">
            {notes.length} Notes
          </span>
          <button 
            onClick={handleCreateNote}
            className="text-xs bg-primary/10 text-primary hover:bg-primary/20 px-2 py-1 rounded transition-colors"
          >
            + New Note
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <NotesList 
            notes={notes}
            selectedNoteId={selectedNote?._id}
            onSelectNote={handleSelectNote}
            loading={loadingNotes}
          />
        </div>
      </div>

      {/* 3. Editor (Right Panel) */}
      <div className={`flex-1 flex flex-col bg-background relative ${!selectedNote ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
        {selectedNote ? (
          <NoteEditor 
            key={selectedNote._id} // Force remount on note change
            note={selectedNote}
            onUpdate={handleUpdateNote}
            onDelete={() => handleDeleteNote(selectedNote._id)}
            onBack={() => {
              setSelectedNote(null);
              searchParams.delete('noteId');
              setSearchParams(searchParams);
            }}
          />
        ) : (
          <div className="text-center text-muted-foreground">
            <div className="text-4xl mb-4">📓</div>
            <h3 className="text-lg font-medium text-foreground mb-1">Developer Notes</h3>
            <p className="text-sm max-w-sm mx-auto">
              Select a note to view, or create a new one to start writing.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
