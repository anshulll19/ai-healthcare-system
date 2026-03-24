import React, { useState } from 'react';
import { Activity, Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';
import GravityBackground from './GravityBackground';

export default function Auth({ onLogin }: { onLogin: () => void }) {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#0b0e14] font-sans">
      <GravityBackground />

      {/* Floating UI Container */}
      <div 
        className="relative z-10 w-full max-w-md animate-[float_6s_ease-in-out_infinite]"
        style={{ animation: 'float 6s ease-in-out infinite' }}
      >
        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] border-0">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00E5FF] to-[#9D00FF] flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.4)]">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-3xl tracking-tight text-white">Lumina</span>
          </div>

          <h2 className="text-2xl font-bold text-white text-center mb-2">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h2>
          <p className="text-gray-400 text-center text-sm mb-8">
            Experience liftoff with the next-generation healthcare platform.
          </p>

          <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
            {!isLogin && (
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  required
                  className="w-full bg-[#10131a]/80 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF]/50 focus:shadow-[0_0_15px_rgba(0,229,255,0.2)] transition-all"
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                type="email" 
                placeholder="Email Address" 
                required
                className="w-full bg-[#10131a]/80 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF]/50 focus:shadow-[0_0_15px_rgba(0,229,255,0.2)] transition-all"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                type="password" 
                placeholder="Password" 
                required
                className="w-full bg-[#10131a]/80 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF]/50 focus:shadow-[0_0_15px_rgba(0,229,255,0.2)] transition-all"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-3.5 mt-4 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#9D00FF] font-bold text-white shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:shadow-[0_0_30px_rgba(157,0,255,0.6)] hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group"
            >
              {isLogin ? 'Sign In' : 'Get Started'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
      
      {/* Global Float Keyframes */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(0.5deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
      `}</style>
    </div>
  );
}
