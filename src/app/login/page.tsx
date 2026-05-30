'use client';

import { useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { authStart, authSuccess, authFailure, clearAuthError } from '@/store/slices/authSlice';
import { RootState } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Activity, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

// ─── PROP TYPE DEFINITIONS FOR GOOGLE IDENTITY SDK ───
interface GoogleCredentialResponse {
  credential?: string;
  select_by?: string;
}

interface GoogleIdInitializeConfig {
  client_id: string | undefined;
  callback: (response: GoogleCredentialResponse) => void;
}

interface GoogleIdRenderButtonConfig {
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  width?: number;
  shape?: 'square' | 'circle' | 'pill' | 'rectangular';
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleIdInitializeConfig) => void;
          renderButton: (element: HTMLElement | null, config: GoogleIdRenderButtonConfig) => void;
        };
      };
    };
  }
}

export default function LoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isAuthenticated, loading, error } = useSelector((state: RootState) => state.auth);

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
      router.refresh();
    }
    if (error) {
      toast.error(error);
      dispatch(clearAuthError());
    }
  }, [isAuthenticated, error, router, dispatch]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(authStart());

    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Authentication failed');

      dispatch(authSuccess({ user: data.user, token: data.token }));
      
      toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!', {
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      });

      window.location.href = '/';
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error. Please try again.';
      dispatch(authFailure(errorMessage));
    }
  };

  // ─── TYPE-SAFE GOOGLE INJECTION PIPELINE ───
  useEffect(() => {
    const handleGoogleCredentialResponse = async (response: GoogleCredentialResponse) => {
      if (!response.credential) return;
      dispatch(authStart());
      try {
        const res = await fetch(`${API_BASE}/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            idToken: response.credential,
            token: response.credential
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Login failed');

        dispatch(authSuccess({ user: data.user, token: data.token }));
        toast.success('Successfully signed in with Google');
        
        window.location.href = '/';
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Google sign-in failed';
        dispatch(authFailure(errorMessage));
      }
    };

    if (typeof window !== 'undefined' && window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleGoogleCredentialResponse,
      });

      window.google.accounts.id.renderButton(
        document.getElementById("googleSecureButtonInsideApp"),
        { theme: "outline", size: "large", width: 340, shape: "square" }
      );
    }
  }, [API_BASE, dispatch]);

  return (
    <div className="min-h-screen w-full bg-white flex flex-col md:flex-row overflow-hidden select-none">
      
      {/* ─── Left Panel: Brand & Theme Identity ─── */}
      <div className="hidden md:flex md:w-[45%] lg:w-[42%] border-r border-zinc-200 p-8 lg:p-12 flex-col justify-between relative overflow-hidden"
           style={{ background: "linear-gradient(145deg, #f7faf9 0%, #fafafa 100%)" }}
      >
        {/* Subtle Background Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
             style={{
               backgroundImage: "linear-gradient(rgba(16,185,129,1) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,1) 1px, transparent 1px)",
               backgroundSize: "40px 40px",
             }}
        />
        {/* Glowing Accent */}
        <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.04] pointer-events-none -translate-x-1/2 -translate-y-1/2"
             style={{ background: "radial-gradient(circle, #10b981 0%, transparent 70%)" }}
        />

        <div className="flex items-center gap-3 z-10">
          <div className="h-9 w-9 rounded-xl flex items-center justify-center text-white shadow-md"
               style={{ background: "linear-gradient(135deg, #059669 0%, #10b981 100%)" }}
          >
            <Activity className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-zinc-900 leading-none">AyuNidan</span>
          </div>
        </div>

        <div className="space-y-6 max-w-sm z-10 my-auto">
          <h2 className="text-4xl font-black tracking-tight text-zinc-900 leading-[1.15]">
            Smarter healthcare, simplified.
          </h2>
          <p className="text-sm font-medium text-zinc-500 leading-relaxed">
            Welcome to AyuNidan. Easily organize patient records, understand medical terms, and access a secure AI assistant tailored for daily clinical tasks.
          </p>
          <div className="pt-4 space-y-3">
            <div className="flex items-center gap-3 text-xs font-semibold text-zinc-700 bg-white/60 backdrop-blur-sm border border-zinc-200/80 p-3 rounded-xl shadow-sm">
              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>100% Private & Secure Data</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold text-zinc-700 bg-white/60 backdrop-blur-sm border border-zinc-200/80 p-3 rounded-xl shadow-sm">
              <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
              <span>Smart Medical Dictionary Built-in</span>
            </div>
          </div>
        </div>

        <p className="text-[11px] font-mono font-medium text-zinc-600 z-10">
          © {new Date().getFullYear()} AyuNidan Intelligence.
        </p>
      </div>

      {/* ─── Right Panel: Login Form ─── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-8 lg:px-16 bg-white relative">
        <div className="absolute inset-0 bg-[radial-gradient(#e4e4e7_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none md:hidden" />
        
        <div className="w-full max-w-[360px] z-10 flex flex-col space-y-7">
          
          <div className="text-center md:text-left space-y-1.5">
            <h3 className="text-2xl font-black tracking-tight text-zinc-900">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h3>
            <p className="text-xs font-medium text-zinc-500">
              {isLogin ? 'Enter your details to access your dashboard.' : 'Sign up to start using the platform securely.'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex w-full border-b border-zinc-100 pb-px">
            <button 
              type="button" 
              onClick={() => setIsLogin(true)} 
              className={`flex-1 text-center pb-3 text-sm font-bold tracking-tight transition-all relative ${isLogin ? 'text-zinc-950' : 'text-zinc-600 hover:text-zinc-600'}`}
            >
              Sign In 
              {isLogin && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />}
            </button>
            <button 
              type="button" 
              onClick={() => setIsLogin(false)} 
              className={`flex-1 text-center pb-3 text-sm font-bold tracking-tight transition-all relative ${!isLogin ? 'text-zinc-950' : 'text-zinc-600 hover:text-zinc-600'}`}
            >
              Register 
              {!isLogin && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />}
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4.5">
            {!isLogin && (
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-bold text-zinc-700 tracking-tight">Full Name</Label>
                <Input 
                  id="name" 
                  type="text" 
                  placeholder="E.g. Dr. Rajesh Kumar" 
                  className="h-11 bg-zinc-50/50 border-zinc-200 text-zinc-900 placeholder:text-zinc-600 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 rounded-xl font-medium text-sm transition-all focus:bg-white" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold text-zinc-700 tracking-tight">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                className="h-11 bg-zinc-50/50 border-zinc-200 text-zinc-900 placeholder:text-zinc-600 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 rounded-xl font-medium text-sm transition-all focus:bg-white" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-bold text-zinc-700 tracking-tight">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                className="h-11 bg-zinc-50/50 border-zinc-200 text-zinc-900 placeholder:text-zinc-600 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 rounded-xl font-medium text-sm transition-all focus:bg-white" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-11 bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs tracking-wide mt-3 rounded-xl shadow-md hover:shadow-lg transition-all" 
              disabled={loading}
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In to Account' : 'Create Account'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-zinc-100" /></div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-wider">
              <span className="bg-white px-3 text-zinc-600">Or continue with</span>
            </div>
          </div>

          <div className="w-full flex justify-center min-h-[40px]">
            <div id="googleSecureButtonInsideApp" className="w-full max-w-full flex justify-center"></div>
          </div>
          
        </div>
      </div>
      
    </div>
  );
}