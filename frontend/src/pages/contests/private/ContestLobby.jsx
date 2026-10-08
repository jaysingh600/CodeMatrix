import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { apiClient as api } from "@/api/config"
import { useGamification } from "@/context/GamificationContext"
import toast from "react-hot-toast"
import { Copy, Check, Users, Clock, Play } from "lucide-react"

export default function ContestLobby() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { socket } = useGamification() || {}
  const [contest, setContest] = useState(null)
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchLobbyData()

    if (socket) {
      socket.emit("join-room", `contest_${id}`)
      
      socket.on("participant-joined", (data) => {
        toast.success(data.message)
        // Refresh participants
        fetchLobbyData()
      })

      socket.on("contest-started", () => {
        toast.success("Contest has started!")
        navigate(`/contests/${id}/arena`)
      })
    }

    return () => {
      if (socket) {
        socket.emit("leave-room", `contest_${id}`)
        socket.off("participant-joined")
        socket.off("contest-started")
      }
    }
  }, [id])

  const fetchLobbyData = async () => {
    try {
      const [contestRes, participantsRes] = await Promise.all([
        api.get(`/api/contests/${id}`),
        api.get(`/api/contests/${id}/leaderboard`) // Reusing leaderboard api for participants list
      ])
      
      setContest(contestRes.data)
      setParticipants(participantsRes.data)
      
      if (contestRes.data.status === 'Active' || contestRes.data.status === 'Running') {
        navigate(`/contests/${id}/arena`)
      }
    } catch (error) {
      toast.error("Failed to load contest data")
    } finally {
      setLoading(false)
    }
  }

  const handleStartContest = async () => {
    try {
      await api.post(`/api/contests/${id}/start`)
      // Socket will handle redirect
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to start contest")
    }
  }

  const copyCode = () => {
    navigator.clipboard.writeText(contest?.contestCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return <div className="text-center p-12">Loading lobby...</div>
  if (!contest) return <div className="text-center p-12">Contest not found</div>

  const isHost = contest.createdBy === user._id || contest.createdBy._id === user._id

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="bg-card border border-border rounded-xl p-8 mb-8 shadow-md text-center">
        <h1 className="text-4xl font-bold text-white mb-4">{contest.title}</h1>
        <p className="text-muted-foreground mb-6">{contest.description || "A private coding battle"}</p>
        
        <div className="flex justify-center items-center gap-8 mb-8">
          <div className="flex flex-col items-center">
            <Clock className="w-8 h-8 text-primary mb-2" />
            <span className="text-lg font-medium">{contest.duration} Mins</span>
          </div>
          <div className="flex flex-col items-center">
            <Users className="w-8 h-8 text-secondary mb-2" />
            <span className="text-lg font-medium">{participants.length} Joined</span>
          </div>
        </div>

        <div className="bg-background border border-border rounded-lg p-6 max-w-md mx-auto relative group">
          <p className="text-sm text-muted-foreground mb-2">Contest Code</p>
          <div className="text-5xl font-mono tracking-[0.2em] font-bold text-white flex justify-center items-center">
            {contest.contestCode}
            <button 
              onClick={copyCode}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              {copied ? <Check className="w-6 h-6 text-green-500" /> : <Copy className="w-6 h-6 text-gray-400" />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-white">Participants</h2>
        {isHost ? (
          <Button onClick={handleStartContest} className="gap-2 bg-green-600 hover:bg-green-700">
            <Play className="w-4 h-4" /> Start Contest
          </Button>
        ) : (
          <div className="px-4 py-2 bg-yellow-500/20 text-yellow-500 rounded-md font-medium flex items-center gap-2">
            Waiting for host to start...
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {participants.map((p) => (
          <div key={p.userId._id} className="bg-card border border-border rounded-lg p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
              {p.userId.avatar ? (
                <img src={p.userId.avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-primary">{p.userId.username[0].toUpperCase()}</span>
              )}
            </div>
            <div>
              <p className="font-medium text-white">{p.userId.username}</p>
              {p.userId._id === (contest.createdBy._id || contest.createdBy) && (
                <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full">Host</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
