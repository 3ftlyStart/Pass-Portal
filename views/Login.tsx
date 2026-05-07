
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { signInWithGoogle } from '../services/firebase';
import { LogIn, GraduationCap, Globe, CheckCircle2, ArrowRight } from 'lucide-react';

const Login: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError('Failed to sign in. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    "AI-Powered Speaking Examiner",
    "Instant Writing Feedback",
    "Personalized Study Plans",
    "Progress Tracking & Analytics"
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100">
        
        {/* Left Side: Branding & Info */}
        <div className="bg-brand-navy p-12 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Background Patterns */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-sky/20 rounded-full -mr-32 -mt-32 blur-3xl opacity-20" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-orange-light/20 rounded-full -ml-32 -mb-32 blur-3xl opacity-20" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12 group cursor-pointer">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110">
                <span className="text-brand-navy font-black text-2xl">i</span>
              </div>
              <span className="text-2xl font-black tracking-tight">ieHuddle</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
              Master the IELTS with <span className="bg-linear-to-r from-brand-orange-light to-brand-orange-dark bg-clip-text text-transparent">Smart AI</span>.
            </h1>
            <p className="text-lg text-slate-300 font-medium mb-8 max-w-md">
              The only preparation platform you'll ever need to reach your target band score.
            </p>
            
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-brand-teal rounded-full flex items-center justify-center shadow-lg shadow-brand-teal/20">
                    <CheckCircle2 size={14} className="text-white" />
                  </div>
                  <span className="text-sm font-bold text-slate-200">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative z-10 pt-12 flex items-center gap-6">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <img 
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-brand-navy shadow-sm"
                  src={`https://picsum.photos/seed/${i + 10}/100/100`} 
                  alt="User" 
                />
              ))}
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Joined by 10k+ candidates</p>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-12 md:p-20 flex flex-col justify-center items-center">
          <div className="w-full max-w-sm space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-black text-slate-800 mb-2">Welcome Back</h2>
              <p className="text-slate-400 font-medium">Continue your journey to success</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full h-14 bg-white border-2 border-slate-100 hover:border-brand-navy hover:bg-slate-50 text-brand-navy font-bold rounded-2xl flex items-center justify-center gap-3 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group shadow-sm hover:shadow-md"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/bx_loader.gif" className={`w-6 h-6 ${isLoading ? 'block' : 'hidden'}`} alt="loading" />
                {!isLoading && (
                  <>
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    <span>Sign in with Google</span>
                  </>
                )}
              </button>

              {error && (
                <p className="text-rose-500 text-sm font-bold text-center bg-rose-50 p-3 rounded-xl border border-rose-100 flex items-center justify-center gap-2">
                  <CheckCircle2 size={16} className="rotate-45" />
                  {error}
                </p>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest font-black">
                <span className="px-4 bg-white text-slate-300">Fast & Secure</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl text-center">
                <div className="text-brand-orange-dark font-black text-xl mb-1">99%</div>
                <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Uptime</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl text-center">
                <div className="text-brand-orange-dark font-black text-xl mb-1">256-bit</div>
                <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Encryption</div>
              </div>
            </div>

            <div className="pt-8 text-center">
              <p className="text-xs text-slate-400 font-medium">
                By signing in, you agree to our <br />
                <a href="#" className="text-brand-teal font-bold hover:underline">Terms of Service</a> and <a href="#" className="text-brand-teal font-bold hover:underline">Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
