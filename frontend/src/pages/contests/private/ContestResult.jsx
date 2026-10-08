import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Trophy, Clock, Users, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiClient as api } from "@/api/config"
import { useAuth } from "@/context/AuthContext"

export default function ContestResult() {
  const { id } = useParams()
  const { user } = useAuth()
  const [contest, setContest] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contestRes, leaderboardRes] = await Promise.all([
          api.get(`/api/contests/${id}`),
          api.get(`/api/contests/${id}/leaderboard`)
        ])
        setContest(contestRes.data)
        setLeaderboard(leaderboardRes.data)
      } catch (error) {
        console.error("Failed to fetch contest results")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  if (loading) return <div className="text-center p-12">Loading results...</div>
  if (!contest) return <div className="text-center p-12 text-destructive">Contest not found</div>

  const myRank = leaderboard.findIndex(p => p.userId._id === user._id) + 1
  const myData = leaderboard.find(p => p.userId._id === user._id)

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Link to="/contests/dashboard" className="text-muted-foreground hover:text-white flex items-center gap-2 w-fit mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-white">{contest.title} - Results</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card border border-border rounded-xl p-6 text-center shadow-lg">
          <Trophy className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
          <h2 className="text-lg text-muted-foreground mb-1">Your Rank</h2>
          <p className="text-4xl font-bold text-white">#{myRank || '-'}</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 text-center shadow-lg">
          <Clock className="w-10 h-10 text-primary mx-auto mb-3" />
          <h2 className="text-lg text-muted-foreground mb-1">Your Score</h2>
          <p className="text-4xl font-bold text-white">{myData ? myData.score : '-'}</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 text-center shadow-lg">
          <Users className="w-10 h-10 text-secondary mx-auto mb-3" />
          <h2 className="text-lg text-muted-foreground mb-1">Participants</h2>
          <p className="text-4xl font-bold text-white">{leaderboard.length}</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-lg">
        <div className="bg-muted/30 p-4 border-b border-border">
          <h2 className="text-xl font-semibold text-white">Final Leaderboard</h2>
        </div>
        <div className="p-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/20 text-muted-foreground text-xs uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Rank</th>
                <th className="px-6 py-4 font-medium">Participant</th>
                <th className="px-6 py-4 font-medium">Score</th>
                <th className="px-6 py-4 font-medium">Penalty (Mins)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {leaderboard.map((p, idx) => (
                <tr key={p.userId._id} className={p.userId._id === user._id ? 'bg-primary/10' : 'hover:bg-muted/10'}>
                  <td className="px-6 py-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${idx === 0 ? 'bg-yellow-500 text-black' : idx === 1 ? 'bg-gray-300 text-black' : idx === 2 ? 'bg-amber-600 text-white' : 'bg-transparent text-muted-foreground border border-border'}`}>
                      {idx + 1}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {p.userId.avatar ? (
                        <img src={p.userId.avatar} className="w-8 h-8 rounded-full object-cover" alt="avatar" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-secondary/20 text-secondary flex items-center justify-center font-bold">
                          {p.userId.username[0].toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium text-white">{p.userId.username}</span>
                      {p.userId._id === user._id && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full ml-2">You</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono font-medium text-white">{p.score}</td>
                  <td className="px-6 py-4 font-mono text-muted-foreground">{p.penalty}</td>
                </tr>
              ))}
              {leaderboard.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-muted-foreground">No participants found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
