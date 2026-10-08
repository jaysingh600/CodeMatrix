import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Search, ChevronDown, CheckCircle2, Circle, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { problemsApi } from "@/api/problemsApi"
import { submissionApi } from "@/api/submissionApi"
import { useAuth } from "@/context/AuthContext"

export default function Problems() {
  const [searchTerm, setSearchTerm] = useState("")
  const [problems, setProblems] = useState([])
  const [loading, setLoading] = useState(true)
  const { isAuthenticated } = useAuth()
  const [solvedProblemIds, setSolvedProblemIds] = useState(new Set())
  const [difficultyFilter, setDifficultyFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true)
        const data = await problemsApi.getProblems()
        setProblems(data)
      } catch (error) {
        console.error("Error fetching problems:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchProblems()
  }, [])

  useEffect(() => {
    const fetchSolved = async () => {
      if (isAuthenticated) {
        try {
          const solvedIds = await submissionApi.getSolvedProblems()
          setSolvedProblemIds(new Set(solvedIds))
        } catch (error) {
          console.error("Error fetching solved problems:", error)
        }
      } else {
        setSolvedProblemIds(new Set())
      }
    }
    fetchSolved()
  }, [isAuthenticated])

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Problems</h1>
          <p className="text-sm text-muted-foreground">Practice coding problems to enhance your algorithm skills.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-input rounded-md leading-5 bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring sm:text-sm"
            placeholder="Search questions"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <div className="w-[130px]">
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Difficulties</SelectItem>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-[130px]">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="Solved">Solved</SelectItem>
                <SelectItem value="Unsolved">Unsolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <button className="inline-flex items-center justify-between w-[130px] px-3 py-2 border border-input bg-card rounded-md text-sm font-medium hover:bg-muted focus:outline-none focus:ring-1 focus:ring-ring">
            Tags
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-muted-foreground">
            <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
              <tr>
                <th scope="col" className="px-6 py-3 w-12">Status</th>
                <th scope="col" className="px-6 py-3">Title</th>
                <th scope="col" className="px-6 py-3 w-24">Acceptance</th>
                <th scope="col" className="px-6 py-3 w-32">Difficulty</th>
                <th scope="col" className="px-6 py-3 w-64">Tags</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Loading problems...</p>
                  </td>
                </tr>
              ) : problems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No problems found.
                  </td>
                </tr>
              ) : (
                problems
                  .filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()))
                  .filter(p => difficultyFilter === "" || p.difficulty.toLowerCase() === difficultyFilter.toLowerCase())
                  .filter(p => {
                    if (statusFilter === "") return true
                    if (statusFilter === "Solved") return solvedProblemIds.has(p._id)
                    if (statusFilter === "Unsolved") return !solvedProblemIds.has(p._id)
                    return true
                  })
                  .map((problem, i) => (
                    <tr 
                      key={problem._id} 
                      className={`border-b border-border hover:bg-muted/30 transition-colors ${i % 2 === 0 ? 'bg-background/40' : 'bg-transparent'}`}
                    >
                      <td className="px-6 py-4">
                        {solvedProblemIds.has(problem._id) ? (
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground/30" />
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-foreground">
                        <Link to={`/problems/${problem._id}`} className="hover:text-primary hover:underline transition-colors">
                          {problem.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4">{problem.acceptanceRate}</td>
                      <td className="px-6 py-4">
                        <span className={`
                          ${problem.difficulty === 'Easy' ? 'text-success' : ''}
                          ${problem.difficulty === 'Medium' ? 'text-primary' : ''}
                          ${problem.difficulty === 'Hard' ? 'text-destructive' : ''}
                        `}>
                          {problem.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {problem.topic && problem.topic.slice(0, 2).map(tag => (
                            <Badge key={tag} variant="secondary" className="text-[10px] font-normal px-1.5 py-0">
                              {tag}
                            </Badge>
                          ))}
                          {problem.topic && problem.topic.length > 2 && (
                            <Badge variant="secondary" className="text-[10px] font-normal px-1.5 py-0">
                              +{problem.topic.length - 2}
                            </Badge>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

