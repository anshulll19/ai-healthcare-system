import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Activity, BookOpen, AlertTriangle, Shield, Brain, Zap, Clock } from 'lucide-react';

const API = 'http://localhost:8000/api/als';

export default function Dashboard() {
  const [riskAnalysis, setRiskAnalysis] = useState<any>(null);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [alertCount, setAlertCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const userName = localStorage.getItem('user_name') || 'Patient';

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [sympRes, msgRes, alertRes] = await Promise.all([
          fetch(`${API}/symptoms`, { credentials: 'include' }).then(r => r.ok ? r.json() : null),
          fetch(`${API}/communication/messages`, { credentials: 'include' }).then(r => r.ok ? r.json() : null),
          fetch(`${API}/emergency/alerts`, { credentials: 'include' }).then(r => r.ok ? r.json() : null),
        ]);
        if (sympRes?.ai_analysis) setRiskAnalysis(sympRes.ai_analysis);
        if (msgRes?.messages) setRecentMessages(msgRes.messages.slice(0, 3));
        if (alertRes?.alerts) setAlertCount(alertRes.alerts.filter((a: any) => !a.resolved).length);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchAll();
  }, []);

  const getRiskColor = (level: string) => {
    const map: Record<string, string> = { Low: 'text-green-400', Moderate: 'text-yellow-400', High: 'text-orange-400', Critical: 'text-red-400' };
    return map[level] || 'text-gray-400';
  };

  const navCards = [
    {
      title: 'Communication',
      desc: 'AI-powered text prediction & text-to-speech',
      icon: <MessageSquare className="w-8 h-8" />,
      path: '/communicate',
      gradient: 'from-[#00E5FF] to-[#00B8D4]',
      shadow: 'rgba(0, 229, 255, 0.3)'
    },
    {
      title: 'Symptom Tracker',
      desc: 'Track & analyze ALS progression',
      icon: <Activity className="w-8 h-8" />,
      path: '/symptoms',
      gradient: 'from-[#39FF14] to-[#00C853]',
      shadow: 'rgba(57, 255, 20, 0.3)'
    },
    {
      title: 'Health Education',
      desc: 'Learn about ALS, treatments & support',
      icon: <BookOpen className="w-8 h-8" />,
      path: '/education',
      gradient: 'from-[#FFB300] to-[#FF8F00]',
      shadow: 'rgba(255, 179, 0, 0.3)'
    },
    {
      title: 'Emergency SOS',
      desc: 'Instant caregiver alert system',
      icon: <AlertTriangle className="w-8 h-8" />,
      path: '/communicate',
      gradient: 'from-[#FF0040] to-[#FF4444]',
      shadow: 'rgba(255, 0, 64, 0.3)'
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome, <span className="bg-gradient-to-r from-[#00E5FF] to-[#9D00FF] bg-clip-text text-transparent">{userName}</span> 👋
          </h1>
          <p className="text-gray-400 mt-1">Your ALS health companion — powered by AI</p>
        </div>
        {riskAnalysis && (
          <div className="flex items-center gap-3">
            <div className="glass-card py-3 px-5 flex items-center gap-3">
              <Brain className="w-5 h-5 text-[#00E5FF]" />
              <div>
                <p className="text-xs text-gray-400">Current Risk</p>
                <p className={`font-bold ${getRiskColor(riskAnalysis.risk_level)}`}>{riskAnalysis.risk_level}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active alert warning */}
      {alertCount > 0 && (
        <div className="glass-card border-red-500/30 animate-pulse-emergency flex items-center gap-4">
          <AlertTriangle className="w-8 h-8 text-red-400 shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-red-400">You have {alertCount} active emergency alert{alertCount > 1 ? 's' : ''}</p>
            <p className="text-sm text-gray-400">Your caregiver has been notified</p>
          </div>
        </div>
      )}

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {navCards.map(card => (
          <Link key={card.title} to={card.path}
            className="glass-card glass-card-hover group relative overflow-hidden transition-all duration-300"
            style={{ boxShadow: `0 0 0 rgba(0,0,0,0)` }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 8px 30px ${card.shadow}`)}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = `0 0 0 rgba(0,0,0,0)`)}>
            {/* Glow accent */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${card.gradient} opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:opacity-10 transition-opacity`} />

            <div className="flex items-start gap-4 relative z-10">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white shadow-lg shrink-0`}>
                {card.icon}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white group-hover:text-[#00E5FF] transition-colors">{card.title}</h2>
                <p className="text-sm text-gray-400 mt-1">{card.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Status & Recent Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Status */}
        <div className="glass-card">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#00E5FF]" /> AI Health Status
          </h3>
          {riskAnalysis ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Risk Score</span>
                <span className="text-2xl font-bold text-white">{riskAnalysis.risk_score?.toFixed(1)}<span className="text-sm text-gray-500">/100</span></span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-3">
                <div className={`h-3 rounded-full transition-all duration-1000 ${
                  riskAnalysis.risk_score < 25 ? 'bg-green-500' :
                  riskAnalysis.risk_score < 45 ? 'bg-yellow-500' :
                  riskAnalysis.risk_score < 65 ? 'bg-orange-500' : 'bg-red-500'
                }`} style={{ width: `${Math.min(riskAnalysis.risk_score, 100)}%` }} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Trend: <span className="text-white font-medium">{riskAnalysis.trend}</span></span>
                <span className={`font-bold ${getRiskColor(riskAnalysis.risk_level)}`}>{riskAnalysis.risk_level}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <Activity className="w-10 h-10 mx-auto mb-3 text-gray-600" />
              <p className="text-gray-500 text-sm">No symptom data yet</p>
              <Link to="/symptoms" className="text-[#00E5FF] text-sm hover:underline">Record your first symptoms →</Link>
            </div>
          )}
        </div>

        {/* Recent Messages */}
        <div className="glass-card">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#9D00FF]" /> Recent Messages
          </h3>
          {recentMessages.length > 0 ? (
            <div className="space-y-2">
              {recentMessages.map(msg => (
                <div key={msg.id} className={`p-3 rounded-xl text-sm ${
                  msg.is_emergency ? 'bg-red-500/10 border-l-4 border-red-500' : 'bg-white/3 border-l-4 border-[#00E5FF]/20'
                }`}>
                  <p className="text-white">{msg.is_emergency ? '🚨 ' : ''}{msg.message_text}</p>
                  <p className="text-[10px] text-gray-500 mt-1">{new Date(msg.created_at).toLocaleString('en-IN')}</p>
                </div>
              ))}
              <Link to="/communicate" className="block text-center text-[#00E5FF] text-sm hover:underline pt-2">
                View all messages →
              </Link>
            </div>
          ) : (
            <div className="text-center py-6">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 text-gray-600" />
              <p className="text-gray-500 text-sm">No messages yet</p>
              <Link to="/communicate" className="text-[#00E5FF] text-sm hover:underline">Start communicating →</Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Facts */}
      <div className="glass-card">
        <h3 className="text-sm font-bold text-gray-400 mb-3">💡 Did You Know?</h3>
        <p className="text-gray-300 text-sm leading-relaxed">
          ALS affects approximately 2 per 100,000 people worldwide. While there's no cure yet, early intervention with Riluzole and multidisciplinary care
          can significantly improve quality of life. Regular symptom tracking helps your medical team provide better, more personalized care.
        </p>
      </div>
    </div>
  );
}
