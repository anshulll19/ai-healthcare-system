import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Activity, TrendingDown, TrendingUp, Minus, AlertTriangle, Brain, Heart } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const API = 'http://localhost:8000/api/als';

interface SymptomForm {
  muscle_weakness: number;
  speech_clarity: number;
  swallowing_difficulty: number;
  breathing_difficulty: number;
  mobility_score: number;
  fatigue_level: number;
  emotional_state: string;
  notes: string;
}

export default function ALSSymptomTrackerPage() {
  const [symptoms, setSymptoms] = useState<SymptomForm>({
    muscle_weakness: 5, speech_clarity: 5, swallowing_difficulty: 5,
    breathing_difficulty: 5, mobility_score: 5, fatigue_level: 5,
    emotional_state: 'neutral', notes: ''
  });
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [alsfrsScore, setAlsfrsScore] = useState<any>(null);
  const [trends, setTrends] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'record' | 'analysis' | 'history'>('record');

  useEffect(() => { fetchData(); }, []);

  const apiFetch = async (url: string, options?: RequestInit) => {
    const res = await fetch(url, { credentials: 'include', ...options });
    if (!res.ok) throw new Error('API Error');
    return res.json();
  };

  const fetchData = async () => {
    try {
      const [sympData, analysisData] = await Promise.all([
        apiFetch(`${API}/symptoms`),
        apiFetch(`${API}/symptoms/analysis`)
      ]);
      setHistory(sympData.symptoms || []);
      setAiAnalysis(sympData.ai_analysis);
      setAlsfrsScore(sympData.alsfrs_score);
      if (analysisData.trends) setTrends(analysisData.trends);
      if (analysisData.risk_analysis) setAiAnalysis(analysisData.risk_analysis);
    } catch (e) { console.error(e); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiFetch(`${API}/symptoms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(symptoms)
      });
      setAiAnalysis(data.ai_analysis);
      setAlsfrsScore(data.alsfrs_score);
      fetchData();
      setSymptoms({ muscle_weakness: 5, speech_clarity: 5, swallowing_difficulty: 5, breathing_difficulty: 5, mobility_score: 5, fatigue_level: 5, emotional_state: 'neutral', notes: '' });
      setActiveTab('analysis');
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'Rapidly Worsening' || trend === 'Worsening') return <TrendingDown className="w-5 h-5 text-red-400" />;
    if (trend === 'Improving') return <TrendingUp className="w-5 h-5 text-green-400" />;
    return <Minus className="w-5 h-5 text-yellow-400" />;
  };

  const getRiskColor = (level: string) => {
    const map: Record<string, string> = { Low: 'text-green-400', Moderate: 'text-yellow-400', High: 'text-orange-400', Critical: 'text-red-400' };
    return map[level] || 'text-gray-400';
  };

  const getRiskBg = (level: string) => {
    const map: Record<string, string> = { Low: 'risk-low', Moderate: 'risk-moderate', High: 'risk-high', Critical: 'risk-critical' };
    return map[level] || '';
  };

  const getSliderGradient = (value: number, inverted = false) => {
    const pct = inverted ? ((10 - value) / 9) * 100 : ((value - 1) / 9) * 100;
    if (pct < 40) return 'from-green-500 to-green-400';
    if (pct < 70) return 'from-yellow-500 to-orange-400';
    return 'from-orange-500 to-red-500';
  };

  // Chart config
  const chartData = trends ? {
    labels: trends.dates?.map((d: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '') || [],
    datasets: [
      { label: 'Muscle Weakness', data: trends.muscle_weakness, borderColor: '#FF6384', backgroundColor: 'rgba(255,99,132,0.1)', tension: 0.4, fill: false },
      { label: 'Speech Clarity', data: trends.speech_clarity, borderColor: '#36A2EB', backgroundColor: 'rgba(54,162,235,0.1)', tension: 0.4, fill: false },
      { label: 'Breathing', data: trends.breathing_difficulty, borderColor: '#FFCE56', backgroundColor: 'rgba(255,206,86,0.1)', tension: 0.4, fill: false },
      { label: 'Mobility', data: trends.mobility_score, borderColor: '#4BC0C0', backgroundColor: 'rgba(75,192,192,0.1)', tension: 0.4, fill: false },
    ]
  } : null;

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#aaa', usePointStyle: true, padding: 20 } },
      tooltip: { backgroundColor: '#1a1d27', titleColor: '#fff', bodyColor: '#ccc', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1 }
    },
    scales: {
      x: { ticks: { color: '#666' }, grid: { color: 'rgba(255,255,255,0.03)' } },
      y: { min: 1, max: 10, ticks: { color: '#666', stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.03)' } }
    }
  };

  const sliderFields = [
    { key: 'muscle_weakness', label: 'Muscle Weakness', low: 'Minimal', high: 'Severe', icon: '💪', inverted: false },
    { key: 'speech_clarity', label: 'Speech Clarity', low: 'Very Unclear', high: 'Crystal Clear', icon: '🗣️', inverted: true },
    { key: 'swallowing_difficulty', label: 'Swallowing Difficulty', low: 'No Difficulty', high: 'Severe', icon: '🍽️', inverted: false },
    { key: 'breathing_difficulty', label: 'Breathing Difficulty', low: 'Normal', high: 'Very Difficult', icon: '🫁', inverted: false },
    { key: 'mobility_score', label: 'Mobility', low: 'Very Limited', high: 'Full Mobility', icon: '🚶', inverted: true },
    { key: 'fatigue_level', label: 'Fatigue Level', low: 'Energetic', high: 'Extreme Fatigue', icon: '😴', inverted: false },
  ];

  // Risk score gauge
  const riskScore = aiAnalysis?.risk_score || 0;
  const circumference = 2 * Math.PI * 40;
  const dashOffset = circumference - (riskScore / 100) * circumference;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-green-400 to-[#00E5FF] flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </span>
          ALS Symptom Tracker
        </h1>
        <p className="text-gray-400 mt-1">Track symptoms • AI-powered progression analysis • Visual trends</p>
      </div>

      {/* Rapid Decline Warning */}
      {aiAnalysis?.trend === 'Rapidly Worsening' && (
        <div className="glass-card border-red-500/30 animate-pulse-emergency flex items-center gap-4">
          <AlertTriangle className="w-8 h-8 text-red-400 shrink-0" />
          <div>
            <p className="font-bold text-red-400 text-lg">⚠️ Rapid Decline Detected</p>
            <p className="text-gray-300 text-sm">Symptoms show significant worsening. Please consult your neurologist urgently.</p>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 bg-white/3 rounded-xl p-1">
        {(['record', 'analysis', 'history'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all capitalize ${
              activeTab === tab ? 'bg-gradient-to-r from-[#00E5FF]/20 to-[#9D00FF]/20 text-white border border-[#00E5FF]/20' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}>
            {tab === 'record' ? '📝 Record' : tab === 'analysis' ? '🤖 AI Analysis' : '📊 History'}
          </button>
        ))}
      </div>

      {/* === RECORD TAB === */}
      {activeTab === 'record' && (
        <form onSubmit={handleSubmit} className="glass-card space-y-6">
          <h2 className="text-xl font-bold">Record Today's Symptoms</h2>

          {sliderFields.map(field => {
            const val = symptoms[field.key as keyof SymptomForm] as number;
            return (
              <div key={field.key} className="space-y-2">
                <label className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-300 flex items-center gap-2">
                    <span className="text-lg">{field.icon}</span> {field.label}
                  </span>
                  <span className={`text-lg font-bold bg-gradient-to-r ${getSliderGradient(val, field.inverted)} bg-clip-text text-transparent`}>
                    {val}/10
                  </span>
                </label>
                <input type="range" min="1" max="10" value={val}
                  onChange={e => setSymptoms(prev => ({ ...prev, [field.key]: parseInt(e.target.value) }))}
                  aria-label={field.label}
                />
                <div className="flex justify-between text-[10px] text-gray-500">
                  <span>{field.low}</span><span>{field.high}</span>
                </div>
              </div>
            );
          })}

          {/* Emotional State */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">💛 Current Emotional State</label>
            <div className="flex flex-wrap gap-2">
              {['neutral', 'anxious', 'sad', 'frustrated', 'hopeful', 'calm'].map(emotion => (
                <button type="button" key={emotion}
                  onClick={() => setSymptoms(prev => ({ ...prev, emotional_state: emotion }))}
                  className={`px-4 py-2 rounded-lg text-sm capitalize transition-all ${
                    symptoms.emotional_state === emotion
                      ? 'bg-[#00E5FF]/20 border border-[#00E5FF]/40 text-[#00E5FF]'
                      : 'bg-white/5 border border-white/5 text-gray-400 hover:bg-white/10'
                  }`}>
                  {emotion}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="symptom-notes" className="block text-sm font-medium text-gray-300 mb-2">📝 Additional Notes</label>
            <textarea id="symptom-notes" value={symptoms.notes}
              onChange={e => setSymptoms(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF]/30 transition-all resize-none"
              rows={3} placeholder="Any additional observations..." />
          </div>

          <button type="submit" disabled={loading}
            className="als-btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
            <Brain className="w-5 h-5" />
            {loading ? 'Analyzing...' : 'Record & Analyze with AI'}
          </button>
        </form>
      )}

      {/* === ANALYSIS TAB === */}
      {activeTab === 'analysis' && (
        <div className="space-y-6">
          {!aiAnalysis ? (
            <div className="glass-card text-center py-16 text-gray-400">
              <Brain className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg">No analysis data yet</p>
              <p className="text-sm">Record your first symptom entry to see AI analysis.</p>
            </div>
          ) : (
            <>
              {/* Metrics Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Risk Score Gauge */}
                <div className="glass-card flex flex-col items-center">
                  <p className="text-sm text-gray-400 mb-3">Risk Score</p>
                  <div className="relative w-24 h-24">
                    <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                      <circle cx="50" cy="50" r="40" fill="none"
                        stroke={riskScore < 25 ? '#00C853' : riskScore < 45 ? '#FFC107' : riskScore < 65 ? '#FF9800' : '#FF0040'}
                        strokeWidth="8" strokeLinecap="round"
                        strokeDasharray={circumference} strokeDashoffset={dashOffset}
                        style={{ transition: 'stroke-dashoffset 1s ease' }} />
                    </svg>
                    <span className={`absolute inset-0 flex items-center justify-center text-2xl font-bold ${getRiskColor(aiAnalysis.risk_level)}`}>
                      {riskScore.toFixed(0)}
                    </span>
                  </div>
                </div>

                {/* Risk Level */}
                <div className="glass-card flex flex-col items-center justify-center">
                  <p className="text-sm text-gray-400 mb-2">Risk Level</p>
                  <span className={`px-6 py-2 rounded-full font-bold text-lg ${getRiskBg(aiAnalysis.risk_level)}`}>
                    {aiAnalysis.risk_level}
                  </span>
                </div>

                {/* Trend */}
                <div className="glass-card flex flex-col items-center justify-center">
                  <p className="text-sm text-gray-400 mb-2">Trend</p>
                  <div className="flex items-center gap-2 text-lg font-bold">
                    {getTrendIcon(aiAnalysis.trend)}
                    <span>{aiAnalysis.trend}</span>
                  </div>
                  {aiAnalysis.decline_rate !== 0 && (
                    <p className="text-xs text-gray-500 mt-1">Rate: {aiAnalysis.decline_rate > 0 ? '+' : ''}{aiAnalysis.decline_rate}/visit</p>
                  )}
                </div>
              </div>

              {/* ALSFRS Score */}
              {alsfrsScore && (
                <div className="glass-card">
                  <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-400" /> ALSFRS-R Score (Approximate)
                  </h3>
                  <div className="flex items-center gap-4">
                    <span className="text-4xl font-black text-[#00E5FF]">{alsfrsScore.score}</span>
                    <span className="text-gray-400">/ {alsfrsScore.max_score}</span>
                    <span className="ml-auto px-4 py-1 rounded-full text-sm bg-white/5 text-gray-300">{alsfrsScore.interpretation}</span>
                  </div>
                  <div className="mt-3 w-full bg-white/5 rounded-full h-2">
                    <div className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${(alsfrsScore.score / alsfrsScore.max_score) * 100}%` }} />
                  </div>
                </div>
              )}

              {/* AI Recommendations */}
              {aiAnalysis.recommendations?.length > 0 && (
                <div className="glass-card">
                  <h3 className="text-lg font-bold mb-4">💡 AI Recommendations</h3>
                  <div className="space-y-2">
                    {aiAnalysis.recommendations.map((rec: any, idx: number) => (
                      <div key={idx} className={`p-3 rounded-xl flex items-start gap-3 ${
                        rec.priority === 'critical' ? 'bg-red-500/10 border-l-4 border-red-500' :
                        rec.priority === 'high' ? 'bg-orange-500/10 border-l-4 border-orange-500' :
                        rec.priority === 'medium' ? 'bg-yellow-500/10 border-l-4 border-yellow-500' :
                        'bg-white/5 border-l-4 border-gray-600'
                      }`}>
                        <span className="text-white text-sm">{rec.text || rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Progression Chart */}
              {chartData && chartData.labels.length > 0 && (
                <div className="glass-card">
                  <h3 className="text-lg font-bold mb-4">📈 Symptom Progression Over Time</h3>
                  <div className="h-80">
                    <Line data={chartData} options={chartOptions} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* === HISTORY TAB === */}
      {activeTab === 'history' && (
        <div className="glass-card">
          <h2 className="text-xl font-bold mb-4">📊 Symptom History</h2>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {history.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No symptom records yet.</p>
            ) : history.slice(0, 20).map((record: any) => (
              <div key={record.id} className="p-4 rounded-xl bg-white/3 border border-white/5 animate-fade-in">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-gray-400">{new Date(record.created_at).toLocaleString('en-IN')}</span>
                  {record.ai_risk_score != null && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#00E5FF]/10 text-[#00E5FF]">
                      Risk: {typeof record.ai_risk_score === 'number' ? record.ai_risk_score.toFixed(1) : record.ai_risk_score}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3 text-xs">
                  {[
                    { label: 'Muscle', value: record.muscle_weakness, icon: '💪' },
                    { label: 'Speech', value: record.speech_clarity, icon: '🗣️' },
                    { label: 'Swallow', value: record.swallowing_difficulty, icon: '🍽️' },
                    { label: 'Breathing', value: record.breathing_difficulty, icon: '🫁' },
                    { label: 'Mobility', value: record.mobility_score, icon: '🚶' },
                    { label: 'Fatigue', value: record.fatigue_level, icon: '😴' },
                  ].map(item => (
                    <div key={item.label} className="text-center">
                      <span className="text-lg">{item.icon}</span>
                      <p className="text-gray-500">{item.label}</p>
                      <p className="font-bold text-white">{item.value}/10</p>
                    </div>
                  ))}
                </div>
                {record.notes && <p className="mt-2 text-xs text-gray-500 italic">{record.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
