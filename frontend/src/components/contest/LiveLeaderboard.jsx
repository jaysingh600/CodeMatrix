import { useState, useEffect } from "react"
import { apiClient as api } from "@/api/config"
import { useGamification } from "@/context/GamificationContext"
import { Trophy, Clock } from "lucide-react"

export default function LiveLeaderboard({ contestId }) {
  const [leaderboard, setLeaderboard] = useState([])
  const { socket } = useGamification() || {}

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get(`/api/contests/${contestId}/leaderboard`)
      setLeaderboard(res.data)
    } catch (error) {
      console.error("Failed to fetch leaderboard", error)
    }
  }

  useEffect(() => {
    fetchLeaderboard()

    if (socket) {
      // Re-join just in case
      socket.emit("join-room", `contest_${contestId}`)
      
      socket.on("leaderboardUpdate", () => {
        fetchLeaderboard() // Re-fetch the whole leaderboard to maintain order
      })
    }

    return () => {
      if (socket) {
        socket.off("leaderboardUpdate")
      }
    }
  }, [contestId])

  return (
    <div className="space-y-3">
      {leaderboard.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center p-4">No participants yet.</div>
      ) : (
        leaderboard.map((p, idx) => (
          <div key={p.userId._id} className="flex items-center gap-3 bg-muted/20 border border-border rounded-lg p-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-yellow-500 text-black' : idx === 1 ? 'bg-gray-300 text-black' : idx === 2 ? 'bg-amber-600 text-white' : 'bg-card text-muted-foreground'}`}>
              {idx + 1}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{p.userId.username}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Trophy className="w-3 h-3" /> {p.score}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {p.penalty}m</span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
