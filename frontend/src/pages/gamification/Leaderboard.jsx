import React, { useState, useEffect } from 'react';
import { gamificationApi } from '../../api/gamificationApi';
import { Trophy, Star, Medal, Loader2, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    gamificationApi.getLeaderboard()
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 text-primary mb-4">
          <Trophy className="h-10 w-10" />
        </div>
        <h1 className="text-4xl font-black mb-2 tracking-tight">Global Leaderboard</h1>
        <p className="text-muted-foreground text-lg">Ranked by total Experience Points (XP)</p>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 bg-muted/30 border-b border-border flex justify-between items-center text-sm font-bold text-muted-foreground uppercase tracking-wider">
          <div className="w-16 text-center">Rank</div>
          <div className="flex-1">Coder</div>
          <div className="w-24 text-center">Level</div>
          <div className="w-32 text-right pr-4">Total XP</div>
        </div>
        
        <div className="divide-y divide-border/50">
          <AnimatePresence>
            {users.map((user, idx) => (
              <motion.div 
                key={user._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex items-center p-4 hover:bg-muted/50 transition-colors ${idx < 3 ? 'bg-primary/5' : ''}`}
              >
                <div className="w-16 text-center font-black text-xl">
                  {idx === 0 ? <Medal className="h-8 w-8 text-yellow-500 mx-auto" /> : 
                   idx === 1 ? <Medal className="h-8 w-8 text-slate-300 mx-auto" /> : 
                   idx === 2 ? <Medal className="h-8 w-8 text-amber-600 mx-auto" /> : 
                   <span className="text-muted-foreground">#{idx + 1}</span>}
                </div>
                
                <div className="flex-1 flex items-center gap-4">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.username} className="h-12 w-12 rounded-full border-2 border-primary/20 object-cover" />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                      <UserIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-lg">{user.username}</h3>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> {user.problemsSolved} Solved</span>
                      <span className="flex items-center gap-1"><Flame className="h-3 w-3 text-orange-500" /> {user.streak} Streak</span>
                    </div>
                  </div>
                </div>
                
                <div className="w-24 text-center">
                  <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-primary/20 text-primary font-bold border border-primary/30">
                    {user.level}
                  </div>
                </div>
                
                <div className="w-32 text-right pr-4 font-black text-xl text-emerald-400">
                  {user.xp.toLocaleString()} <span className="text-sm font-bold text-muted-foreground">XP</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Missing icons for the component
import { Flame, CheckCircle } from 'lucide-react';
