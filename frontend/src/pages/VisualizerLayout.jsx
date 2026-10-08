import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, SkipForward, SkipBack, Settings, Shuffle, Edit3 } from 'lucide-react';
import VisualizerSidebar from '../components/visualizer/VisualizerSidebar';
import VisualizerCanvas from '../components/visualizer/VisualizerCanvas';
import VisualizerInfo from '../components/visualizer/VisualizerInfo';
import AiVisualizerDrawer from '../components/visualizer/AiVisualizerDrawer';
import { useVisualizer } from '../lib/visualizerEngine';
import { generateBubbleSortStates, bubbleSortMetadata } from '../lib/algorithms/bubbleSort';
import { generateMergeSortStates, mergeSortMetadata } from '../lib/algorithms/mergeSort';
import { visualizerApi } from '../api/visualizerApi';
import toast from 'react-hot-toast';

const ALGORITHMS = {
  'bubble-sort': { generator: generateBubbleSortStates, metadata: bubbleSortMetadata },
  'merge-sort': { generator: generateMergeSortStates, metadata: mergeSortMetadata }
};

export default function VisualizerLayout() {
  const [selectedAlg, setSelectedAlg] = useState('bubble-sort');
  const [data, setData] = useState([45, 23, 11, 89, 77, 98, 4, 28, 65, 43]);
  const [customInput, setCustomInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [states, setStates] = useState([]);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);

  const engine = useVisualizer(states);

  useEffect(() => {
    // Load preferences
    visualizerApi.getPreferences().then(res => {
      if (res?.preferences?.speed) {
        engine.setSpeed(res.preferences.speed);
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    // Recompute states when algorithm or data changes
    const alg = ALGORITHMS[selectedAlg];
    if (alg) {
      engine.reset();
      const newStates = alg.generator(data);
      setStates(newStates);
      
      // Track algorithm
      visualizerApi.trackAlgorithm(selectedAlg).catch(console.error);
    }
  }, [selectedAlg, data]);

  const handleGenerateRandom = () => {
    const newData = Array.from({ length: 15 }, () => Math.floor(Math.random() * 90) + 10);
    setData(newData);
    toast.success('Generated random data');
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const arr = customInput.split(',').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n));
    if (arr.length > 0) {
      setData(arr);
      setShowCustomInput(false);
      setCustomInput('');
      toast.success('Custom data loaded');
    } else {
      toast.error('Invalid input format');
    }
  };

  const handleSpeedChange = (e) => {
    const newSpeed = parseFloat(e.target.value);
    engine.setSpeed(newSpeed);
    visualizerApi.updatePreferences({ speed: newSpeed }).catch(console.error);
  };

  const currentMetadata = ALGORITHMS[selectedAlg]?.metadata;

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-[#0A0A0A] text-slate-200 overflow-hidden">
      
      {/* Top Navigation / Controls */}
      <div className="h-14 border-b border-border bg-card flex items-center justify-between px-4 z-20">
        <div className="flex items-center gap-4">
          <h2 className="font-bold text-slate-100 hidden md:block">Algorithm Visualizer Lab</h2>
          <div className="h-6 w-px bg-border hidden md:block"></div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleGenerateRandom}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-700 transition-colors"
            >
              <Shuffle className="h-3.5 w-3.5 text-indigo-400" /> Random
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowCustomInput(!showCustomInput)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-700 transition-colors"
              >
                <Edit3 className="h-3.5 w-3.5 text-emerald-400" /> Custom
              </button>
              
              {showCustomInput && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-card border border-slate-700 rounded-lg p-3 shadow-xl z-50">
                  <form onSubmit={handleCustomSubmit}>
                    <label className="text-[10px] text-slate-400 uppercase font-bold mb-2 block">Enter comma-separated numbers</label>
                    <input 
                      type="text" 
                      value={customInput}
                      onChange={e => setCustomInput(e.target.value)}
                      placeholder="e.g. 5, 10, 2, 8"
                      className="w-full bg-[#0d1117] border border-slate-700 rounded px-2 py-1 text-sm mb-2 text-white outline-none focus:border-primary"
                    />
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setShowCustomInput(false)} className="text-xs px-2 py-1 text-slate-400 hover:text-white">Cancel</button>
                      <button type="submit" className="text-xs px-3 py-1 bg-primary text-primary-foreground rounded">Apply</button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Playback Controls Center */}
        <div className="flex items-center gap-3">
          <button onClick={engine.stepBackward} disabled={engine.isPlaying || engine.currentStep === 0} className="p-2 text-slate-400 hover:text-white disabled:opacity-30">
            <SkipBack className="h-4 w-4" />
          </button>
          
          {engine.isPlaying ? (
            <button onClick={engine.pause} className="h-10 w-10 rounded-full bg-orange-500/20 text-orange-500 border border-orange-500/50 flex items-center justify-center hover:bg-orange-500/30">
              <Pause className="h-5 w-5" />
            </button>
          ) : (
            <button onClick={engine.play} disabled={engine.currentStep >= engine.totalSteps - 1} className="h-10 w-10 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/50 flex items-center justify-center hover:bg-emerald-500/30 disabled:opacity-30">
              <Play className="h-5 w-5 ml-1" />
            </button>
          )}

          <button onClick={engine.stepForward} disabled={engine.isPlaying || engine.currentStep >= engine.totalSteps - 1} className="p-2 text-slate-400 hover:text-white disabled:opacity-30">
            <SkipForward className="h-4 w-4" />
          </button>
          
          <button onClick={engine.reset} className="p-2 text-slate-400 hover:text-white ml-2">
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        {/* Speed Controls Right */}
        <div className="flex items-center gap-3">
          <Settings className="h-4 w-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-400 w-8">{engine.speed}x</span>
          <input 
            type="range" 
            min="0.25" 
            max="4" 
            step="0.25" 
            value={engine.speed} 
            onChange={handleSpeedChange}
            className="w-24 accent-primary"
          />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 w-full bg-slate-900 relative">
        <div 
          className="absolute top-0 left-0 h-full bg-primary transition-all duration-200"
          style={{ width: `${(engine.currentStep / Math.max(engine.totalSteps - 1, 1)) * 100}%` }}
        />
      </div>

      {/* Main 3-Panel Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar */}
        <VisualizerSidebar 
          selectedAlgorithmId={selectedAlg} 
          onSelect={(id) => setSelectedAlg(id)} 
        />

        {/* Center Canvas */}
        <div className="flex-1 flex flex-col relative bg-[#0d1117]">
          <VisualizerCanvas state={engine.currentState} />
          
          {/* Bottom Stats Overlay */}
          {engine.currentState && (
            <div className="absolute bottom-4 left-4 flex gap-4 text-xs font-mono">
              <div className="bg-slate-800/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700/50 flex gap-2 shadow-lg">
                <span className="text-slate-400">Step:</span>
                <span className="text-emerald-400 font-bold">{engine.currentStep + 1} / {engine.totalSteps}</span>
              </div>
              {engine.currentState.comparisons !== undefined && (
                <div className="bg-slate-800/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700/50 flex gap-2 shadow-lg">
                  <span className="text-slate-400">Comparisons:</span>
                  <span className="text-blue-400 font-bold">{engine.currentState.comparisons}</span>
                </div>
              )}
              {engine.currentState.swaps !== undefined && (
                <div className="bg-slate-800/80 backdrop-blur px-3 py-1.5 rounded-md border border-slate-700/50 flex gap-2 shadow-lg">
                  <span className="text-slate-400">Swaps:</span>
                  <span className="text-orange-400 font-bold">{engine.currentState.swaps}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Info Panel */}
        <VisualizerInfo 
          metadata={currentMetadata} 
          currentState={engine.currentState}
          onExplainClick={() => setIsAiDrawerOpen(true)}
        />
      </div>

      {/* AI Drawer */}
      <AiVisualizerDrawer 
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        state={engine.currentState}
        metadata={currentMetadata}
      />
    </div>
  );
}
