import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authApi } from '@/api/authApi';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await authApi.forgotPassword(email);
      setSuccess('If an account exists with that email, a password reset link has been sent. Please check your terminal console (backend server).');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-[calc(100vh-56px)] bg-background p-4 sm:p-8">
      <div className="w-full max-w-md p-8 bg-card border border-border rounded-2xl shadow-xl shadow-black/10">
        
        <Link to="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to login
        </Link>

        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight mb-2">Forgot Password</h2>
          <p className="text-muted-foreground text-sm">Enter your email address and we'll send you a link to reset your password.</p>
        </div>

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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-foreground/80">Email</label>
            <input
              type="email"
              required
              className="w-full bg-background border border-input rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full mt-2" disabled={loading || !!success}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Send Reset Link
          </Button>
        </form>
      </div>
    </div>
  );
}
