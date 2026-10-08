import React, { useState } from 'react';
import { Folder, FileText, Star, Plus, FolderPlus, MoreVertical, Trash2 } from 'lucide-react';
import { notesApi } from '../../api/notesApi';
import toast from 'react-hot-toast';

export default function NotesSidebar({ 
  folders, 
  activeFolderId, 
  setActiveFolderId, 
  isFavoriteFilter, 
  setIsFavoriteFilter,
  onFoldersChange,
  loading 
}) {
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      await notesApi.createFolder({ name: newFolderName });
      setNewFolderName('');
      setIsCreatingFolder(false);
      onFoldersChange();
    } catch (error) {
      toast.error("Failed to create folder");
    }
  };

  const handleDeleteFolder = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Delete this folder? Notes inside will be moved to root.")) return;
    try {
      await notesApi.deleteFolder(id);
      if (activeFolderId === id) setActiveFolderId(null);
      onFoldersChange();
    } catch (error) {
      toast.error("Failed to delete folder");
    }
  };

  return (
    <div className="h-full flex flex-col py-4 overflow-y-auto custom-scrollbar">
      <div className="px-4 mb-6">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          Workspace
        </h2>
      </div>

      <div className="space-y-1 px-2 mb-6">
        <button 
          onClick={() => { setActiveFolderId(null); setIsFavoriteFilter(false); }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${!activeFolderId && !isFavoriteFilter ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
        >
          <FileText className="h-4 w-4" />
          All Notes
        </button>
        <button 
          onClick={() => { setActiveFolderId(null); setIsFavoriteFilter(true); }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isFavoriteFilter ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
        >
          <Star className="h-4 w-4" />
          Favorites
        </button>
      </div>

      <div className="px-4 mb-2 flex items-center justify-between group">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Folders</span>
        <button 
          onClick={() => setIsCreatingFolder(!isCreatingFolder)}
          className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <FolderPlus className="h-4 w-4" />
        </button>
      </div>

      {isCreatingFolder && (
        <div className="px-4 mb-2">
          <form onSubmit={handleCreateFolder} className="flex items-center gap-2">
            <input 
              autoFocus
              type="text" 
              placeholder="Folder name..." 
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full bg-background border border-border rounded px-2 py-1 text-sm outline-none focus:border-primary"
            />
          </form>
        </div>
      )}

      <div className="space-y-0.5 px-2">
        {loading ? (
          <div className="px-4 py-2 text-sm text-muted-foreground">Loading...</div>
        ) : folders.length === 0 ? (
          <div className="px-4 py-2 text-xs text-muted-foreground italic">No folders yet.</div>
        ) : (
          folders.map(folder => (
            <div 
              key={folder._id}
              onClick={() => { setActiveFolderId(folder._id); setIsFavoriteFilter(false); }}
              className={`w-full flex items-center justify-between group px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors ${activeFolderId === folder._id ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
            >
              <div className="flex items-center gap-3 truncate">
                <Folder className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{folder.name}</span>
              </div>
              <button 
                onClick={(e) => handleDeleteFolder(folder._id, e)}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity p-1"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
