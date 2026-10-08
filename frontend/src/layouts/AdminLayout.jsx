import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  LogOut, 
  Brain, 
  TerminalSquare, 
  MessageSquare,
  Trophy
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

export default function AdminLayout() {
  const location = useLocation();
  const { logout, user } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Questions', path: '/admin/questions', icon: FileText },
    { name: 'Test Cases', path: '/admin/testcases', icon: TerminalSquare },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Contests', path: '/admin/contests', icon: Trophy },
    { name: 'Analytics', path: '/admin/analytics', icon: MessageSquare },
    { name: 'AI Usage', path: '/admin/ai', icon: Brain },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="h-14 flex items-center px-6 border-b border-border">
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground font-bold text-xs">
              M
            </div>
            <span className="font-bold text-lg">Code<span className="text-primary">Matrix</span> Admin</span>
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                    isActive 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <item.icon className={`h-4 w-4 mr-3 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="p-4 border-t border-border">
          <Button variant="outline" className="w-full justify-start text-muted-foreground" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-14 border-b border-border bg-card/50 backdrop-blur flex items-center justify-between px-6 shrink-0">
          <div className="text-sm font-medium text-muted-foreground capitalize">
            {location.pathname.split('/').filter(Boolean).join(' / ')}
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 text-sm font-medium">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Admin" className="h-8 w-8 rounded-full border border-border object-cover" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                    A
                  </div>
                )}
                <span>Admin</span>
             </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto bg-background p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
