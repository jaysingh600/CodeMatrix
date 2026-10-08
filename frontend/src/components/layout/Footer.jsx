import { Link } from "react-router-dom"
import { Code2, Globe, Mail, MessageSquare } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-muted/20 text-muted-foreground py-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground font-bold">
              <Code2 className="h-4 w-4" />
            </div>
            <span className="font-bold text-foreground">CodeMatrix</span>
          </Link>
          <p className="text-sm">Think Better. Code Smarter. Learn Together.</p>
          <div className="flex gap-4">
            <Link to="#" className="hover:text-foreground transition-colors"><Globe className="h-5 w-5" /></Link>
            <Link to="#" className="hover:text-foreground transition-colors"><MessageSquare className="h-5 w-5" /></Link>
            <Link to="#" className="hover:text-foreground transition-colors"><Mail className="h-5 w-5" /></Link>
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-foreground mb-4">Platform</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/problems" className="hover:text-primary transition-colors">Problems</Link></li>
            <li><Link to="/contests" className="hover:text-primary transition-colors">Contests</Link></li>
            <li><Link to="/leaderboard" className="hover:text-primary transition-colors">Leaderboard</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-foreground mb-4">Features</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/visualizer" className="hover:text-primary transition-colors">Algorithm Visualizer</Link></li>
            <li><Link to="/notes" className="hover:text-primary transition-colors">Notes Workspace</Link></li>
            <li><Link to="/dashboard/analytics" className="hover:text-primary transition-colors">User Analytics</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-foreground mb-4">Account</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/profile" className="hover:text-primary transition-colors">Profile</Link></li>
            <li><Link to="/login" className="hover:text-primary transition-colors">Sign In</Link></li>
            <li><Link to="/register" className="hover:text-primary transition-colors">Register</Link></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-8 pt-8 border-t border-border text-center text-sm">
        <p>&copy; {new Date().getFullYear()} CodeMatrix. All rights reserved.</p>
      </div>
    </footer>
  )
}
