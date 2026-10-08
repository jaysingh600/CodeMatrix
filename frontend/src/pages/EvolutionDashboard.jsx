import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DiffEditor } from '@monaco-editor/react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ChevronLeft, GitCommit, Play, RotateCcw, Save, TrendingUp, Cpu, Activity, Clock, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { evolutionApi } from '../api/evolutionApi';
import { problemsApi } from '../api/problemsApi';
import toast from 'react-hot-toast';

export default function EvolutionDashboard() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [versions, setVersions] = useState([]);
  const [selectedVersionId, setSelectedVersionId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const prob = await problemsApi.getProblemById(id);
      setProblem(prob);
      
      const vers = await evolutionApi.getProblemVersions(id);
      setVersions(vers);
      
      if (vers.length > 0) {
        setSelectedVersionId(vers[0]._id);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load evolution data');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    try {
      await evolutionApi.restoreVersion(selectedVersionId);
      toast.success('Version restored successfully');
      fetchData(); // reload
    } catch (error) {
      toast.error('Failed to restore version');
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-[#0A0A0A]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  const selectedVersion = versions.find(v => v._id === selectedVersionId);
  const previousVersion = selectedVersion?.parentVersion 
    ? versions.find(v => v._id === selectedVersion?.parentVersion)
    : (versions.indexOf(selectedVersion) < versions.length - 1 ? versions[versions.indexOf(selectedVersion) + 1] : null);

  // Chart data
  const chartData = [...versions].reverse().map(v => ({
    name: `v${v.versionNumber}`,
    runtime: v.runtime ? parseFloat(v.runtime) : 0,
    memory: v.memory ? parseFloat(v.memory) : 0,
    timeComplexity: v.timeComplexity || 'N/A',
  }));

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-[#0A0A0A] text-slate-200">
      {/* Top Header */}
      <div className="flex h-14 items-center justify-between px-4 border-b border-border bg-card shadow-sm">
        <div className="flex items-center gap-4">
          <Link to={`/problems/${id}`} className="text-slate-400 hover:text-white transition-colors flex items-center">
            <ChevronLeft className="h-5 w-5 mr-1" />
            <span className="font-semibold text-sm">Back to Problem</span>
          </Link>
          <div className="h-6 w-px bg-border"></div>
          <h1 className="font-bold text-slate-100 flex items-center gap-2">
            <GitCommit className="h-5 w-5 text-primary" />
            {problem?.title} <span className="text-slate-500 font-normal">/</span> Evolution
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
            {versions.length} Version{versions.length !== 1 && 's'}
          </span>
          <button onClick={handleRestore} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-1.5 rounded-md transition-colors shadow-lg shadow-indigo-900/20">
            <RotateCcw className="h-4 w-4" /> Restore this version
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Panel: Timeline */}
        <div className="w-64 border-r border-border bg-[#101216] overflow-y-auto custom-scrollbar flex flex-col">
          <div className="p-4 border-b border-border sticky top-0 bg-[#101216]/90 backdrop-blur z-10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Version History</h3>
          </div>
          <div className="flex-1 p-4 relative">
            {/* Vertical Line */}
            <div className="absolute left-6 top-6 bottom-6 w-px bg-slate-800 z-0"></div>
            
            <div className="space-y-6 relative z-10">
              {versions.map((v) => {
                const isSelected = v._id === selectedVersionId;
                const isAccepted = v.status === 'Accepted';
                
                return (
                  <div 
                    key={v._id}
                    onClick={() => setSelectedVersionId(v._id)}
                    className={`relative cursor-pointer group flex gap-3 ${isSelected ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
                  >
                    <div className={`mt-1 h-4 w-4 rounded-full border-[3px] flex-shrink-0 bg-[#101216] transition-colors ${
                      isSelected 
                        ? (isAccepted ? 'border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]')
                        : 'border-slate-700 group-hover:border-slate-500'
                    }`}></div>
                    
                    <div className={`flex-1 bg-card rounded-lg p-3 border transition-all ${
                      isSelected ? 'border-slate-600 shadow-md' : 'border-transparent group-hover:border-slate-800 bg-transparent'
                    }`}>
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-sm text-slate-200">v{v.versionNumber}</span>
                        <span className="text-[10px] text-slate-500">{format(new Date(v.createdAt), 'h:mm a')}</span>
                      </div>
                      
                      {v.title && (
                        <div className="text-xs font-medium text-slate-300 mb-1">{v.title}</div>
                      )}

                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          isAccepted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-destructive/20 text-destructive'
                        }`}>
                          {v.status}
                        </span>
                      </div>
                      
                      {(v.runtime || v.timeComplexity) && (
                        <div className="flex gap-3 text-[10px] text-slate-400">
                          {v.runtime && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {v.runtime}</span>}
                          {v.timeComplexity && <span className="flex items-center gap-1"><Activity className="h-3 w-3" /> {v.timeComplexity}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center Panel: Diff Viewer */}
        <div className="flex-1 flex flex-col bg-[#0d1117]">
          <div className="h-10 flex items-center justify-between px-4 bg-[#161b22] border-b border-slate-800">
            <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
              <FileText className="h-3.5 w-3.5" />
              {previousVersion ? `Comparing v${previousVersion.versionNumber} → v${selectedVersion?.versionNumber}` : `Initial Version v${selectedVersion?.versionNumber}`}
            </div>
            <div className="text-xs text-slate-500">
              Read-only Monaco Diff Editor
            </div>
          </div>
          
          <div className="flex-1 p-2">
            <DiffEditor
              height="100%"
              language={selectedVersion?.language === 'c++' ? 'cpp' : selectedVersion?.language || 'javascript'}
              theme="vs-dark"
              original={previousVersion?.sourceCode || ''}
              modified={selectedVersion?.sourceCode || ''}
              options={{
                readOnly: true,
                renderSideBySide: true,
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: 'JetBrains Mono, monospace',
                scrollBeyondLastLine: false,
                renderOverviewRuler: false,
                ignoreTrimWhitespace: false,
              }}
            />
          </div>
        </div>

        {/* Right Panel: Analytics & AI */}
        <div className="w-80 border-l border-border bg-card overflow-y-auto custom-scrollbar flex flex-col">
          <div className="p-4 border-b border-border bg-muted/20">
            <h3 className="text-sm font-bold flex items-center gap-2 text-slate-200">
              <BotIcon className="h-4 w-4 text-indigo-400" /> AI Evolution Analysis
            </h3>
          </div>
          
          <div className="p-4 space-y-6">
            
            {/* Complexity Badges */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#161b22] border border-slate-800 p-3 rounded-lg flex flex-col items-center justify-center">
                <span className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Activity className="h-3 w-3" /> Time</span>
                <span className="text-lg font-bold font-mono text-emerald-400">{selectedVersion?.timeComplexity || '-'}</span>
              </div>
              <div className="bg-[#161b22] border border-slate-800 p-3 rounded-lg flex flex-col items-center justify-center">
                <span className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Cpu className="h-3 w-3" /> Space</span>
                <span className="text-lg font-bold font-mono text-blue-400">{selectedVersion?.spaceComplexity || '-'}</span>
              </div>
            </div>

            {/* AI Summary */}
            {selectedVersion?.aiAnalysis && (
              <div className="space-y-4">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                  <div className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-2">What Improved</div>
                  <p className="text-sm text-slate-300 leading-relaxed">{selectedVersion.aiAnalysis.whatImproved}</p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                  <div className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-2">Needs Work</div>
                  <p className="text-sm text-slate-300 leading-relaxed">{selectedVersion.aiAnalysis.needsWork}</p>
                </div>
                <div className="flex items-center justify-between bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Readiness</span>
                  <span className="text-sm font-bold text-indigo-100 bg-indigo-500/30 px-2 py-0.5 rounded">{selectedVersion.aiAnalysis.readiness}</span>
                </div>
              </div>
            )}
            
            {/* Graphs */}
            <div className="pt-4 border-t border-slate-800">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <TrendingUp className="h-3 w-3" /> Runtime Trend
              </h4>
              <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} stroke="#475569" />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} stroke="#475569" width={30} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                      itemStyle={{ color: '#38bdf8' }}
                    />
                    <Line type="monotone" dataKey="runtime" stroke="#38bdf8" strokeWidth={2} dot={{ r: 3, fill: '#38bdf8' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

// Simple bot icon since it's not exported from lucide directly by that name in some versions (Bot is usually available, fallback used here just in case)
function BotIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  );
}
