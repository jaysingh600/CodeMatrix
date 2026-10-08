import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../../api/analyticsApi';
import { Loader2, CheckCircle2, Target, TrendingUp, Cpu } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { format, subDays } from 'date-fns';

const COLORS = ['#10b981', '#f59e0b', '#f43f5e'];

export default function UserAnalytics() {
  const [data, setData] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsApi.getUserAnalytics(),
      analyticsApi.getUserHeatmap()
    ])
    .then(([analyticsRes, heatmapRes]) => {
      setData(analyticsRes);
      setHeatmapData(heatmapRes);
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!data) return <div className="p-8 text-center text-destructive">Failed to load analytics</div>;

  const pieData = [
    { name: 'Easy', value: data.difficultyCount.Easy || 0 },
    { name: 'Medium', value: data.difficultyCount.Medium || 0 },
    { name: 'Hard', value: data.difficultyCount.Hard || 0 }
  ];

  const StatCard = ({ title, value, icon, subtitle }) => (
    <div className="bg-card border border-border p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110">
        {icon}
      </div>
      <div className="flex justify-between items-start mb-4 relative z-10">
        <h3 className="text-muted-foreground font-medium">{title}</h3>
        <div className="text-primary">{icon}</div>
      </div>
      <div className="relative z-10">
        <div className="text-3xl font-black">{value}</div>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Analytics</h1>
        <p className="text-muted-foreground">Track your learning journey and platform activity.</p>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Problems Solved" 
          value={data.totalSolved} 
          subtitle={`Out of ${data.totalAttempted} attempted`}
          icon={<CheckCircle2 className="h-16 w-16" />} 
        />
        <StatCard 
          title="Acceptance Rate" 
          value={`${data.acceptanceRate}%`} 
          subtitle="Average across all submissions"
          icon={<Target className="h-16 w-16" />} 
        />
        <StatCard 
          title="Current Streak" 
          value="3 Days" 
          subtitle="Keep it up!"
          icon={<TrendingUp className="h-16 w-16" />} 
        />
        <StatCard 
          title="AI Independence" 
          value="82%" 
          subtitle="Solved without hints"
          icon={<Cpu className="h-16 w-16" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Heatmap Section */}
        <div className="lg:col-span-2 bg-card border border-border p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-bold mb-6">Activity Heatmap</h3>
          <div className="text-sm">
            <CalendarHeatmap
              startDate={subDays(new Date(), 180)}
              endDate={new Date()}
              values={heatmapData}
              classForValue={(value) => {
                if (!value || value.count === 0) return 'fill-muted/20';
                if (value.count === 1) return 'fill-emerald-500/30';
                if (value.count <= 3) return 'fill-emerald-500/60';
                return 'fill-emerald-500';
              }}
              tooltipDataAttrs={value => {
                return {
                  'data-tooltip-id': 'heatmap-tooltip',
                  'data-tooltip-content': value.date ? `${value.count} submissions on ${value.date}` : 'No submissions'
                };
              }}
              showWeekdayLabels={true}
            />
            <ReactTooltip id="heatmap-tooltip" />
          </div>
        </div>

        {/* Difficulty Pie Chart */}
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex flex-col">
          <h3 className="text-lg font-bold mb-2">Difficulty Distribution</h3>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                  itemStyle={{ color: '#e4e4e7' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2 text-sm">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></span>
                <span className="text-muted-foreground">{d.name}: {d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Weekly Activity Line Chart */}
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-bold mb-6">Weekly Activity</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="dayName" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                />
                <Line type="monotone" dataKey="submissions" name="Total Submissions" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="accepted" name="Accepted" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Topic Mastery Bar Chart */}
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-bold mb-6">Topic Mastery</h3>
          {data.topicMastery.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No topics attempted yet.</div>
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topicMastery.slice(0, 7)} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={true} vertical={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} width={100} />
                  <Tooltip 
                    cursor={{ fill: '#27272a', opacity: 0.4 }}
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                  />
                  <Bar dataKey="solved" name="Solved" fill="#10b981" radius={[0, 4, 4, 0]} barSize={12} />
                  <Bar dataKey="attempted" name="Attempted" fill="#3f3f46" radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
