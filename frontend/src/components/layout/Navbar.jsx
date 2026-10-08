import React from "react"
import { Link } from "react-router-dom"
import { Search, SunMoon, User, Code2, LogOut, Bell, Check, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { useGamification } from "@/context/GamificationContext"
import { gamificationApi } from "@/api/gamificationApi"
import { useTheme } from "@/components/theme-provider"
import { formatDistanceToNow } from "date-fns"

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { socket } = useGamification() || {};
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = React.useState([]);
  const [showNotifs, setShowNotifs] = React.useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      gamificationApi.getNotifications().then(setNotifications).catch(console.error);
    }
  }, [isAuthenticated]);

  React.useEffect(() => {
    if (socket) {
      socket.on('notification', (newNotif) => {
        setNotifications(prev => [newNotif, ...prev]);
      });
    }
  }, [socket]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkRead = async (id) => {
    try {
      await gamificationApi.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (e) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await gamificationApi.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {}
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground font-bold">
              <Code2 className="h-5 w-5" />
            </div>
            <span className="hidden font-bold sm:inline-block text-lg">
              Code<span className="text-primary">Matrix</span>
            </span>
          </Link>
          <div className="hidden md:flex gap-4 text-sm font-medium">
            <Link to="/problems" className="transition-colors hover:text-primary text-foreground/80">Problems</Link>
            <Link to="/contests" className="transition-colors hover:text-primary text-foreground/80">Contests</Link>
            <Link to="/notes" className="transition-colors hover:text-primary text-foreground/80">Notes</Link>
            <Link to="/visualizer" className="transition-colors text-primary font-medium">Visualizer Lab</Link>
            <Link to="/leaderboard" className="transition-colors hover:text-primary text-foreground/80 flex items-center gap-1"><Trophy className="h-4 w-4 text-yellow-500" /> Leaderboard</Link>
            <Link to="/dashboard/analytics" className="transition-colors hover:text-primary text-foreground/80">Analytics</Link>
            {user?.role === 'ADMIN' && (
              <Link to="/admin" className="transition-colors text-warning hover:text-warning/80">Admin</Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Search className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <SunMoon className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 ml-2">
            {isAuthenticated && (
              <div className="relative">
                <Button variant="ghost" size="icon" className="text-muted-foreground relative" onClick={() => setShowNotifs(!showNotifs)}>
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive animate-pulse"></span>
                  )}
                </Button>
                
                {showNotifs && (
                  <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="p-3 border-b border-border flex justify-between items-center bg-muted/30">
                      <span className="font-bold text-sm">Notifications</span>
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead} className="text-xs text-primary hover:underline">Mark all read</button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
                      ) : (
                        notifications.map(n => (
                          <div key={n._id} onClick={() => handleMarkRead(n._id)} className={`p-3 border-b border-border/50 hover:bg-muted/50 cursor-pointer transition-colors ${!n.isRead ? 'bg-primary/5' : ''}`}>
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-bold text-sm truncate pr-2">{n.title}</span>
                              <span className="text-[10px] text-muted-foreground whitespace-nowrap">{formatDistanceToNow(new Date(n.createdAt))} ago</span>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="avatar" className="h-7 w-7 rounded-full object-cover" />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                  {user?.username}
                </Link>
                <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground" title="Logout">
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild className="hidden sm:inline-flex text-muted-foreground">
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button asChild className="hidden sm:inline-flex rounded-full bg-primary/10 text-primary hover:bg-primary/20">
                  <Link to="/register">Register</Link>
                </Button>
                <Button variant="ghost" size="icon" asChild className="sm:hidden">
                  <Link to="/login"><User className="h-4 w-4" /></Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
