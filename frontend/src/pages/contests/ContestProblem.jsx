import React, { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import Editor from "@monaco-editor/react"
import { Play, Check, ChevronLeft, List, Loader2, Trophy, Clock } from "lucide-react"
import { problemsApi } from "../../api/problemsApi"
import { codeApi } from "../../api/codeApi"
import { submissionApi } from "../../api/submissionApi"
import { contestApi } from "../../api/contestApi"
import toast from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"

const LANGUAGES = [
  { name: 'Java', value: 'java', field: 'starterCodeJava' },
  { name: 'Python 3', value: 'python', field: 'starterCodePython' },
  { name: 'C++', value: 'c++', field: 'starterCodeCpp' },
  { name: 'JavaScript', value: 'javascript', field: 'starterCodeJavaScript' },
];

export default function ContestProblem() {
  const { contestId, problemId } = useParams();
  const navigate = useNavigate();
  
  const [contest, setContest] = useState(null);
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [timeLeft, setTimeLeft] = useState('');
  
  // Code Editor State
  const [language, setLanguage] = useState(LANGUAGES[0].value);
  const [code, setCode] = useState("");
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [runResult, setRunResult] = useState(null);
  
  // Test Cases
  const [examples, setExamples] = useState([]);
  const [selectedExample, setSelectedExample] = useState(null);
  const [customInput, setCustomInput] = useState("");

  const [showResultModal, setShowResultModal] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [cData, pData, exampleData] = await Promise.all([
          contestApi.getContestById(contestId),
          problemsApi.getProblemById(problemId),
          problemsApi.getProblemExamples(problemId)
        ]);

        setContest(cData);
        setProblem(pData);
        setExamples(exampleData || []);
        
        if (exampleData && exampleData.length > 0) {
          setSelectedExample(0);
          setCustomInput(exampleData[0].input);
        }
        
        const savedCode = localStorage.getItem(`contest_${contestId}_code_${problemId}_${LANGUAGES[0].value}`);
        setCode(savedCode || pData.starterCodeJava || "");
        
      } catch (error) {
        toast.error("Error loading data");
        navigate(`/contests/${contestId}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [contestId, problemId]);

  useEffect(() => {
    if (!contest) return;
    const updateTimer = () => {
      const now = new Date();
      const end = new Date(contest.endTime);
      if (now <= end) {
        const diff = end - now;
        const totalSeconds = Math.floor(diff / 1000);
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        setTimeLeft(`${h}h ${m}m ${s}s remaining`);
      } else {
        setTimeLeft('Contest Ended');
      }
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [contest]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    const savedCode = localStorage.getItem(`contest_${contestId}_code_${problemId}_${newLang}`);
    if (savedCode) {
      setCode(savedCode);
    } else {
      const langObj = LANGUAGES.find(l => l.value === newLang);
      setCode(problem[langObj?.field] || "");
    }
  };

  const handleCodeChange = (value) => {
    setCode(value || "");
    localStorage.setItem(`contest_${contestId}_code_${problemId}_${language}`, value || "");
  };

  const handleRun = async () => {
    if (!code.trim()) return;
    setRunning(true);
    try {
      const result = await codeApi.runCode(language, code, customInput);
      setRunResult(result);
    } catch (error) {
      setRunResult({ status: 'Error', stderr: 'Internal Server Error' });
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) return;
    setSubmitting(true);
    try {
      const result = await submissionApi.submitCode(problemId, language, code, contestId);
      setSubmissionResult(result);
      setShowResultModal(true);
      // We rely on the socket in the Leaderboard to update scores.
    } catch (error) {
      toast.error('Error submitting code');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !problem) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto h-8 w-8 text-primary" /></div>;

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-[#0A0A0A] text-slate-200">
      
      {/* Contest Topbar */}
      <div className="h-12 border-b border-border bg-primary/5 flex items-center justify-between px-4">
        <div className="flex items-center gap-4 text-sm">
          <Link to={`/contests/${contestId}`} className="text-muted-foreground hover:text-foreground flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" /> Back to Contest
          </Link>
          <span className="font-bold">{contest?.title}</span>
        </div>
        <div className="flex items-center gap-2 text-primary font-bold text-sm bg-primary/10 px-3 py-1.5 rounded">
          <Clock className="h-4 w-4" /> {timeLeft}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden p-2 gap-2">
        {/* Left: Problem Description */}
        <div className="w-1/2 bg-card border border-border rounded-lg overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border bg-muted/30 font-bold flex items-center gap-2">
            <List className="h-4 w-4 text-muted-foreground" /> {problem.title}
          </div>
          <div className="flex-1 overflow-y-auto p-6 prose prose-invert max-w-none text-sm custom-scrollbar whitespace-pre-wrap">
            {problem.description}
          </div>
        </div>

        {/* Right: Editor & Console */}
        <div className="w-1/2 flex flex-col gap-2">
          {/* Editor */}
          <div className="flex-1 bg-card border border-border rounded-lg flex flex-col overflow-hidden">
            <div className="h-10 flex items-center justify-between bg-muted/30 border-b border-border px-3">
              <select className="bg-transparent text-sm focus:outline-none" value={language} onChange={handleLanguageChange}>
                {LANGUAGES.map(l => <option key={l.value} value={l.value} className="bg-card">{l.name}</option>)}
              </select>
              <div className="flex gap-2">
                <button onClick={handleRun} disabled={running} className="text-xs bg-muted hover:bg-muted/80 px-3 py-1 rounded flex items-center gap-1">
                  {running ? <Loader2 className="h-3 w-3 animate-spin text-success" /> : <Play className="h-3 w-3 text-success" />} Run
                </button>
                <button onClick={handleSubmit} disabled={submitting} className="text-xs bg-success text-success-foreground hover:bg-success/90 px-3 py-1 rounded font-bold flex items-center gap-1">
                  {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} Submit
                </button>
              </div>
            </div>
            <div className="flex-1">
              <Editor
                language={language === 'c++' ? 'cpp' : language}
                theme="vs-dark"
                value={code}
                onChange={handleCodeChange}
                options={{ minimap: { enabled: false }, fontSize: 14 }}
              />
            </div>
          </div>
          
          {/* Output Console */}
          <div className="h-48 bg-card border border-border rounded-lg p-3 overflow-y-auto custom-scrollbar font-mono text-sm">
            {!runResult ? <div className="text-muted-foreground text-xs">Run code to see output</div> : (
              <div className="space-y-2">
                <div className={`font-bold ${runResult.status === 'Accepted' ? 'text-success' : 'text-destructive'}`}>
                  {runResult.status}
                </div>
                {runResult.compileOutput && <pre className="text-destructive text-xs whitespace-pre-wrap">{runResult.compileOutput}</pre>}
                {runResult.stdout && <div><span className="text-muted-foreground text-xs">Stdout:</span><pre className="text-xs whitespace-pre-wrap mt-1">{runResult.stdout}</pre></div>}
                {runResult.stderr && <pre className="text-destructive text-xs whitespace-pre-wrap">{runResult.stderr}</pre>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Result Modal */}
      <AnimatePresence>
        {showResultModal && submissionResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card border border-border rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/20 flex justify-between">
                <h2 className={`text-xl font-bold ${submissionResult.status === 'Accepted' ? 'text-success' : 'text-destructive'}`}>{submissionResult.status}</h2>
                <button onClick={() => setShowResultModal(false)} className="text-muted-foreground">✕</button>
              </div>
              <div className="p-6">
                <div className="flex gap-4 mb-4 text-center">
                  <div className="flex-1 bg-muted rounded p-2"><div className="text-xs text-muted-foreground">Passed</div><div className="font-bold">{submissionResult.passedCount}/{submissionResult.totalCount}</div></div>
                  <div className="flex-1 bg-muted rounded p-2"><div className="text-xs text-muted-foreground">Runtime</div><div className="font-bold">{submissionResult.executionTime || '-'}</div></div>
                </div>
                {submissionResult.status === 'Accepted' && (
                  <div className="bg-emerald-500/10 text-emerald-500 p-3 rounded text-sm text-center font-medium border border-emerald-500/20">
                    Points Awarded! Leaderboard Updated.
                  </div>
                )}
                {submissionResult.status !== 'Accepted' && (
                  <div className="bg-rose-500/10 text-rose-500 p-3 rounded text-sm text-center font-medium border border-rose-500/20">
                    +20 Minute ICPC Penalty
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
