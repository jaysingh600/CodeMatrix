import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const getPasswordStrength = () => {
    let score = 0;
    if (formData.password.length > 7) score += 1;
    if (/[A-Z]/.test(formData.password)) score += 1;
    if (/[0-9]/.test(formData.password)) score += 1;
    if (/[^A-Za-z0-9]/.test(formData.password)) score += 1;
    return score;
  };

  const strength = getPasswordStrength();
  const strengthColors = ['bg-muted', 'bg-destructive', 'bg-warning', 'bg-success', 'bg-success'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    if (formData.password.length < 8) {
      return setError('Password must be at least 8 characters');
    }

    setLoading(true);

    try {
      await register({
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-[calc(100vh-56px)] bg-background p-4 sm:p-8">
      <div className="w-full max-w-md p-8 bg-card border border-border rounded-2xl shadow-xl shadow-black/10">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight mb-2">Create an account</h2>
          <p className="text-muted-foreground text-sm">Join CodeMatrix and start coding today.</p>
        </div>

        {error && (
          <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-6 border border-destructive/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-foreground/80">Full Name</label>
            <input
              type="text"
              name="fullName"
              required
              className="w-full bg-background border border-input rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-foreground/80">Username</label>
            <input
              type="text"
              name="username"
              required
              className="w-full bg-background border border-input rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="johndoe123"
              value={formData.username}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-foreground/80">Email</label>
            <input
              type="email"
              name="email"
              required
              className="w-full bg-background border border-input rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-foreground/80">Password</label>
            <input
              type="password"
              name="password"
              required
              className="w-full bg-background border border-input rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
            {formData.password && (
              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <div 
                    key={level} 
                    className={`h-1 w-1/4 rounded-full ${strength >= level ? strengthColors[strength] : 'bg-muted'}`}
                  />
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-foreground/80">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              required
              className="w-full bg-background border border-input rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <div className="flex items-start gap-2 pt-2 pb-4">
            <input type="checkbox" required id="terms" className="mt-1 rounded border-input bg-background text-primary focus:ring-primary/50" />
            <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed">
              I agree to the <Link to="#" className="text-primary hover:underline">Terms of Service</Link> and <Link to="#" className="text-primary hover:underline">Privacy Policy</Link>.
            </label>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
