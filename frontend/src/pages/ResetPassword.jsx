import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authApi } from '@/api/authApi';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const token = new URLSearchParams(location.search).get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (password.length < 8) {
      return setError('Password must be at least 8 characters');
    }

    setLoading(true);

    try {
      await authApi.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. The token may be expired or invalid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-[calc(100vh-56px)] bg-background p-4 sm:p-8">
      <div className="w-full max-w-md p-8 bg-card border border-border rounded-2xl shadow-xl shadow-black/10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight mb-2">Reset Password</h2>
          <p className="text-muted-foreground text-sm">Enter your new password below.</p>
        </div>

        {error && (
          <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-6 border border-destructive/20">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-success/15 text-success text-sm p-3 rounded-md mb-6 border border-success/20">
            Password reset successful! Redirecting to login...
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground/80">New Password</label>
              <input
                type="password"
                required
                className="w-full bg-background border border-input rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={!token}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground/80">Confirm New Password</label>
              <input
                type="password"
                required
                className="w-full bg-background border border-input rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={!token}
              />
            </div>

            <Button type="submit" className="w-full mt-2" disabled={loading || !token}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Reset Password
            </Button>
          </form>
        )}
        
        {(!token || success) && (
          <div className="mt-6 text-center">
             <Link to="/login" className="text-primary hover:underline text-sm font-medium">
               Go to Login
             </Link>
          </div>
        )}
      </div>
    </div>
  );
}
