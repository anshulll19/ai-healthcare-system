import React, { useState } from 'react';
import { Brain, Mail, Lock, User as UserIcon, ArrowRight, Shield } from 'lucide-react';
import GravityBackground from './GravityBackground';

export default function Auth({ onLogin }: { onLogin: (role: string) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'patient' | 'caregiver'>('patient');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin
        ? { email, password }
        : { name, email, password, role: selectedRole };

      const res = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Authentication failed');

      if (isLogin) {
        localStorage.setItem('user_role', data.role);
        localStorage.setItem('user_name', data.name || 'User');
        localStorage.setItem('user_id', data.user_id?.toString() || '');
        onLogin(data.role);
      } else {
        setIsLogin(true);
        setMessage('Account created! Please sign in.');
        setName('');
        setPassword('');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#060910] font-sans">
      <GravityBackground />

      <div className="relative z-10 w-full max-w-md mx-4 animate-float" style={{ animation: 'float 6s ease-in-out infinite' }}>
        <div className="bg-white/[0.03] backdrop-blur-2xl p-8 rounded-3xl shadow-[0_20px_80px_-15px_rgba(0,0,0,0.8)] border border-white/5">
          {/* Brand */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00E5FF] to-[#9D00FF] flex items-center justify-center shadow-[0_0_25px_rgba(0,229,255,0.4)]">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="font-black text-3xl tracking-tight bg-gradient-to-r from-[#00E5FF] to-[#9D00FF] bg-clip-text text-transparent">
                NeuroVoice
              </span>
              <p className="text-[10px] text-gray-500 -mt-1">ALS AI Healthcare Assistant</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white text-center mb-1">
            {isLogin ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-gray-400 text-center text-sm mb-6">
            {isLogin ? 'Your ALS health companion — powered by AI' : 'Join as a patient or caregiver'}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>
          )}
          {message && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm">{message}</div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                {/* Name */}
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="Full Name" required aria-label="Full Name"
                    className="w-full bg-white/[0.04] border border-white/8 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF]/40 focus:shadow-[0_0_15px_rgba(0,229,255,0.1)] transition-all" />
                </div>

                {/* Role Selector */}
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setSelectedRole('patient')}
                    className={`p-4 rounded-xl text-center transition-all ${
                      selectedRole === 'patient'
                        ? 'bg-[#00E5FF]/15 border-2 border-[#00E5FF]/40 text-white'
                        : 'bg-white/3 border-2 border-white/5 text-gray-400 hover:border-white/10'
                    }`}>
                    <UserIcon className={`w-6 h-6 mx-auto mb-1 ${selectedRole === 'patient' ? 'text-[#00E5FF]' : ''}`} />
                    <p className="font-medium text-sm">Patient</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">ALS patient</p>
                  </button>
                  <button type="button" onClick={() => setSelectedRole('caregiver')}
                    className={`p-4 rounded-xl text-center transition-all ${
                      selectedRole === 'caregiver'
                        ? 'bg-[#FF007F]/15 border-2 border-[#FF007F]/40 text-white'
                        : 'bg-white/3 border-2 border-white/5 text-gray-400 hover:border-white/10'
                    }`}>
                    <Shield className={`w-6 h-6 mx-auto mb-1 ${selectedRole === 'caregiver' ? 'text-[#FF007F]' : ''}`} />
                    <p className="font-medium text-sm">Caregiver</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Family / Nurse</p>
                  </button>
                </div>
              </>
            )}

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Email Address" required aria-label="Email"
                className="w-full bg-white/[0.04] border border-white/8 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF]/40 focus:shadow-[0_0_15px_rgba(0,229,255,0.1)] transition-all" />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Password" required aria-label="Password"
                className="w-full bg-white/[0.04] border border-white/8 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF]/40 focus:shadow-[0_0_15px_rgba(0,229,255,0.1)] transition-all" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-4 mt-2 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#9D00FF] font-bold text-white text-lg shadow-[0_0_25px_rgba(0,229,255,0.3)] hover:shadow-[0_0_35px_rgba(157,0,255,0.5)] hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Get Started'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => { setIsLogin(!isLogin); setError(''); setMessage(''); }}
              className="text-gray-400 hover:text-white text-sm transition-colors">
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>

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
