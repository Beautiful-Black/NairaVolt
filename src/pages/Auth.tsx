import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';
import { Shield, LogIn, UserPlus, Loader2, MailCheck, ArrowLeft, KeyRound, Mail, LockKeyhole } from 'lucide-react';
import nairavoltLogo from '@/assets/nairavolt-logo.jpeg';

type ResetStep = 'email' | 'otp' | 'password';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const [resetStep, setResetStep] = useState<ResetStep | null>(null);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resendSeconds, setResendSeconds] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = window.setInterval(() => setResendSeconds((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [resendSeconds]);

  const showResetError = (message: string) => {
    setResetError(message);
    setLoading(false);
  };

  const invokeResetFunction = async (functionName: string, body: Record<string, string>) => {
    const { data, error } = await supabase.functions.invoke(functionName, { body });
    if (error) {
      let message = error.message;
      const response = 'context' in error && error.context instanceof Response ? error.context : null;
      if (response) {
        const responseBody = await response.json().catch(() => null) as unknown;
        if (responseBody && typeof responseBody === 'object' && 'error' in responseBody && typeof responseBody.error === 'string') {
          message = responseBody.error;
        }
      } else if (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string') {
        message = data.error;
      }
      throw new Error(message);
    }
    return data;
  };

  const resetFlow = (step: ResetStep | null) => {
    setResetStep(step);
    setResetError('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setResendSeconds(0);
  };

  const requestOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      showResetError('Enter a valid email address.');
      return;
    }

    setLoading(true);
    setResetError('');
    try {
      await invokeResetFunction('request-password-otp', { email: normalizedEmail });
      setEmail(normalizedEmail);
      setResetStep('otp');
      setResendSeconds(60);
    } catch (error) {
      showResetError(error instanceof Error ? error.message : 'We could not send your OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    if (otp.length !== 6) {
      showResetError('Enter the six-digit OTP from your email.');
      return;
    }

    setLoading(true);
    setResetError('');
    try {
      await invokeResetFunction('verify-password-otp', { email, otp });
      setResetStep('password');
    } catch (error) {
      showResetError(error instanceof Error ? error.message : 'That OTP is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newPassword.length < 8) {
      showResetError('Use a password with at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showResetError('The passwords do not match.');
      return;
    }

    setLoading(true);
    setResetError('');
    try {
      await invokeResetFunction('reset-password-with-otp', { email, otp, password: newPassword });
      resetFlow(null);
      setIsLogin(true);
      setPassword('');
      toast({ title: 'Password reset successfully.', description: 'Please log in with your new password.' });
    } catch (error) {
      showResetError(error instanceof Error ? error.message : 'We could not update your password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (resendSeconds > 0 || loading) return;
    setLoading(true);
    setResetError('');
    try {
      await invokeResetFunction('request-password-otp', { email });
      setResendSeconds(60);
      setOtp('');
    } catch (error) {
      showResetError(error instanceof Error ? error.message : 'We could not resend your OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
        setSignupEmail(email);
        setSignupSuccess(true);
        setEmail('');
        setPassword('');
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

  if (signupSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-8">
            <img src={nairavoltLogo} alt="NairaVolt Logo" className="h-20 w-20 rounded-2xl object-contain mb-3" />
          </div>
          <div className="bg-card rounded-2xl shadow-card p-8 border border-border text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-5">
              <MailCheck size={32} className="text-primary" />
            </div>
            <h2 className="font-bold text-xl text-foreground mb-2">Check Your Mail! 📧</h2>
            <p className="text-sm text-muted-foreground mb-1">
              We've sent a verification link to:
            </p>
            <p className="text-sm font-semibold text-foreground mb-4 break-all">{signupEmail}</p>
            <p className="text-sm text-muted-foreground mb-6">
              Please verify your account before logging in to NairaVolt.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setSignupSuccess(false);
                setIsLogin(true);
              }}
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Sign In
            </Button>
          </div>
          <p className="text-center text-[11px] text-muted-foreground mt-6">
            Built for Nigeria 🇳🇬
          </p>
        </div>
      </div>
    );
  }

  if (resetStep) {
    const resetCopy = {
      email: {
        icon: <KeyRound size={20} />,
        title: 'Forgot Password?',
        description: 'Enter your NairaVolt email and we’ll send a secure six-digit reset code.',
      },
      otp: {
        icon: <MailCheck size={20} />,
        title: 'Check Your Mail',
        description: `Enter the six-digit code sent to ${email}. It expires in 10 minutes.`,
      },
      password: {
        icon: <LockKeyhole size={20} />,
        title: 'Create a New Password',
        description: 'Choose a strong password with at least 8 characters.',
      },
    }[resetStep];

    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-8">
            <img src={nairavoltLogo} alt="NairaVolt Logo" className="h-20 w-20 rounded-2xl object-contain mb-3" />
            <h1 className="font-extrabold text-2xl text-foreground">NairaVolt</h1>
            <p className="text-sm text-muted-foreground">Smart Energy Auditing for Nigeria</p>
          </div>

          <div className="bg-card rounded-2xl shadow-card p-6 border border-border">
            <h2 className="font-bold text-lg text-foreground mb-1 flex items-center gap-2">
              {resetCopy.icon}
              {resetCopy.title}
            </h2>
            <p className="text-sm text-muted-foreground mb-5">{resetCopy.description}</p>

            {resetError && (
              <div role="alert" className="mb-4 rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                {resetError}
              </div>
            )}

            {resetStep === 'email' && (
              <form onSubmit={requestOtp} className="space-y-3">
                <Input
                  type="email"
                  placeholder="Registered email address"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  autoFocus
                  required
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                  Send OTP
                </Button>
              </form>
            )}

            {resetStep === 'otp' && (
              <form onSubmit={verifyOtp} className="space-y-5">
                <InputOTP maxLength={6} value={otp} onChange={setOtp} autoFocus aria-label="Six-digit password reset code">
                  <InputOTPGroup className="mx-auto gap-1.5">
                    {[0, 1, 2, 3, 4, 5].map((index) => <InputOTPSlot key={index} index={index} className="h-11 w-10 rounded-md border" />)}
                  </InputOTPGroup>
                </InputOTP>
                <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  Verify OTP
                </Button>
                <div className="text-center text-sm text-muted-foreground">
                  {resendSeconds > 0 ? `Resend OTP in ${resendSeconds}s` : (
                    <Button type="button" variant="link" className="h-auto p-0" onClick={resendOtp} disabled={loading}>
                      Resend OTP
                    </Button>
                  )}
                </div>
              </form>
            )}

            {resetStep === 'password' && (
              <form onSubmit={resetPassword} className="space-y-3">
                <Input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  autoComplete="new-password"
                  autoFocus
                  minLength={8}
                  required
                />
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  Reset Password
                </Button>
              </form>
            )}

            <Button type="button" variant="ghost" className="w-full mt-3" onClick={() => resetFlow(null)} disabled={loading}>
              <ArrowLeft size={16} />
              Back to Sign In
            </Button>
          </div>

          <p className="text-center text-[11px] text-muted-foreground mt-6">Built for Nigeria 🇳🇬</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <img src={nairavoltLogo} alt="NairaVolt Logo" className="h-20 w-20 rounded-2xl object-contain mb-3" />
          <h1 className="font-extrabold text-2xl text-foreground">NairaVolt</h1>
          <p className="text-sm text-muted-foreground">Smart Energy Auditing for Nigeria</p>
        </div>

        <div className="bg-card rounded-2xl shadow-card p-6 border border-border">
          <h2 className="font-bold text-lg text-foreground mb-1 flex items-center gap-2">
            {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-sm text-muted-foreground mb-5">
            {isLogin ? 'Sign in to access your energy profiles.' : 'Start tracking your energy costs today.'}
          </p>

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
            {isLogin && (
              <div className="flex justify-end -mt-1">
                <Button type="button" variant="link" className="h-auto p-0 text-xs" onClick={() => resetFlow('email')}>
                  Forgot Password?
                </Button>
              </div>
            )}
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
