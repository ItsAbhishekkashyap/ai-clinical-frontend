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
      
      toast.success(isLogin ? 'Welcome back to AyuNidan!' : 'Account created successfully!', {
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      });

      window.location.href = '/';
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network gateway failure';
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
        if (!res.ok) throw new Error(data.message || 'Verification on backend failed');

        dispatch(authSuccess({ user: data.user, token: data.token }));
        toast.success('Successfully signed in with Google');
        
        window.location.href = '/';
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Google authorization failure';
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
      {/* Left Panel */}
      <div className="hidden md:flex md:w-[42%] lg:w-[38%] bg-zinc-50 border-r border-zinc-200 p-8 lg:p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:linear-gradient(to_bottom,white_40%,transparent_100%)] opacity-70 pointer-events-none" />
        <div className="flex items-center gap-3 z-10">
          <div className="h-9 w-9 rounded-xl bg-zinc-950 flex items-center justify-center text-white shadow-md">
            <Activity className="h-4 w-4 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-black tracking-tight text-zinc-900 leading-none">AyuNidan</span>
            <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-600 uppercase mt-1">Clinical AI</span>
          </div>
        </div>
        <div className="space-y-6 max-w-sm z-10 my-auto">
          <h2 className="text-3xl font-black tracking-tight text-zinc-900 leading-tight">Advanced Clinical Intelligence Network.</h2>
          <p className="text-xs sm:text-sm font-medium text-zinc-500 leading-relaxed">Streamline diagnostic tracking profiles, parse multi-modal healthcare assets, and evaluate stratified patient risk indices seamlessly.</p>
          <div className="pt-2 space-y-3">
            <div className="flex items-center gap-3 text-xs font-semibold text-zinc-700 bg-white border border-zinc-200/80 p-3 rounded-xl shadow-sm">
              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>User-Isolated Telemetry Subsystems</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold text-zinc-700 bg-white border border-zinc-200/80 p-3 rounded-xl shadow-sm">
              <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
              <span>Natively Bound to RAG Models</span>
            </div>
          </div>
        </div>
        <p className="text-[11px] font-mono font-medium text-zinc-400 z-10">© AyuNidan Systems. Secure Architecture Layer.</p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-8 lg:px-16 bg-white relative">
        <div className="absolute inset-0 bg-[radial-gradient(#e4e4e7_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none md:hidden" />
        <div className="w-full max-w-[340px] z-10 flex flex-col space-y-6">
          <div className="text-center md:text-left space-y-1">
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900">Access Dashboard</h3>
            <p className="text-xs font-medium text-zinc-400 tracking-tight">Enter your credentials to access your secure node.</p>
          </div>
          <div className="flex w-full border-b border-zinc-100 pb-px">
            <button type="button" onClick={() => setIsLogin(true)} className={`flex-1 text-center pb-3 text-sm font-bold tracking-tight transition-all relative ${isLogin ? 'text-zinc-950' : 'text-zinc-400 hover:text-zinc-600'}`}>Sign In {isLogin && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-950 rounded-full" />}</button>
            <button type="button" onClick={() => setIsLogin(false)} className={`flex-1 text-center pb-3 text-sm font-bold tracking-tight transition-all relative ${!isLogin ? 'text-zinc-950' : 'text-zinc-400 hover:text-zinc-600'}`}>Register {!isLogin && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-950 rounded-full" />}</button>
          </div>
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <Label htmlFor="name" className="text-xs font-bold text-zinc-700 tracking-tight">Full Identity Name</Label>
                <Input id="name" type="text" placeholder="Your name..." className="h-10 bg-zinc-50/40 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-zinc-950 rounded-xl font-medium text-sm transition-all focus:bg-white" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            )}
            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs font-bold text-zinc-700 tracking-tight">Clinical Email Address</Label>
              <Input id="email" type="email" placeholder="name@gmail.com" className="h-10 bg-zinc-50/40 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-zinc-950 rounded-xl font-medium text-sm transition-all focus:bg-white" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password" className="text-xs font-bold text-zinc-700 tracking-tight">Cryptographic Secret Password</Label>
              <Input id="password" type="password" placeholder="••••••••" className="h-10 bg-zinc-50/40 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-zinc-950 rounded-xl font-medium text-sm transition-all focus:bg-white" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full h-10 bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs tracking-wide mt-2 rounded-xl shadow-md hover:shadow-lg transition-all" disabled={loading}>
              {loading ? 'Reconciling Token...' : isLogin ? 'Sign In' : 'Register'}
            </Button>
          </form>
          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-zinc-100" /></div>
            <div className="relative flex justify-center text-[10px] font-mono font-bold uppercase tracking-wider"><span className="bg-white px-3 text-zinc-400">Federated Access</span></div>
          </div>
          <div className="w-full flex justify-center min-h-[40px]">
            <div id="googleSecureButtonInsideApp" className="w-full max-w-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}