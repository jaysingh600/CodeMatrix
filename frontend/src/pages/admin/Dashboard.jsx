import { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  Activity, 
  CheckCircle2, 
  Brain, 
  MessageSquare,
  Radio,
  Trophy,
  Loader2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { adminApi } from '@/api/adminApi';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

const COLORS = ['#22c55e', '#eab308', '#ef4444'];

function AnimatedCounter({ value }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString());

  useEffect(() => {
    const controls = animate(count, value || 0, { duration: 1.5, ease: "easeOut" });
    return controls.stop;
  }, [count, value]);

  return <motion.span>{rounded}</motion.span>;
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await adminApi.getDashboardStats();
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/15 text-destructive p-4 rounded-md">
        {error}
      </div>
    );
  }

  const stats = [
    { title: 'Total Users', value: data?.stats.totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Active Users', value: data?.stats.activeUsers, icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { title: 'Total Questions', value: data?.stats.totalQuestions, icon: FileText, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { title: 'Total Submissions', value: data?.stats.totalSubmissions, icon: Radio, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { title: 'Accepted Submissions', value: data?.stats.acceptedSubmissions, icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
    { title: 'AI Hint Requests', value: data?.stats.aiHintsToday, icon: Brain, color: 'text-pink-500', bg: 'bg-pink-500/10' },
    { title: 'Live Chat Rooms', value: data?.stats.liveChatRooms, icon: MessageSquare, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { title: 'Running Contests', value: data?.stats.runningContests, icon: Trophy, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground mt-1">Platform analytics and key performance indicators.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card border border-border p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                <h3 className="text-3xl font-bold">
                  <AnimatedCounter value={stat.value} />
                </h3>
              </div>
              <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Registration Trend */}
        <div className="lg:col-span-2 bg-card border border-border p-6 rounded-xl shadow-sm">
          <h3 className="font-semibold mb-6">User Registrations (Last 7 Days)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.charts.registrations || []}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2D333B" />
                <XAxis dataKey="name" stroke="#8b949e" tick={{fill: '#8b949e'}} />
                <YAxis stroke="#8b949e" tick={{fill: '#8b949e'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#161B22', borderColor: '#2D333B', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Difficulty Distribution */}
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex flex-col">
          <h3 className="font-semibold mb-6">Questions by Difficulty</h3>
          <div className="h-[300px] w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.charts.difficultyDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(data?.charts.difficultyDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#161B22', borderColor: '#2D333B', color: '#fff', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
