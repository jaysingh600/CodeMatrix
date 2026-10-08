import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiClient as api } from "@/api/config"
import toast from "react-hot-toast"

export default function JoinContest() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [contestCode, setContestCode] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (contestCode.length !== 6) {
      toast.error("Contest code must be 6 digits")
      return
    }

    setLoading(true)
    try {
      const response = await api.post("/api/contests/join-private", { contestCode })
      toast.success("Successfully joined the contest!")
      navigate(`/contests/${response.data.contestId}/lobby`)
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid contest code")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-md mt-10">
      <div className="bg-card border border-border rounded-xl p-8 text-center shadow-lg">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Join Contest</h1>
        <p className="text-muted-foreground mb-8">Enter the 6-digit code shared by your friend.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              required
              maxLength={6}
              className="w-full text-center text-4xl tracking-[0.5em] font-mono bg-background border border-border rounded-lg px-4 py-6 text-white focus:outline-none focus:ring-2 focus:ring-primary"
              value={contestCode}
              onChange={(e) => setContestCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
            />
          </div>

          <Button type="submit" size="lg" className="w-full text-lg h-14" disabled={loading || contestCode.length !== 6}>
            {loading ? "Joining..." : "Join Contest"}
          </Button>
        </form>
      </div>
    </div>
  )
}
