import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiClient as api } from "@/api/config"
import toast from "react-hot-toast"

export default function CreateContest() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: 60,
    numQuestions: 3,
    difficulty: "Medium"
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await api.post("/api/contests/private", formData)
      toast.success("Contest created successfully!")
      navigate(`/contests/${response.data._id}/lobby`)
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create contest")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight text-white mb-6">Create Private Contest</h1>
      
      <div className="bg-card border border-border rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Contest Title</label>
            <input
              type="text"
              required
              className="w-full bg-background border border-border rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="e.g. Weekend Coding Battle"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description (Optional)</label>
            <textarea
              className="w-full bg-background border border-border rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="What is this contest about?"
              rows="3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Duration (Minutes)</label>
              <input
                type="number"
                required
                min="10"
                max="300"
                className="w-full bg-background border border-border rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Number of Questions</label>
              <input
                type="number"
                required
                min="1"
                max="10"
                className="w-full bg-background border border-border rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                value={formData.numQuestions}
                onChange={(e) => setFormData({...formData, numQuestions: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Overall Difficulty</label>
            <select
              className="w-full bg-background border border-border rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
              value={formData.difficulty}
              onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Contest"}
          </Button>
        </form>
      </div>
    </div>
  )
}
