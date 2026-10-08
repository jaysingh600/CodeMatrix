import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import Editor from "@monaco-editor/react"
import { Play, Check, ChevronLeft, ChevronRight, Loader2, Trophy, Clock, Code2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Panel, Group, Separator } from "react-resizable-panels"
import { apiClient as api } from "@/api/config"
import { useGamification } from "@/context/GamificationContext"
import toast from "react-hot-toast"
import ContestTimer from "@/components/contest/ContestTimer"
import LiveLeaderboard from "@/components/contest/LiveLeaderboard"
import { AnimatePresence, motion } from "framer-motion"

const LANGUAGES = [
  { name: 'Java', value: 'java', field: 'starterCodeJava' },
  { name: 'Python 3', value: 'python', field: 'starterCodePython' },
  { name: 'C++', value: 'c++', field: 'starterCodeCpp' },
  { name: 'JavaScript', value: 'javascript', field: 'starterCodeJavaScript' },
];

export default function ContestArena() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [contest, setContest] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const [activeTab, setActiveTab] = useState("problems") // problems, leaderboard
  const [activeBottomTab, setActiveBottomTab] = useState("output")
  
  const [problems, setProblems] = useState([])
  const [activeProblem, setActiveProblem] = useState(null)
  
  // Editor State
  const [language, setLanguage] = useState(LANGUAGES[0].value)
  const [code, setCode] = useState("")
  const [running, setRunning] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [runResult, setRunResult] = useState(null)
  
  // Custom Input
  const [customInput, setCustomInput] = useState("")
  
  const { socket } = useGamification() || {}

  useEffect(() => {
    fetchContestData()

    if (socket) {
      socket.emit("join-room", `contest_${id}`)
      socket.on("contest-ended", () => {
        toast.success("Contest has ended!")
        navigate(`/contests/${id}/result`)
      })
    }

    return () => {
      if (socket) {
        socket.emit("leave-room", `contest_${id}`)
        socket.off("contest-ended")
      }
    }
  }, [id])

  const fetchContestData = async () => {
    try {
      const res = await api.get(`/api/contests/${id}`)
      setContest(res.data)
      setProblems(res.data.problems)
      if (res.data.problems.length > 0) {
        selectProblem(res.data.problems[0].problemId)
      }
    } catch (error) {
      toast.error("Failed to load contest")
    } finally {
      setLoading(false)
    }
  }

  const selectProblem = (problemDetails) => {
    setActiveProblem(problemDetails)
    
    // Load saved code for this problem and language
    const savedCode = localStorage.getItem(`contest_${id}_prob_${problemDetails._id}_${language}`)
    if (savedCode) {
      setCode(savedCode)
    } else {
      const langObj = LANGUAGES.find(l => l.value === language)
      setCode(problemDetails[langObj?.field] || "")
    }
    
    setCustomInput(problemDetails.inputFormat || "")
  }

  const handleLanguageChange = (e) => {
    const newLang = e.target.value
    setLanguage(newLang)
    
    if (activeProblem) {
      const savedCode = localStorage.getItem(`contest_${id}_prob_${activeProblem._id}_${newLang}`)
      if (savedCode) {
        setCode(savedCode)
      } else {
        const langObj = LANGUAGES.find(l => l.value === newLang)
        setCode(activeProblem[langObj?.field] || "")
      }
    }
  }

  const handleCodeChange = (value) => {
    const newCode = value || ""
    setCode(newCode)
    if (activeProblem) {
      localStorage.setItem(`contest_${id}_prob_${activeProblem._id}_${language}`, newCode)
    }
  }

  const handleRun = async () => {
    if (!code.trim() || !activeProblem) return
    setRunning(true)
    setActiveBottomTab("output")
    setRunResult(null)
    try {
      // Assuming a /api/submissions/run endpoint exists
      const result = await api.post('/api/submissions/run', {
        problemId: activeProblem._id,
        language,
        sourceCode: code,
        customInput
      })
      setRunResult(result.data)
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Error running code';
      setRunResult({ status: 'Error', stderr: errorMsg })
    } finally {
      setRunning(false)
    }
  }

  const handleSubmit = async () => {
    if (!code.trim() || !activeProblem) return
    setSubmitting(true)
    setActiveBottomTab("output")
    try {
      const result = await api.post('/api/submissions/submit', {
        problemId: activeProblem._id,
        language,
        sourceCode: code,
        contestId: id
      })
      setRunResult(result.data)
      toast.success(result.data.status === 'Accepted' ? 'Accepted!' : 'Submitted')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error submitting code')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="flex h-screen items-center justify-center bg-[#0A0A0A]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  if (!contest) return <div className="flex h-screen items-center justify-center bg-[#0A0A0A] text-white">Contest not found</div>

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-[#0A0A0A]">
      {/* Top Bar */}
      <div className="flex h-14 items-center justify-between px-4 bg-card border-b border-border">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/contests/${id}/lobby`}><ChevronLeft className="h-4 w-4" /></Link>
          </Button>
          <span className="font-bold text-lg text-white">{contest.title}</span>
        </div>
        
        <div className="flex items-center gap-6">
          <ContestTimer endTime={contest.endTime} onEnd={() => navigate(`/contests/${id}/result`)} />
          
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" className="gap-1.5 bg-muted hover:bg-muted/80" onClick={handleRun} disabled={running}>
              {running ? <Loader2 className="h-4 w-4 animate-spin text-success" /> : <Play className="h-4 w-4 text-success" />} 
              Run Code
            </Button>
            <Button variant="default" size="sm" className="gap-1.5 text-success-foreground bg-success hover:bg-success/90" onClick={handleSubmit} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Submit
            </Button>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden p-2">
        <Group orientation="horizontal">
          
          {/* Left Panel - Questions & Leaderboard */}
          <Panel defaultSize={20} minSize={15}>
            <div className="h-full flex flex-col border border-border bg-card rounded-lg overflow-hidden shadow-sm">
              <div className="flex h-10 items-center bg-muted/30 border-b border-border px-2 shrink-0">
                <button 
                  className={`px-3 py-1 text-sm font-medium rounded-md flex items-center gap-1.5 ${activeTab === 'problems' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={() => setActiveTab('problems')}
                >
                  <Code2 className="w-4 h-4" /> Problems
                </button>
                <button 
                  className={`px-3 py-1 text-sm font-medium rounded-md flex items-center gap-1.5 ${activeTab === 'leaderboard' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={() => setActiveTab('leaderboard')}
                >
                  <Trophy className="w-4 h-4" /> Leaderboard
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                {activeTab === 'problems' && (
                  <div className="space-y-2">
                    {problems.map((p, idx) => (
                      <div 
                        key={p.problemId._id}
                        onClick={() => selectProblem(p.problemId)}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${activeProblem?._id === p.problemId._id ? 'bg-primary/10 border-primary text-white' : 'bg-muted/30 border-border hover:border-primary/50 text-muted-foreground'}`}
                      >
                        <div className="font-medium text-sm mb-1">{idx + 1}. {p.problemId.title}</div>
                        <div className="flex justify-between items-center text-xs">
                          <span className={`${
                            p.problemId.difficulty === 'Easy' ? 'text-success' : 
                            p.problemId.difficulty === 'Medium' ? 'text-primary' : 'text-destructive'
                          }`}>{p.problemId.difficulty}</span>
                          <span>{p.points} Pts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {activeTab === 'leaderboard' && (
                  <LiveLeaderboard contestId={id} />
                )}
              </div>
            </div>
          </Panel>

          <Separator className="w-2 mx-1 flex-shrink-0 flex items-center justify-center group outline-none">
            <div className="h-12 w-1 rounded-full bg-border group-hover:bg-primary transition-colors"></div>
          </Separator>

          {/* Middle Panel - Description */}
          <Panel defaultSize={35} minSize={20}>
            <div className="h-full flex flex-col border border-border bg-card rounded-lg overflow-hidden shadow-sm">
              <div className="flex h-10 items-center bg-muted/30 border-b border-border px-4 shrink-0 font-medium">
                Problem Description
              </div>
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {activeProblem ? (
                  <div>
                    <h1 className="text-2xl font-bold mb-4">{activeProblem.title}</h1>
                    <div className="prose prose-invert max-w-none text-sm text-foreground/90 whitespace-pre-wrap">
                      {activeProblem.description}
                      
                      <p className="font-bold mt-6 mb-2">Input Format:</p>
                      <p>{activeProblem.inputFormat}</p>
                      
                      <p className="font-bold mt-4 mb-2">Output Format:</p>
                      <p>{activeProblem.outputFormat}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground text-center mt-10">Select a problem to view</div>
                )}
              </div>
            </div>
          </Panel>

          <Separator className="w-2 mx-1 flex-shrink-0 flex items-center justify-center group outline-none">
            <div className="h-12 w-1 rounded-full bg-border group-hover:bg-primary transition-colors"></div>
          </Separator>

          {/* Right Panel - Editor */}
          <Panel defaultSize={45} minSize={30}>
            <Group orientation="vertical">
              <Panel defaultSize={70} minSize={20}>
                <div className="h-full bg-card border border-border rounded-lg overflow-hidden flex flex-col shadow-sm">
                  <div className="flex h-10 items-center justify-between bg-muted/30 border-b border-border px-3 shrink-0">
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
                      }}
                    />
                  </div>
                </div>
              </Panel>

              <Separator className="h-2 my-1 flex-shrink-0 flex items-center justify-center group outline-none">
                <div className="w-12 h-1 rounded-full bg-border group-hover:bg-primary transition-colors"></div>
              </Separator>

              <Panel defaultSize={30} minSize={10}>
                <div className="h-full bg-card border border-border rounded-lg overflow-hidden flex flex-col shadow-sm">
                  <div className="flex h-10 items-center gap-4 bg-muted/30 border-b border-border px-4 shrink-0">
                    <button 
                      className={`text-sm font-medium h-full px-1 ${activeBottomTab === 'input' ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
                      onClick={() => setActiveBottomTab('input')}
                    >
                      Custom Input
                    </button>
                    <button 
                      className={`text-sm font-medium h-full px-1 ${activeBottomTab === 'output' ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
                      onClick={() => setActiveBottomTab('output')}
                    >
                      Output
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 custom-scrollbar text-sm font-mono">
                    {activeBottomTab === 'input' && (
                      <textarea 
                        className="w-full h-full bg-muted border border-border rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        placeholder="Enter custom input..."
                      />
                    )}
                    
                    {activeBottomTab === 'output' && (
                      <div>
                        {running || submitting ? (
                          <div className="flex items-center text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin mr-2"/> Processing...</div>
                        ) : runResult ? (
                          <div className="space-y-4">
                            <span className={`font-semibold ${runResult.status === 'Accepted' ? 'text-success' : 'text-destructive'}`}>
                              {runResult.status}
                            </span>
                            {runResult.compileOutput && (
                              <div><span className="text-xs text-muted-foreground block">Compile Output:</span><pre className="bg-muted p-2 rounded text-destructive">{runResult.compileOutput}</pre></div>
                            )}
                            {runResult.stdout && (
                              <div><span className="text-xs text-muted-foreground block">Stdout:</span><pre className="bg-muted p-2 rounded">{runResult.stdout}</pre></div>
                            )}
                            {runResult.stderr && (
                              <div><span className="text-xs text-muted-foreground block">Stderr:</span><pre className="bg-muted p-2 rounded text-destructive">{runResult.stderr}</pre></div>
                            )}
                          </div>
                        ) : (
                          <div className="text-muted-foreground">Run or submit your code to see results.</div>
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
    </div>
  )
}
