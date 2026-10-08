import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Trophy, Clock, Play, List, Users } from 'lucide-react';
import { contestApi } from '../../api/contestApi';
import io from 'socket.io-client';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function ContestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contest, setContest] = useState(null);
  const [userData, setUserData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeTab, setActiveTab] = useState('problems'); // problems, leaderboard
  const [loading, setLoading] = useState(true);

  // Timer state
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cData = await contestApi.getContestById(id);
        setContest(cData);
        
        try {
          const uData = await contestApi.getUserContestData(id);
          setUserData(uData);
        } catch (e) {
          // not logged in or joining failed
        }

        const lbData = await contestApi.getContestLeaderboard(id);
        setLeaderboard(lbData);
      } catch (error) {
        toast.error("Failed to load contest");
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Socket.IO for live leaderboard
    const socket = io('http://localhost:5000', { withCredentials: true });
    socket.emit('joinRoom', `contest_${id}`);

    socket.on('leaderboardUpdate', (participantData) => {
      setLeaderboard(prev => {
        const existingIdx = prev.findIndex(p => p._id === participantData._id);
        let newLb = [...prev];
        if (existingIdx >= 0) {
          newLb[existingIdx] = participantData;
        } else {
          newLb.push(participantData);
        }
        // Re-sort ICPC style: higher score, then lower penalty
        return newLb.sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return a.penalty - b.penalty;
        });
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

  useEffect(() => {
    if (!contest) return;
    
    const updateTimer = () => {
      const now = new Date();
      const start = new Date(contest.startTime);
      const end = new Date(contest.endTime);

      if (now < start) {
        const diff = start - now;
        setTimeLeft(`Starts in: ${formatTime(diff)}`);
      } else if (now >= start && now <= end) {
        const diff = end - now;
        setTimeLeft(`Time Left: ${formatTime(diff)}`);
      } else {
        setTimeLeft('Contest Ended');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [contest]);

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const handleJoin = async () => {
    try {
      const data = await contestApi.joinContest(id);
      setUserData(data);
      toast.success("Successfully joined the contest!");
    } catch (error) {
      toast.error("Failed to join contest");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!contest) return <div className="p-8 text-center text-destructive">Contest not found</div>;

  const isRunning = contest.status === 'Running';
  const hasJoined = userData && !userData.notJoined;

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl">
      {/* Header */}
      <div className="bg-card border border-border rounded-xl p-6 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{contest.title}</h1>
            <p className="text-muted-foreground mb-4">{contest.description}</p>
            <div className="flex items-center gap-4 text-sm font-medium">
              <span className={`px-3 py-1 rounded-full ${
                isRunning ? 'bg-emerald-500/10 text-emerald-500 animate-pulse' : 'bg-muted text-muted-foreground'
              }`}>
                {contest.status}
              </span>
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {contest.duration} mins</span>
              <span className="flex items-center gap-1.5 text-primary"><Trophy className="h-4 w-4" /> {timeLeft}</span>
            </div>
          </div>
          <div>
            {!hasJoined && isRunning && (
              <button 
                onClick={handleJoin}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-lg font-bold shadow-lg transition-transform active:scale-95"
              >
                Register & Join Now
              </button>
            )}
            {hasJoined && (
              <div className="bg-muted px-4 py-2 rounded-lg text-sm font-medium border border-border flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500"></div> Registered
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-6">
        <button 
          onClick={() => setActiveTab('problems')}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'problems' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          <List className="inline h-4 w-4 mr-2" /> Problems
        </button>
        <button 
          onClick={() => setActiveTab('leaderboard')}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'leaderboard' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          <Trophy className="inline h-4 w-4 mr-2" /> Live Leaderboard
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'problems' && (
        <div className="space-y-4">
          {!isRunning && contest.status === 'Upcoming' ? (
            <div className="text-center p-12 bg-card border border-border rounded-lg text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Problems will be revealed when the contest starts.</p>
            </div>
          ) : (
            contest.problems.map((p, idx) => (
              <div key={p.problemId._id} className="bg-card border border-border p-4 rounded-lg flex items-center justify-between hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-black text-muted-foreground/30 w-8 text-center">{String.fromCharCode(65 + idx)}</div>
                  <div>
                    <h3 className="font-bold text-lg">{p.problemId.title}</h3>
                    <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                      <span className={`${p.problemId.difficulty === 'Easy' ? 'text-emerald-400' : p.problemId.difficulty === 'Medium' ? 'text-amber-400' : 'text-rose-400'}`}>
                        {p.problemId.difficulty}
                      </span>
                      <span>{p.points} Points</span>
                    </div>
                  </div>
                </div>
                {hasJoined ? (
                  <Link to={`/contests/${contest._id}/problems/${p.problemId._id}`}>
                    <button className="bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded font-medium flex items-center gap-2 transition-colors">
                      <Play className="h-4 w-4" /> Solve
                    </button>
                  </Link>
                ) : (
                  <button onClick={handleJoin} className="bg-muted text-muted-foreground px-4 py-2 rounded font-medium opacity-50 cursor-not-allowed">
                    Join to solve
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
          <div className="p-4 bg-muted/30 border-b border-border flex justify-between items-center">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live ICPC Standings
            </h3>
            <span className="text-xs text-muted-foreground">Auto-updating via WebSockets</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground text-xs uppercase">
                <tr>
                  <th className="px-6 py-3 font-semibold">Rank</th>
                  <th className="px-6 py-3 font-semibold">Participant</th>
                  <th className="px-6 py-3 font-semibold text-center">Score</th>
                  <th className="px-6 py-3 font-semibold text-center">Penalty</th>
                  {contest.problems.map((p, i) => (
                    <th key={p.problemId._id} className="px-6 py-3 font-semibold text-center">
                      {String.fromCharCode(65 + i)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <AnimatePresence>
                  {leaderboard.length === 0 ? (
                    <tr>
                      <td colSpan={4 + contest.problems.length} className="px-6 py-8 text-center text-muted-foreground">
                        No participants have scored yet.
                      </td>
                    </tr>
                  ) : (
                    leaderboard.map((participant, index) => (
                      <motion.tr 
                        key={participant._id}
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={userData && userData._id === participant._id ? 'bg-primary/5' : 'hover:bg-muted/30'}
                      >
                        <td className="px-6 py-4 font-bold">{index + 1}</td>
                        <td className="px-6 py-4 font-medium flex items-center gap-2">
                          {participant.userId.username}
                          {userData && userData._id === participant._id && (
                            <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded">YOU</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-primary">{participant.score}</td>
                        <td className="px-6 py-4 text-center text-muted-foreground">{participant.penalty}</td>
                        
                        {/* Render problem specific stats */}
                        {contest.problems.map(p => {
                          const stats = participant.problemStats?.[p.problemId._id];
                          if (!stats) return <td key={p.problemId._id} className="px-6 py-4 text-center">-</td>;
                          
                          if (stats.isSolved) {
                            return (
                              <td key={p.problemId._id} className="px-6 py-4 text-center bg-emerald-500/10 text-emerald-500 font-bold">
                                {stats.solveTime}
                                {stats.failedAttempts > 0 && <span className="text-xs ml-1 opacity-70">(+{stats.failedAttempts})</span>}
                              </td>
                            );
                          } else if (stats.failedAttempts > 0) {
                            return (
                              <td key={p.problemId._id} className="px-6 py-4 text-center bg-rose-500/10 text-rose-500 font-bold">
                                -{stats.failedAttempts}
                              </td>
                            );
                          }
                          return <td key={p.problemId._id} className="px-6 py-4 text-center">-</td>;
                        })}
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
