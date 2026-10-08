import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import Confetti from 'react-confetti';
import { motion, AnimatePresence } from 'framer-motion';

const GamificationContext = createContext();

export const useGamification = () => useContext(GamificationContext);

export const GamificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  
  // Modal state
  const [showConfetti, setShowConfetti] = useState(false);
  const [milestoneEvent, setMilestoneEvent] = useState(null); // { type, title, message, data }

  useEffect(() => {
    if (isAuthenticated && user) {
      const newSocket = io('http://localhost:5000', { withCredentials: true });
      setSocket(newSocket);

      newSocket.emit('joinRoom', `user_${user._id}`);

      newSocket.on('level-up', (data) => {
        setMilestoneEvent({
          type: 'level-up',
          title: 'LEVEL UP!',
          message: `You reached Level ${data.level}!`,
          data
        });
        triggerConfetti();
      });

      newSocket.on('achievement', (achievement) => {
        setMilestoneEvent({
          type: 'achievement',
          title: 'ACHIEVEMENT UNLOCKED!',
          message: achievement.title,
          data: achievement
        });
        triggerConfetti();
      });

      return () => newSocket.close();
    }
  }, [isAuthenticated, user]);

  const triggerConfetti = () => {
    setShowConfetti(true);
    // Auto-close modal after 6 seconds
    setTimeout(() => {
      setShowConfetti(false);
      setTimeout(() => setMilestoneEvent(null), 500); // Wait for exit animation
    }, 6000);
  };

  return (
    <GamificationContext.Provider value={{ socket }}>
      {children}
      
      {/* Global Milestone Modal */}
      <AnimatePresence>
        {milestoneEvent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
            {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={500} gravity={0.15} />}
            
            <motion.div 
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -50 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="bg-card border-2 border-primary/50 shadow-2xl shadow-primary/20 p-8 rounded-2xl flex flex-col items-center text-center max-w-sm pointer-events-auto"
            >
              <div className="text-6xl mb-4">
                {milestoneEvent.type === 'level-up' ? '🔥' : milestoneEvent.data?.icon || '🏆'}
              </div>
              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-primary mb-2 uppercase tracking-wide">
                {milestoneEvent.title}
              </h2>
              <p className="text-lg text-muted-foreground font-medium mb-6">
                {milestoneEvent.message}
              </p>
              <button 
                onClick={() => setShowConfetti(false)}
                className="bg-primary/20 text-primary hover:bg-primary/30 px-6 py-2 rounded-full font-bold transition-colors"
              >
                Awesome!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </GamificationContext.Provider>
  );
};
