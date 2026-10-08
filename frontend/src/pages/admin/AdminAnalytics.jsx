import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../../api/analyticsApi';
import { Users, Code, CheckCircle, Trophy, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.getAdminAnalytics()
      .then(res => setData(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!data) return <div className="p-8 text-center text-destructive">Failed to load analytics</div>;

  const StatCard = ({ title, value, icon, trend }) => (
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
        {trend && <p className="text-sm text-emerald-500 mt-1">{trend}</p>}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Platform Analytics</h1>
        <p className="text-muted-foreground">System-wide operational metrics and platform growth.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Users" 
          value={data.overview.totalUsers} 
          trend="+12% this month"
          icon={<Users className="h-16 w-16" />} 
        />
        <StatCard 
          title="Total Problems" 
          value={data.overview.totalProblems} 
          icon={<Code className="h-16 w-16" />} 
        />
        <StatCard 
          title="Submissions" 
          value={data.overview.totalSubmissions} 
          trend="High activity"
          icon={<CheckCircle className="h-16 w-16" />} 
        />
        <StatCard 
          title="Contests Hosted" 
          value={data.overview.totalContests} 
          icon={<Trophy className="h-16 w-16" />} 
        />
      </div>

      {/* Platform Growth Chart */}
      <div className="bg-card border border-border p-6 rounded-xl shadow-sm mb-8">
        <h3 className="text-lg font-bold mb-6">Platform Growth (Last 30 Days)</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.growth.submissions}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis 
                dataKey="_id" 
                stroke="#a1a1aa" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(val) => format(new Date(val), 'MMM d')}
              />
              <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                labelFormatter={(val) => format(new Date(val), 'MMM d, yyyy')}
              />
              <Line type="monotone" dataKey="count" name="Submissions" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Problem Analytics Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 bg-muted/30 border-b border-border">
            <h3 className="font-bold">Easiest Problems (Highest Acceptance)</h3>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground text-xs uppercase">
              <tr>
                <th className="px-4 py-2">Problem</th>
                <th className="px-4 py-2 text-center">Acceptance</th>
                <th className="px-4 py-2 text-center">Total Subs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.problemStats.easiest.map(p => (
                <tr key={p._id._id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{p._id.title}</td>
                  <td className="px-4 py-3 text-center text-emerald-500 font-bold">{p.acceptanceRate.toFixed(1)}%</td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{p.totalSubmissions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 bg-muted/30 border-b border-border">
            <h3 className="font-bold">Hardest Problems (Lowest Acceptance)</h3>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground text-xs uppercase">
              <tr>
                <th className="px-4 py-2">Problem</th>
                <th className="px-4 py-2 text-center">Acceptance</th>
                <th className="px-4 py-2 text-center">Total Subs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.problemStats.hardest.map(p => (
                <tr key={p._id._id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{p._id.title}</td>
                  <td className="px-4 py-3 text-center text-rose-500 font-bold">{p.acceptanceRate.toFixed(1)}%</td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{p.totalSubmissions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
