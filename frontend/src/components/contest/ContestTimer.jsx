import { useState, useEffect } from "react"
import { Clock } from "lucide-react"

export default function ContestTimer({ endTime, onEnd }) {
  const [timeLeft, setTimeLeft] = useState("")

  useEffect(() => {
    if (!endTime) return

    const calculateTimeLeft = () => {
      const diff = new Date(endTime) - new Date()
      if (diff <= 0) {
        setTimeLeft("00:00:00")
        if (onEnd) onEnd()
        return
      }

      const h = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const m = Math.floor((diff / 1000 / 60) % 60)
      const s = Math.floor((diff / 1000) % 60)

      const formatted = [
        h.toString().padStart(2, "0"),
        m.toString().padStart(2, "0"),
        s.toString().padStart(2, "0")
      ].join(":")

      setTimeLeft(formatted)
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [endTime])

  return (
    <div className="flex items-center gap-2 px-4 py-1.5 bg-card border border-border rounded-lg text-white font-mono font-medium">
      <Clock className="w-4 h-4 text-primary" />
      {timeLeft || "--:--:--"}
    </div>
  )
}
