import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { gamificationApi } from '@/api/gamificationApi';
import { Loader2, User, Briefcase, Award, Zap, Brain, CheckCircle, Star, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    username: user?.username || '',
    bio: user?.bio || '',
    github: user?.github || '',
    linkedin: user?.linkedin || '',
    portfolio: user?.portfolio || '',
    avatar: user?.avatar || '',
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [achievements, setAchievements] = useState([]);
  
  useEffect(() => {
    if (user) {
      gamificationApi.getMyAchievements().then(setAchievements).catch(console.error);
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await updateProfile(formData);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl flex-1">
      <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your account settings and view your coding statistics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Stats & Avatar */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col items-center text-center">
            <div className="h-32 w-32 rounded-full bg-muted/50 border-4 border-background flex items-center justify-center overflow-hidden shadow-lg mb-4">
              {user.avatar ? (
                <img src={user.avatar} alt={user.username} className="h-full w-full object-cover" />
              ) : (
                <User className="h-16 w-16 text-muted-foreground" />
              )}
            </div>
            <h2 className="text-xl font-bold">{user.fullName}</h2>
            <p className="text-muted-foreground font-medium">@{user.username}</p>
            <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
              {user.role}
            </div>
            
            {/* Level & XP Progress */}
            <div className="w-full mt-6">
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-primary flex items-center gap-1"><Star className="h-3 w-3" /> Level {user.level || 1}</span>
                <span className="text-muted-foreground">{user.xp || 0} XP</span>
              </div>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden border border-border/50">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-primary transition-all duration-1000 ease-out" 
                  style={{ width: `${Math.min(100, (((user.xp || 0) % 100) / 100) * 100)}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 text-right">{100 - ((user.xp || 0) % 100)} XP to Next Level</p>
            </div>

            {user.bio && <p className="mt-4 text-sm text-foreground/90 italic">"{user.bio}"</p>}
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Coding Statistics</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-border/50">
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 mr-2 text-success" /> Problems Solved
                </div>
                <span className="font-bold">{user.problemsSolved}</span>
              </div>
              
              <div className="flex justify-between items-center pb-3 border-b border-border/50">
                <div className="flex items-center text-sm">
                  <Zap className="h-4 w-4 mr-2 text-warning" /> Current Streak
                </div>
                <span className="font-bold">{user.streak} <span className="text-xs text-muted-foreground font-normal">days</span></span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-border/50">
                <div className="flex items-center text-sm">
                  <Brain className="h-4 w-4 mr-2 text-primary" /> AI Hints Used
                </div>
                <span className="font-bold">{user.aiHintsUsed}</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center text-sm">
                  <Award className="h-4 w-4 mr-2 text-secondary" /> Thinking Score
                </div>
                <span className="font-bold">{user.thinkingScore}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Profile Form */}
        <div className="md:col-span-2">
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/20 flex justify-between items-center">
              <h3 className="font-semibold">Personal Information</h3>
              <Button 
                variant={isEditing ? "ghost" : "outline"} 
                size="sm"
                onClick={() => {
                  setIsEditing(!isEditing);
                  setError('');
                  setSuccess('');
                  if(isEditing) {
                    // reset form
                    setFormData({
                      fullName: user?.fullName || '',
                      username: user?.username || '',
                      bio: user?.bio || '',
                      github: user?.github || '',
                      linkedin: user?.linkedin || '',
                      portfolio: user?.portfolio || '',
                      avatar: user?.avatar || '',
                    });
                  }
                }}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>
            
            <div className="p-6">
              {error && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-6 border border-destructive/20">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-success/15 text-success text-sm p-3 rounded-md mb-6 border border-success/20">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-foreground/80">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      disabled={!isEditing}
                      className="w-full bg-background border border-input rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                      value={formData.fullName}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-foreground/80">Username</label>
                    <input
                      type="text"
                      name="username"
                      disabled={!isEditing}
                      className="w-full bg-background border border-input rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                      value={formData.username}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-1.5 text-foreground/80">Email</label>
                  <input
                    type="email"
                    disabled
                    className="w-full bg-muted border border-input rounded-md px-4 py-2 text-sm opacity-60 cursor-not-allowed"
                    value={user.email}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Email cannot be changed.</p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-1.5 text-foreground/80">Bio</label>
                  <textarea
                    name="bio"
                    disabled={!isEditing}
                    rows="3"
                    className="w-full bg-background border border-input rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 resize-none"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us about yourself..."
                  ></textarea>
                </div>

                <div className="mb-8 space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Social Links</h4>
                  
                  <div className="flex items-center">
                    <div className="bg-muted border border-r-0 border-input px-3 py-2 rounded-l-md text-muted-foreground flex items-center justify-center">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="github"
                      disabled={!isEditing}
                      className="flex-1 bg-background border border-input rounded-r-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                      value={formData.github}
                      onChange={handleChange}
                      placeholder="github.com/username"
                    />
                  </div>

                  <div className="flex items-center">
                    <div className="bg-muted border border-r-0 border-input px-3 py-2 rounded-l-md text-muted-foreground flex items-center justify-center">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="linkedin"
                      disabled={!isEditing}
                      className="flex-1 bg-background border border-input rounded-r-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                      value={formData.linkedin}
                      onChange={handleChange}
                      placeholder="linkedin.com/in/username"
                    />
                  </div>

                  <div className="flex items-center">
                    <div className="bg-muted border border-r-0 border-input px-3 py-2 rounded-l-md text-muted-foreground">
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      name="portfolio"
                      disabled={!isEditing}
                      className="flex-1 bg-background border border-input rounded-r-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                      value={formData.portfolio}
                      onChange={handleChange}
                      placeholder="yourwebsite.com"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <div className="bg-muted border border-r-0 border-input px-3 py-2 rounded-l-md text-muted-foreground">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      name="avatar"
                      disabled={!isEditing}
                      className="flex-1 bg-background border border-input rounded-r-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                      value={formData.avatar}
                      onChange={handleChange}
                      placeholder="Avatar Image URL"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end pt-4 border-t border-border">
                    <Button type="submit" disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Save Changes
                    </Button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="h-6 w-6 text-yellow-500" />
          <h2 className="text-2xl font-bold">Achievements Hub</h2>
        </div>
        
        {achievements.length === 0 ? (
          <div className="bg-card border border-border p-8 rounded-xl text-center text-muted-foreground shadow-sm">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>You haven't unlocked any achievements yet. Start solving problems to earn some!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {achievements.map((ach) => (
              <div key={ach._id} className="bg-card border border-border p-4 rounded-xl shadow-sm hover:shadow-md hover:border-primary/50 transition-all flex flex-col items-center text-center group">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{ach.icon}</div>
                <h3 className="font-bold text-sm mb-1">{ach.title}</h3>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{ach.description}</p>
                <div className="mt-auto flex gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                    ach.rarity === 'Legendary' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                    ach.rarity === 'Epic' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    ach.rarity === 'Rare' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    'bg-slate-500/10 text-slate-400 border-slate-500/20'
                  }`}>
                    {ach.rarity}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                    +{ach.xpReward} XP
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
