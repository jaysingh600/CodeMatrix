import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Trophy, Users, History, Plus } from "lucide-react"

export default function ContestDashboard() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Private Contests</h1>
          <p className="text-muted-foreground">Challenge your friends in private coding battles.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors">
          <div className="h-12 w-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
            <Plus className="text-primary w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Create Contest</h2>
          <p className="text-muted-foreground mb-6">Create a new private contest, select difficulty and share the 6-digit code with friends.</p>
          <Link to="/contests/create-private">
            <Button className="w-full">Create Now</Button>
          </Link>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors">
          <div className="h-12 w-12 bg-secondary/20 rounded-lg flex items-center justify-center mb-4">
            <Users className="text-secondary w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Join Contest</h2>
          <p className="text-muted-foreground mb-6">Have a 6-digit contest code? Join your friends and compete in real-time.</p>
          <Link to="/contests/join">
            <Button variant="secondary" className="w-full">Join with Code</Button>
          </Link>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors md:col-span-2">
          <div className="h-12 w-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4">
            <History className="text-accent w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Contest History</h2>
          <p className="text-muted-foreground mb-6">View your past contests, ranks, and solved problems.</p>
          <Link to="/contests/history">
            <Button variant="outline" className="w-full">View History</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
