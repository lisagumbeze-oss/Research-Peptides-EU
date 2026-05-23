import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react';
import { Button, Container, GlassPanel } from '../design-system';
import logo from '../assets/brandLogo';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        if (data.user) {
          setSuccess('Account created. Check your email to confirm your address.');
        }
      } else {
        const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (loginError) throw loginError;
        if (data.user) navigate('/profile');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : isSignUp ? 'Sign up failed' : 'Sign in failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/profile` },
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed');
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 relative overflow-hidden flex items-center justify-center py-12 px-4">
      <div className="absolute inset-0 bg-scientific-grid opacity-20 pointer-events-none" aria-hidden />
      <div className="absolute inset-0 bg-gradient-glow opacity-60 pointer-events-none" aria-hidden />

      <Container size="narrow" className="relative z-10 w-full max-w-md">
        <GlassPanel variant="dark" padding="lg" className="shadow-glow">
          <div className="text-center mb-8">
            <img src={logo} alt="" className="h-12 w-auto mx-auto mb-6 drop-shadow-[0_4px_20px_rgba(45,181,163,0.4)]" width={52} height={52} />
            <h1 className="font-display font-bold text-2xl text-white mb-2">
              {isSignUp ? 'Create researcher account' : 'Welcome back'}
            </h1>
            <p className="text-silver-400 text-sm">
              {isSignUp
                ? 'Join Research Peptides EU for order tracking and wishlists.'
                : 'Sign in to manage orders and laboratory supplies.'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-error/15 border border-error/30 text-sm text-red-200">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 rounded-xl bg-success/15 border border-success/30 text-sm text-emerald-200">
              {success}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleAuth}>
            <div>
              <label htmlFor="login-email" className="text-caption text-brand-300 block mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-silver-400" aria-hidden />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-silver-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
                  placeholder="name@lab.eu"
                />
              </div>
            </div>
            <div>
              <label htmlFor="login-password" className="text-caption text-brand-300 block mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-silver-400" aria-hidden />
                <input
                  id="login-password"
                  type="password"
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </div>
            </div>

            <Button type="submit" fullWidth size="lg" disabled={loading} className="gap-2">
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              ) : (
                <>
                  <LogIn className="h-5 w-5" aria-hidden />
                  {isSignUp ? 'Create account' : 'Sign in'}
                </>
              )}
            </Button>
          </form>

          <p className="text-center mt-6">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm font-semibold text-brand-300 hover:text-white transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </p>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-transparent text-silver-400">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/15 bg-white/5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
          >
            <img
              className="h-5 w-5"
              src="https://www.svgrepo.com/show/355037/google.svg"
              alt=""
            />
            Google
          </button>
        </GlassPanel>
      </Container>
    </div>
  );
}
