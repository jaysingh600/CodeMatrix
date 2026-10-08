import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Calendar, Trophy, Users, ChevronRight } from "lucide-react"
import { apiClient as api } from "@/api/config"
import { Badge } from "@/components/ui/badge"

export default function ContestHistory() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get("/api/contests/user/history")
        setHistory(res.data)
      } catch (error) {
        console.error("Failed to load history")
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

  if (loading) return <div className="text-center p-12">Loading history...</div>

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <Link to="/contests/dashboard" className="text-muted-foreground hover:text-white flex items-center gap-2 w-fit mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-white">Your Contest History</h1>
        <p className="text-muted-foreground mt-2">Track your past performances and rankings.</p>
      </div>

      {history.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center shadow-sm">
          <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-semibold text-white mb-2">No Contests Yet</h2>
          <p className="text-muted-foreground mb-6">You haven't participated in any private contests yet.</p>
          <Link to="/contests/dashboard">
            <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-md font-medium transition-colors">
              Get Started
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((h, i) => (
            <Link 
              key={i} 
              to={`/contests/${h.contest._id}/result`}
              className="block bg-card border border-border hover:border-primary/50 rounded-xl p-6 transition-all hover:shadow-md group"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-semibold text-white truncate">{h.contest.title}</h2>
                    <Badge variant={h.contest.status === 'Finished' ? 'secondary' : 'default'} className="text-xs">
                      {h.contest.status}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(h.contest.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {h.totalParticipants} Participants</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-8 bg-muted/20 p-3 rounded-lg border border-border/50">
                  <div className="text-center min-w-16">
                    <p className="text-xs text-muted-foreground uppercase mb-1">Rank</p>
                    <p className="text-xl font-bold text-white">#{h.rank}</p>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="text-center min-w-16">
                    <p className="text-xs text-muted-foreground uppercase mb-1">Score</p>
                    <p className="text-xl font-bold text-white font-mono">{h.score}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors ml-2" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
