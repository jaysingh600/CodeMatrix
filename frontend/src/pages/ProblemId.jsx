import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import Editor from "@monaco-editor/react"
import { Play, Check, ChevronLeft, ChevronRight, Lightbulb, Bot, List, Loader2, History, GitCommit, Save, BookOpen, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { problemsApi } from "@/api/problemsApi"
import { codeApi } from "@/api/codeApi"
import { submissionApi } from "@/api/submissionApi"
import { aiApi } from "@/api/aiApi"
import AiHintModal from "@/components/AiHintModal"
import AiMentorDrawer from "@/components/AiMentorDrawer"
import ChatRoomDrawer from "@/components/chat/ChatRoomDrawer"
import MDEditor from '@uiw/react-md-editor'
import { evolutionApi } from "@/api/evolutionApi"
import { notesApi } from "@/api/notesApi"
import toast from "react-hot-toast"
import { Panel, Group, Separator } from "react-resizable-panels"
import { useAuth } from "@/context/AuthContext"

const LANGUAGES = [
  { name: 'Java', value: 'java', field: 'starterCodeJava' },
  { name: 'Python 3', value: 'python', field: 'starterCodePython' },
  { name: 'C++', value: 'c++', field: 'starterCodeCpp' },
  { name: 'JavaScript', value: 'javascript', field: 'starterCodeJavaScript' },
];

export default function ProblemId() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [problem, setProblem] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const [showHintModal, setShowHintModal] = useState(false)
  const [showMentorDrawer, setShowMentorDrawer] = useState(false)
  const [showChatDrawer, setShowChatDrawer] = useState(false)
  const [initialChatTab, setInitialChatTab] = useState("global")
  
  const [activeTab, setActiveTab] = useState("description")
  const [activeBottomTab, setActiveBottomTab] = useState("testcases") // testcases, output, history
  
  // Code Editor State
  const [language, setLanguage] = useState(LANGUAGES[0].value)
  const [code, setCode] = useState("")
  const [running, setRunning] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [runResult, setRunResult] = useState(null)
  
  // Submission History
  const [history, setHistory] = useState([])
  
  // Test Cases & Custom Input
  const [examples, setExamples] = useState([])
  const [selectedExample, setSelectedExample] = useState(null)
  const [customInput, setCustomInput] = useState("")

  // Submission Result Modal
  const [showResultModal, setShowResultModal] = useState(false)
  const [submissionResult, setSubmissionResult] = useState(null)
  
  // AI State
  const [aiLoading, setAiLoading] = useState(false)
  const [hintResponse, setHintResponse] = useState(null)
  const [hintHistory, setHintHistory] = useState([])

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setLoading(true)
        if (id) {
          const data = await problemsApi.getProblemById(id)
          setProblem(data)
          
          // Set initial code
          const savedCode = localStorage.getItem(`code_${id}_${LANGUAGES[0].value}`)
          if (savedCode) {
            setCode(savedCode)
          } else {
            setCode(data.starterCodeJava || "")
          }
          
          // Set initial custom input if inputFormat exists
          
          try {
            const exampleData = await problemsApi.getProblemExamples(data._id)
            setExamples(exampleData)
            if (exampleData && exampleData.length > 0) {
              setSelectedExample(0)
              setCustomInput(exampleData[0].input)
            } else {
              setCustomInput(data.inputFormat || "1 2 3\n")
            }
          } catch(e) {}

        }
      } catch (error) {
        console.error("Error fetching problem:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchProblem()
  }, [id])

  useEffect(() => {
    if (isAuthenticated && problem) {
      fetchHistory(problem._id)
    }
  }, [isAuthenticated, problem])

  const fetchHistory = async (problemId) => {
    if (!isAuthenticated) return;
    try {
      const data = await submissionApi.getProblemSubmissions(problemId)
      setHistory(data)
    } catch (e) {
      console.error(e)
    }
  }

  const handleLanguageChange = (e) => {
    const newLang = e.target.value
    setLanguage(newLang)
    
    if (problem) {
      const savedCode = localStorage.getItem(`code_${problem._id}_${newLang}`)
      if (savedCode) {
        setCode(savedCode)
      } else {
        const langObj = LANGUAGES.find(l => l.value === newLang)
        setCode(problem[langObj?.field] || "")
      }
    }
  }

  const handleCodeChange = (value) => {
    const newCode = value || ""
    setCode(newCode)
    if (problem) {
      localStorage.setItem(`code_${problem._id}_${language}`, newCode)
    }
  }

  const handleRun = async () => {
    if (!code.trim() || !problem) return
    setRunning(true)
    setActiveBottomTab("output")
    setRunResult(null)
    try {
      const result = await codeApi.runCode(language, code, customInput)
      setRunResult(result)
    } catch (error) {
      console.error(error)
      const errorMsg = error.response?.data?.message || 'Internal Server Error (Judge0 engine might be offline)';
      setRunResult({ status: 'Error', stdout: null, stderr: errorMsg, compileOutput: null, executionTime: null, memory: null })
    } finally {
      setRunning(false)
    }
  }

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to submit code')
      return
    }
    if (!code.trim() || !problem) return
    setSubmitting(true)
    try {
      const result = await submissionApi.submitCode(problem._id, language, code)
      setSubmissionResult(result)
      setShowResultModal(true)
      await fetchHistory(problem._id)
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Error submitting code')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSelectHint = async (hintType) => {
    if (!isAuthenticated) {
      toast.error('Please log in to use AI hints')
      setShowHintModal(false)
      return
    }
    if (!code.trim() || !problem) return;
    setAiLoading(true);
    try {
      // Find latest failed submission id if any
      const failedSub = history.find(s => s.status !== 'Accepted');
      const failedId = failedSub ? failedSub._id : null;
      
      const result = await aiApi.getHint(problem._id, language, code, hintType, failedId);
      setHintResponse(result);
      setHintHistory(prev => [result, ...prev]);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Error generating hint');
      setShowHintModal(false);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return <div className="flex h-[calc(100vh-56px)] items-center justify-center bg-[#0A0A0A]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  }

  if (!problem) {
    return <div className="flex h-[calc(100vh-56px)] items-center justify-center bg-[#0A0A0A] text-white">Problem not found</div>
  }

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-[#0A0A0A]">
      {/* Top action bar */}
      <div className="flex h-12 items-center justify-between px-4 bg-card border-b border-border">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/problems"><List className="h-4 w-4" /></Link>
          </Button>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="h-8 w-8"><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8"><ChevronRight className="h-4 w-4" /></Button>
          </div>
          <span className="font-semibold text-sm line-clamp-1">{problem.title}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-primary border-primary/20 hover:bg-primary/10 gap-1.5"
            onClick={() => {
              if (!isAuthenticated) return toast.error('Please log in to use AI hints')
              setShowHintModal(true)
            }}
          >
            <Lightbulb className="h-4 w-4" /> AI Hint
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 gap-1.5"
            onClick={() => {
              if (!isAuthenticated) return toast.error('Please log in to use AI Mentor')
              setShowMentorDrawer(true)
            }}
          >
            <Bot className="h-4 w-4" /> AI Mentor
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-blue-400 border-blue-400/20 hover:bg-blue-400/10 gap-1.5"
            onClick={() => {
              if (!isAuthenticated) return toast.error('Please log in to join chat rooms')
              setInitialChatTab('global')
              setShowChatDrawer(true)
            }}
          >
            <List className="h-4 w-4" /> Global Room
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-purple-400 border-purple-400/20 hover:bg-purple-400/10 gap-1.5"
            onClick={() => {
              if (!isAuthenticated) return toast.error('Please log in to use private rooms')
              setInitialChatTab('private')
              setShowChatDrawer(true)
            }}
          >
            <Users className="h-4 w-4" /> Friends
          </Button>
          <div className="h-4 w-px bg-border mx-2"></div>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-indigo-400 border-indigo-400/20 hover:bg-indigo-400/10 gap-1.5"
            onClick={async () => {
              if (!isAuthenticated) return toast.error('Please log in to save checkpoints')
              try {
                await evolutionApi.createCheckpoint({ problemId: problem._id, language, sourceCode: code });
                toast.success('Checkpoint saved');
              } catch (e) {
                toast.error('Failed to save checkpoint');
              }
            }}
          >
            <Save className="h-4 w-4" /> Save
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            asChild
            className="text-emerald-400 border-emerald-400/20 hover:bg-emerald-400/10 gap-1.5"
          >
            <Link to={`/problems/${problem?._id}/evolution`}>
              <GitCommit className="h-4 w-4" /> Evolution
            </Link>
          </Button>
          <div className="h-4 w-px bg-border mx-2"></div>
          <Button variant="secondary" size="sm" className="gap-1.5 bg-muted hover:bg-muted/80" onClick={handleRun} disabled={running}>
            {running ? <Loader2 className="h-4 w-4 animate-spin text-success" /> : <Play className="h-4 w-4 text-success" />} 
            Run
          </Button>
          <Button variant="default" size="sm" className="gap-1.5 text-success-foreground bg-success hover:bg-success/90" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Submit
          </Button>
        </div>
      </div>

      {/* Main workspace */}
      <div className="flex flex-1 overflow-hidden p-2">
        <Group orientation="horizontal">
          {/* Left Panel - Description */}
          <Panel defaultSize={50} minSize={30}>
            <div className="h-full flex flex-col border border-border bg-card rounded-lg overflow-hidden shadow-sm">
              <div className="flex h-10 items-center bg-muted/30 border-b border-border px-2 shrink-0">
            <button 
              className={`px-3 py-1 text-sm font-medium rounded-md ${activeTab === 'description' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {activeTab === 'description' && (
              <div>
                <h1 className="text-2xl font-bold mb-4">{problem.title}</h1>
                <div className="flex items-center gap-4 mb-6">
                  <span className={`text-sm font-medium ${
                    problem.difficulty === 'Easy' ? 'text-success' : 
                    problem.difficulty === 'Medium' ? 'text-primary' : 'text-destructive'
                  }`}>
                    {problem.difficulty}
                  </span>
                  <div className="flex gap-2">
                    {problem.topic && problem.topic.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs bg-muted/50">{tag}</Badge>
                    ))}
                  </div>
                </div>

                <div className="prose prose-invert max-w-none text-sm text-foreground/90 whitespace-pre-wrap">
                  {problem.description}
                  <p className="font-bold mt-8 mb-2">Input Format:</p>
                  <p>{problem.inputFormat}</p>
                  
                  <p className="font-bold mt-4 mb-2">Output Format:</p>
                  <p>{problem.outputFormat}</p>

                  <div className="mt-8 space-y-6">
                    {problem.examples && problem.examples.map((example, i) => (
                      <div key={i} className="mb-4">
                        <p className="font-bold mb-2">Example {i + 1}:</p>
                        <div className="bg-muted/30 border border-border rounded-lg p-4 font-mono text-sm">
                          <p><span className="text-muted-foreground">Input:</span> {example.input}</p>
                          <p className="mt-2"><span className="text-muted-foreground">Output:</span> {example.output}</p>
                          {example.explanation && (
                            <p className="mt-2 text-foreground/80 font-sans"><span className="text-muted-foreground font-mono">Explanation:</span> {example.explanation}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {problem.constraints && problem.constraints.length > 0 && (
                    <>
                      <p className="font-bold mt-8 mb-2">Constraints:</p>
                      <ul className="list-disc pl-5 mb-8 space-y-1">
                        {problem.constraints.map((c, i) => <li key={i}><code>{c}</code></li>)}
                      </ul>
                    </>
                  )}
                </div>
                </div>
              )}
            </div>
          </div>
          </Panel>

          <Separator className="w-2 mx-1 flex-shrink-0 flex items-center justify-center group outline-none">
            <div className="h-12 w-1 rounded-full bg-border group-hover:bg-primary transition-colors"></div>
          </Separator>

          {/* Right Panel - Editor & Terminal */}
          <Panel defaultSize={50} minSize={30}>
            <Group orientation="vertical">
              {/* Editor */}
              <Panel defaultSize={70} minSize={20}>
                <div className="h-full bg-card border border-border rounded-lg overflow-hidden flex flex-col shadow-sm">
                  <div className="flex h-10 items-center justify-between bg-muted/30 border-b border-border px-3 shrink-0">
              <div className="flex items-center gap-2">
                <select 
                  className="bg-transparent text-sm font-medium text-foreground focus:outline-none border-none py-1 cursor-pointer"
                  value={language}
                  onChange={handleLanguageChange}
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang.value} value={lang.value} className="bg-card text-foreground">{lang.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex-1 w-full pt-2">
              <Editor
                height="100%"
                language={language === 'c++' ? 'cpp' : language}
                theme="vs-dark"
                value={code}
                onChange={handleCodeChange}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  fontFamily: 'JetBrains Mono, monospace',
                  padding: { top: 16 },
                  scrollBeyondLastLine: false,
                  roundedSelection: false,
                  }}
                />
              </div>
            </div>
            </Panel>

            <Separator className="h-2 my-1 flex-shrink-0 flex items-center justify-center group outline-none">
              <div className="w-12 h-1 rounded-full bg-border group-hover:bg-primary transition-colors"></div>
            </Separator>

            {/* Testcases Console */}
            <Panel defaultSize={30} minSize={10}>
              <div className="h-full bg-card border border-border rounded-lg overflow-hidden flex flex-col shadow-sm">
                <div className="flex h-10 items-center gap-4 bg-muted/30 border-b border-border px-4 shrink-0 overflow-x-auto custom-scrollbar">
              <button 
                className={`text-sm font-medium h-full px-1 ${activeBottomTab === 'testcases' ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setActiveBottomTab('testcases')}
              >
                Testcases
              </button>
              <button 
                className={`text-sm font-medium h-full px-1 ${activeBottomTab === 'output' ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setActiveBottomTab('output')}
              >
                Output
              </button>
              <button 
                className={`text-sm font-medium h-full px-1 flex items-center gap-1 ${activeBottomTab === 'history' ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setActiveBottomTab('history')}
              >
                <History className="h-3.5 w-3.5" /> History
              </button>
              <button 
                className={`text-sm font-medium h-full px-1 flex items-center gap-1 ${activeBottomTab === 'hints' ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setActiveBottomTab('hints')}
              >
                <Lightbulb className="h-3.5 w-3.5" /> AI Hints
              </button>
            </div>
            
            <div className="flex-1 flex flex-col p-4 overflow-hidden">
              {activeBottomTab === 'testcases' && (
                <div className="flex-1 overflow-y-auto">
                  {examples.length > 0 && (
                    <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
                      {examples.map((ex, idx) => (
                        <button
                          key={ex._id}
                          onClick={() => {
                            setSelectedExample(idx);
                            setCustomInput(ex.input);
                          }}
                          className={`px-3 py-1 text-xs rounded-md whitespace-nowrap transition-colors ${selectedExample === idx ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80 text-muted-foreground'}`}
                        >
                          Case {idx + 1}
                        </button>
                      ))}
                    </div>
                  )}
                  {selectedExample !== null && examples[selectedExample] && (
                    <div className="mb-4 text-xs font-mono">
                      <div className="mb-2">
                        <span className="text-muted-foreground block mb-1">Expected Output:</span>
                        <pre className="bg-muted/50 p-2 rounded border border-border text-foreground">{examples[selectedExample].expectedOutput}</pre>
                      </div>
                    </div>
                  )}
                  <div className="mb-4">
                    <span className="text-xs text-muted-foreground mb-1 block">Custom Input</span>
                    <textarea 
                      className="w-full h-32 bg-muted border border-border rounded-md px-3 py-2 font-mono text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                    />
                  </div>
                </div>
              )}
              
              {activeBottomTab === 'output' && (
                <div className="flex-1 overflow-y-auto font-mono text-sm">
                  {running ? (
                    <div className="flex items-center text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" /> Running code...
                    </div>
                  ) : runResult ? (
                    <div className="space-y-4">
                      <div>
                        <span className={`font-semibold ${runResult.status === 'Accepted' ? 'text-success' : 'text-destructive'}`}>
                          {runResult.status}
                        </span>
                        {(runResult.executionTime || runResult.memory) && (
                          <span className="text-muted-foreground ml-4 text-xs">
                            Time: {runResult.executionTime || 'N/A'} | Memory: {runResult.memory || 'N/A'}
                          </span>
                        )}
                      </div>
                      
                      {runResult.compileOutput && (
                        <div>
                          <span className="text-xs text-muted-foreground mb-1 block">Compile Output:</span>
                          <pre className="bg-muted p-2 rounded text-destructive whitespace-pre-wrap">{runResult.compileOutput}</pre>
                        </div>
                      )}
                      
                      {runResult.stdout && (
                        <div>
                          <span className="text-xs text-muted-foreground mb-1 block">Stdout:</span>
                          <pre className="bg-muted p-2 rounded whitespace-pre-wrap">{runResult.stdout}</pre>
                        </div>
                      )}
                      
                      {runResult.stderr && (
                        <div>
                          <span className="text-xs text-muted-foreground mb-1 block">Stderr:</span>
                          <pre className="bg-muted p-2 rounded text-destructive whitespace-pre-wrap">{runResult.stderr}</pre>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-muted-foreground">Run your code to see output here.</div>
                  )}
                </div>
              )}

              {activeBottomTab === 'history' && (
                <div className="flex-1 overflow-y-auto">
                  {history.length === 0 ? (
                    <div className="text-muted-foreground text-sm">No submissions yet.</div>
                  ) : (
                    <table className="w-full text-left text-sm text-muted-foreground">
                      <thead className="text-xs uppercase bg-muted/50">
                        <tr>
                          <th className="px-4 py-2">Status</th>
                          <th className="px-4 py-2">Language</th>
                          <th className="px-4 py-2">Runtime</th>
                          <th className="px-4 py-2">Memory</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((sub) => (
                          <tr key={sub._id} className="border-b border-border">
                            <td className={`px-4 py-3 font-medium ${sub.status === 'Accepted' ? 'text-success' : 'text-destructive'}`}>
                              {sub.status}
                            </td>
                            <td className="px-4 py-3">{sub.language}</td>
                            <td className="px-4 py-3">{sub.executionTime || '-'}</td>
                            <td className="px-4 py-3">{sub.memory || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
              
              {activeBottomTab === 'hints' && (
                <div className="flex-1 overflow-y-auto">
                  {hintHistory.length === 0 ? (
                    <div className="text-muted-foreground text-sm">No hints requested yet. Click "AI Hint" above to get started.</div>
                  ) : (
                    <div className="space-y-4">
                      {hintHistory.map((hint, idx) => (
                        <div key={idx} className="bg-muted/20 border border-border rounded-lg p-4">
                          <h4 className="text-sm font-bold text-primary mb-2">{hint.title}</h4>
                          <div className="text-sm text-foreground/90 bg-[#0D0D0D] p-3 rounded" data-color-mode="dark">
                            <MDEditor.Markdown 
                              source={hint.hint} 
                              style={{ backgroundColor: 'transparent', color: 'inherit' }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            </div>
            </Panel>
            </Group>
          </Panel>
        </Group>
      </div>

      <AiHintModal 
        isOpen={showHintModal} 
        onClose={() => setShowHintModal(false)}
        onSelectHint={handleSelectHint}
        loading={aiLoading}
        hintResponse={hintResponse}
        onReset={() => setHintResponse(null)}
      />

      <AiMentorDrawer
        isOpen={showMentorDrawer}
        onClose={() => setShowMentorDrawer(false)}
        problem={problem}
        language={language}
        sourceCode={code}
      />

      <ChatRoomDrawer
        isOpen={showChatDrawer}
        onClose={() => setShowChatDrawer(false)}
        problem={problem}
        initialTab={initialChatTab}
        code={code}
        language={language}
      />

      {/* Submission Result Modal */}
      <AnimatePresence>
        {showResultModal && submissionResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
                <h2 className={`text-xl font-bold ${submissionResult.status === 'Accepted' ? 'text-success' : 'text-destructive'}`}>
                  {submissionResult.status}
                </h2>
                <button 
                  onClick={() => setShowResultModal(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="bg-muted/50 rounded-lg p-3 px-4 border border-border text-center">
                    <span className="text-xs text-muted-foreground uppercase block mb-1">Test Cases Passed</span>
                    <span className="text-lg font-bold text-foreground">{submissionResult.passedCount} / {submissionResult.totalCount}</span>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 px-4 border border-border text-center">
                    <span className="text-xs text-muted-foreground uppercase block mb-1">Runtime</span>
                    <span className="text-lg font-bold text-foreground">{submissionResult.executionTime || 'N/A'}</span>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 px-4 border border-border text-center">
                    <span className="text-xs text-muted-foreground uppercase block mb-1">Memory</span>
                    <span className="text-lg font-bold text-foreground">{submissionResult.memory || 'N/A'}</span>
                  </div>
                </div>

                {submissionResult.status !== 'Accepted' && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
                    <h3 className="text-sm font-semibold text-destructive mb-3">Failed Test Case</h3>
                    
                    {submissionResult.error && (
                      <div className="mb-3">
                        <span className="text-xs text-muted-foreground block mb-1">Error:</span>
                        <pre className="bg-background border border-border p-2 rounded text-xs font-mono text-destructive overflow-x-auto whitespace-pre-wrap">{submissionResult.error}</pre>
                      </div>
                    )}
                    
                    {submissionResult.output && (
                      <div className="mb-3">
                        <span className="text-xs text-muted-foreground block mb-1">Output / Diff:</span>
                        <pre className="bg-background border border-border p-2 rounded text-xs font-mono text-foreground overflow-x-auto whitespace-pre-wrap">{submissionResult.output}</pre>
                      </div>
                    )}
                  </div>
                )}
                
              </div>
              <div className="p-4 border-t border-border bg-muted/10 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowResultModal(false)}>Try Again</Button>
                <Link to={`/submissions/${submissionResult._id}`}>
                  <Button variant="default">View Full Details</Button>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
