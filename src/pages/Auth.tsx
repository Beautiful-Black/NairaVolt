import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Shield, LogIn, UserPlus, Loader2 } from 'lucide-react';
import nairavoltLogo from '@/assets/nairavolt-logo.jpeg';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast({
          title: 'Account created!',
          description: 'Check your email to verify your account, then log in.',
        });
        setIsLogin(true);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src={nairavoltLogo} alt="NairaVolt Logo" className="h-20 w-20 rounded-2xl object-contain mb-3" />
          <h1 className="font-extrabold text-2xl text-foreground">NairaVolt</h1>
          <p className="text-sm text-muted-foreground">Smart Energy Auditing for Nigeria</p>
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-2xl shadow-card p-6 border border-border">
          <h2 className="font-bold text-lg text-foreground mb-1 flex items-center gap-2">
            {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-sm text-muted-foreground mb-5">
            {isLogin ? 'Sign in to access your energy profiles.' : 'Start tracking your energy costs today.'}
          </p>

          {/* Security warning for signup */}
          {!isLogin && (
            <div className="flex items-start gap-2.5 p-3 mb-4 rounded-xl bg-warning/10 border border-warning/20">
              <Shield size={18} className="text-warning mt-0.5 shrink-0" />
              <p className="text-xs text-foreground leading-relaxed">
                <span className="font-semibold">Security Note:</span> Create a unique password for NairaVolt; do not use your private email provider's password.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 size={16} className="mr-2 animate-spin" />}
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-4">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary font-semibold hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>

        <p className="text-center text-[11px] text-muted-foreground mt-6">
          Built for Nigeria 🇳🇬
        </p>
      </div>
    </div>
  );
};

export default Auth;
