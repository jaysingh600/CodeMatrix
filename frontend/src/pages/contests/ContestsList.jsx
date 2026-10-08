import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Clock, Users, Calendar } from 'lucide-react';
import { contestApi } from '../../api/contestApi';
import { format, formatDistanceToNow } from 'date-fns';

export default function ContestsList() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    contestApi.getContests()
      .then(data => setContests(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading contests...</div>;

  const upcoming = contests.filter(c => c.status === 'Upcoming');
  const running = contests.filter(c => c.status === 'Running');
  const past = contests.filter(c => c.status === 'Ended');

  const ContestCard = ({ contest }) => (
    <div className="bg-card border border-border rounded-lg p-5 hover:border-primary/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-xl font-bold text-foreground">{contest.title}</h3>
          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
            contest.status === 'Running' ? 'bg-emerald-500/10 text-emerald-500 animate-pulse' :
            contest.status === 'Upcoming' ? 'bg-blue-500/10 text-blue-500' :
            'bg-muted text-muted-foreground'
          }`}>
            {contest.status}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {format(new Date(contest.startTime), 'MMM d, yyyy h:mm a')}</span>
          <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {contest.duration} mins</span>
          <span className="flex items-center gap-1.5"><Trophy className="h-4 w-4" /> {contest.problems?.length || 0} Problems</span>
        </div>
      </div>
      <Link 
        to={`/contests/${contest._id}`}
        className={`px-6 py-2 rounded-md font-medium transition-colors text-center ${
          contest.status === 'Running' ? 'bg-primary text-primary-foreground hover:bg-primary/90' :
          'bg-muted text-foreground hover:bg-muted/80'
        }`}
      >
        {contest.status === 'Running' ? 'Enter Contest' : contest.status === 'Upcoming' ? 'Register' : 'View Results'}
      </Link>
    </div>
  );

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl">
      <div className="flex items-center gap-3 mb-8">
        <Trophy className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">CodeMatrix Contests</h1>
      </div>

      {running.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
            Active Contests
          </h2>
          <div className="space-y-4">
            {running.map(c => <ContestCard key={c._id} contest={c} />)}
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-4">Upcoming Contests</h2>
          <div className="space-y-4">
            {upcoming.map(c => <ContestCard key={c._id} contest={c} />)}
          </div>
        </div>
      )}

      <div className="mb-10">
        <h2 className="text-xl font-bold mb-4 text-muted-foreground">Past Contests</h2>
        <div className="space-y-4 opacity-80">
          {past.map(c => <ContestCard key={c._id} contest={c} />)}
          {past.length === 0 && <p className="text-muted-foreground">No past contests.</p>}
        </div>
      </div>
    </div>
  );
}
