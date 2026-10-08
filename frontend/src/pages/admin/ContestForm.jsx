import React, { useState, useEffect } from 'react';
import { contestApi } from '../../api/contestApi';
import { problemsApi } from '../../api/problemsApi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AdminContestForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    startTime: '',
    endTime: '',
    duration: 120,
    status: 'Upcoming'
  });
  
  const [availableProblems, setAvailableProblems] = useState([]);
  const [selectedProblems, setSelectedProblems] = useState([]);

  useEffect(() => {
    problemsApi.getProblems().then(res => setAvailableProblems(res.problems)).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const contestData = {
        ...formData,
        problems: selectedProblems.map((p, i) => ({
          problemId: p._id,
          points: p.points,
          order: i + 1
        }))
      };
      await contestApi.createContest(contestData);
      toast.success('Contest created successfully!');
      navigate('/contests');
    } catch (error) {
      toast.error('Failed to create contest');
    }
  };

  const addProblem = (prob) => {
    if (!selectedProblems.find(p => p._id === prob._id)) {
      setSelectedProblems([...selectedProblems, { ...prob, points: 10 }]);
    }
  };

  const removeProblem = (id) => {
    setSelectedProblems(selectedProblems.filter(p => p._id !== id));
  };

  const updatePoints = (id, points) => {
    setSelectedProblems(selectedProblems.map(p => p._id === id ? { ...p, points: Number(points) } : p));
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create New Contest</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-background border border-border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Slug</label>
            <input type="text" required value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full bg-background border border-border rounded p-2" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-background border border-border rounded p-2 h-24" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Time</label>
            <input type="datetime-local" required value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="w-full bg-background border border-border rounded p-2 text-foreground" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Time</label>
            <input type="datetime-local" required value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="w-full bg-background border border-border rounded p-2 text-foreground" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Duration (mins)</label>
            <input type="number" required value={formData.duration} onChange={e => setFormData({...formData, duration: Number(e.target.value)})} className="w-full bg-background border border-border rounded p-2" />
          </div>
        </div>

        <div className="border-t border-border pt-6 mt-6">
          <h2 className="text-xl font-bold mb-4">Contest Problems</h2>
          
          <div className="grid grid-cols-2 gap-8">
            {/* Available */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Available Database Problems</h3>
              <div className="h-64 overflow-y-auto bg-card border border-border rounded p-2 space-y-2">
                {availableProblems.map(p => (
                  <div key={p._id} className="flex justify-between items-center p-2 hover:bg-muted rounded text-sm">
                    <span>{p.title}</span>
                    <button type="button" onClick={() => addProblem(p)} className="text-primary hover:underline">Add</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Selected for Contest</h3>
              <div className="h-64 overflow-y-auto bg-card border border-border rounded p-2 space-y-2">
                {selectedProblems.length === 0 && <p className="text-sm text-muted-foreground p-2">No problems selected.</p>}
                {selectedProblems.map(p => (
                  <div key={p._id} className="p-2 bg-muted rounded text-sm flex items-center justify-between">
                    <span className="truncate w-1/2">{p.title}</span>
                    <div className="flex items-center gap-2">
                      <input type="number" value={p.points} onChange={e => updatePoints(p._id, e.target.value)} className="w-16 bg-background border border-border rounded p-1 text-center" /> pts
                      <button type="button" onClick={() => removeProblem(p._id)} className="text-destructive font-bold">&times;</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button type="submit" className="w-full bg-primary text-primary-foreground py-3 rounded-md font-bold mt-8">
          Create Contest
        </button>
      </form>
    </div>
  );
}
