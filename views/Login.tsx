
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import { Brand } from '../components/Brand';

const Login: React.FC = () => {
  const { user, login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user && !loading) {
      const from = (location.state as any)?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, location]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const features = [
    "AI-Powered Speaking Examiner",
    "Instant Writing Feedback",
    "Personalized Study Plans",
    "Progress Tracking & Analytics"
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center md:p-6 lg:p-12">
      <div className="w-full max-w-5xl bg-[#4d40ff] md:rounded-[40px] shadow-2xl shadow-indigo-200/50 overflow-hidden flex flex-col md:flex-row min-h-[750px]">
        
        {/* Mobile-style landing section (matching the image) */}
        <div className="w-full md:w-1/2 p-10 sm:p-12 md:p-16 text-white flex flex-col justify-between relative overflow-hidden order-1">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            {/* Header / Logo */}
            <div className="flex items-center gap-4 mb-16">
              <Brand size={56} variant="white" />
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-4xl lg:text-5xl font-black leading-tight mb-8 tracking-tight font-heading text-justify">
              Master the IELTS with <br />
              Smart AI.
            </h1>

            {/* Sub-headline */}
            <p className="text-lg sm:text-xl md:text-lg lg:text-xl text-white/80 font-medium mb-12 max-w-md leading-relaxed">
              The only preparation platform you'll ever need to reach your target band score.
            </p>

            {/* Feature List */}
            <div className="space-y-6 mb-16">
              {features.map((feature, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="w-7 h-7 rounded-full border-2 border-white/20 flex items-center justify-center shrink-0 transition-colors group-hover:border-white/50">
                    <CheckCircle2 size={16} className="text-white" />
                  </div>
                  <p className="text-base sm:text-lg md:text-base lg:text-lg font-bold text-white/95">{feature}</p>
                </div>
              ))}
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <img 
                    key={i}
                    src={`https://i.pravatar.cc/100?u=user${i}`}
                    alt="User"
                    className="w-10 h-10 rounded-full border-2 border-[#4d40ff] object-cover ring-2 ring-white/10"
                  />
                ))}
              </div>
              <div className="ml-2">
                <p className="text-[10px] font-black tracking-[0.15em] text-white/40 uppercase leading-tight">JOINED BY 10K+</p>
                <p className="text-[10px] font-black tracking-[0.15em] text-white/40 uppercase leading-tight">CANDIDATES</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action side: Centered Login */}
        <div className="w-full md:w-1/2 p-10 sm:p-12 md:p-16 flex flex-col justify-center bg-white order-2">
          <div className="max-w-sm mx-auto w-full">
            <h2 className="text-3xl font-black text-slate-800 mb-3 tracking-tight font-heading">Get Started.</h2>
            <p className="text-slate-500 mb-10 text-lg">Sign in to begin your AI-powered preparation journey.</p>

            <div className="space-y-4">
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full h-16 bg-[#4d40ff] hover:bg-[#3f32ff] text-white font-bold rounded-2xl flex items-center justify-center gap-4 transition-all duration-300 shadow-[0_15px_35px_-5px_rgba(77,64,255,0.25)] hover:shadow-[0_20px_45px_-5px_rgba(77,64,255,0.35)] disabled:opacity-50 disabled:cursor-not-allowed group active:scale-95"
              >
                <img 
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                  alt="Google" 
                  className="w-6 h-6 bg-white rounded-full p-0.5"
                />
                <span className="text-lg">{loading ? "Signing in..." : "Continue with Google"}</span>
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="mt-16 pt-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-[10px] font-black tracking-[0.2em] text-slate-300 uppercase shrink-0">Fast & Secure</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-12">
                <div className="bg-slate-50/50 p-6 rounded-[24px] text-center">
                  <p className="text-2xl font-black text-[#4d40ff] mb-1">99%</p>
                  <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Uptime</p>
                </div>
                <div className="bg-slate-50/50 p-6 rounded-[24px] text-center">
                  <p className="text-2xl font-black text-[#4d40ff] mb-1">256-bit</p>
                  <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Encryption</p>
                </div>
              </div>

              <p className="text-center text-sm text-slate-400 font-bold leading-relaxed px-4 group">
                By signing in, you agree to our <br />
                <a href="#" className="text-[#4d40ff] hover:underline transition-all">Terms of Service</a> and <a href="#" className="text-[#4d40ff] hover:underline transition-all">Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
