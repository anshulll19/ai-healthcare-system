import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, Send, AlertTriangle, Clock, MessageSquare } from 'lucide-react';

const API = 'http://localhost:8000/api/als';

interface Prediction {
  text: string;
  category: string;
  confidence: number;
}

interface QuickPhraseCategory {
  icon: string;
  color: string;
  phrases: string[];
}

interface Message {
  id: number;
  message_text: string;
  is_emergency: boolean;
  message_type: string;
  created_at: string;
  spoken_via_tts: boolean;
}

export default function ALSCommunicationPage() {
  const [partialText, setPartialText] = useState('');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [quickPhrases, setQuickPhrases] = useState<Record<string, QuickPhraseCategory>>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchQuickPhrases();
    fetchMessages();
  }, []);

  const apiFetch = async (url: string, options?: RequestInit) => {
    const res = await fetch(url, { credentials: 'include', ...options });
    if (!res.ok) throw new Error('API Error');
    return res.json();
  };

  const fetchQuickPhrases = async () => {
    try {
      const data = await apiFetch(`${API}/communication/quick-phrases`);
      setQuickPhrases(data.quick_phrases || {});
    } catch (e) { console.error(e); }
  };

  const fetchMessages = async () => {
    try {
      const data = await apiFetch(`${API}/communication/messages`);
      setMessages(data.messages || []);
    } catch (e) { console.error(e); }
  };

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setPartialText(text);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (text.length >= 2) {
      debounceRef.current = setTimeout(async () => {
        try {
          const data = await apiFetch(`${API}/communication/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ partial_text: text })
          });
          setPredictions(data.predictions || []);
        } catch (e) { console.error(e); }
      }, 150);
    } else {
      setPredictions([]);
    }
  }, []);

  const speakText = (text: string) => {
    if (!text || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const saveMessage = async (text: string, isEmergency: boolean, type: string = 'text') => {
    if (!text.trim()) return;
    try {
      await apiFetch(`${API}/communication/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_text: text, is_emergency: isEmergency, message_type: type, spoken_via_tts: true })
      });
      speakText(text);
      setPartialText('');
      setPredictions([]);
      fetchMessages();
    } catch (e) { console.error(e); }
  };

  const handleSOS = async (alertType: string = 'general') => {
    setSosActive(true);
    try {
      const data = await apiFetch(`${API}/emergency/alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alert_type: alertType, urgency_level: 5 })
      });
      speakText(data.emergency_message || 'Emergency! Help needed!');
      await saveMessage(`🚨 EMERGENCY: ${alertType.toUpperCase()}`, true, 'emergency');
    } catch (e) { console.error(e); }
    setTimeout(() => setSosActive(false), 3000);
  };

  const phraseColorMap: Record<string, string> = {
    pain: 'phrase-btn-red', water: 'phrase-btn-blue', bathroom: 'phrase-btn-purple',
    help: 'phrase-btn-orange', medication: 'phrase-btn-green', breathing: 'phrase-btn-red',
    comfort: 'phrase-btn-teal', food: 'phrase-btn-amber', emotional: 'phrase-btn-yellow',
    family: 'phrase-btn-pink', medical: 'phrase-btn-cyan', tired: 'phrase-btn-indigo'
  };

  const categories = Object.keys(quickPhrases);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00E5FF] to-[#9D00FF] flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </span>
            Communication Assistant
          </h1>
          <p className="text-gray-400 mt-1">AI-powered text prediction • Tap to speak • Quick access phrases</p>
        </div>
        <button onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-all">
          <Clock className="w-4 h-4" /> {showHistory ? 'Hide' : 'Show'} History
        </button>
      </div>

      {/* === EMERGENCY SOS PANEL === */}
      <div className={`glass-card border-red-500/30 transition-all ${sosActive ? 'animate-pulse-emergency' : ''}`}>
        <h2 className="text-lg font-bold text-red-400 mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" /> Emergency Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { type: 'pain', label: '🔴 PAIN', desc: 'Severe pain alert' },
            { type: 'breathing', label: '🫁 BREATHING', desc: 'Breathing emergency' },
            { type: 'fall', label: '⚠️ FALL', desc: 'Patient has fallen' },
            { type: 'help', label: '🆘 HELP', desc: 'Need immediate help' },
          ].map(sos => (
            <button key={sos.type} onClick={() => handleSOS(sos.type)}
              className="als-btn-danger text-center flex flex-col items-center gap-1"
              aria-label={`Emergency: ${sos.type}`}>
              <span className="text-xl font-black">{sos.label}</span>
              <span className="text-xs opacity-80">{sos.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* === MAIN INPUT AREA === */}
      <div className="glass-card">
        <label htmlFor="comm-input" className="block text-sm font-medium text-gray-400 mb-2">
          Type your message — AI will suggest completions:
        </label>
        <textarea
          id="comm-input"
          ref={textareaRef}
          value={partialText}
          onChange={handleTextChange}
          className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white text-lg placeholder-gray-500 focus:outline-none focus:border-[#00E5FF]/50 focus:shadow-[0_0_15px_rgba(0,229,255,0.15)] transition-all resize-none"
          rows={3}
          placeholder="Start typing... AI will suggest completions"
          aria-label="Message input"
        />

        {/* AI Predictions */}
        {predictions.length > 0 && (
          <div className="mt-3 space-y-2 animate-fade-in">
            <p className="text-xs font-medium text-gray-400 flex items-center gap-1">
              ✨ AI Suggestions — tap to speak:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {predictions.map((pred, idx) => (
                <button key={idx}
                  onClick={() => { setPartialText(pred.text); saveMessage(pred.text, false, 'predicted'); }}
                  className="text-left p-3 rounded-xl bg-[#00E5FF]/5 border border-[#00E5FF]/20 hover:bg-[#00E5FF]/10 hover:border-[#00E5FF]/40 transition-all group">
                  <span className="font-medium text-white group-hover:text-[#00E5FF] transition-colors">{pred.text}</span>
                  <span className="ml-2 text-xs text-gray-500">
                    {(pred.confidence * 100).toFixed(0)}%
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          <button onClick={() => saveMessage(partialText, false)}
            disabled={!partialText.trim()}
            className="als-btn-primary flex items-center gap-2 flex-1 justify-center disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none">
            <Send className="w-5 h-5" />
            Send & Speak
          </button>
          <button onClick={() => speakText(partialText)}
            disabled={!partialText.trim() || isSpeaking}
            className="als-btn flex items-center gap-2 bg-white/10 border border-white/10 text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed">
            <Volume2 className={`w-5 h-5 ${isSpeaking ? 'text-[#00E5FF] animate-pulse' : ''}`} />
            {isSpeaking ? 'Speaking...' : 'Speak Only'}
          </button>
        </div>
      </div>

      {/* === QUICK PHRASES === */}
      <div className="glass-card">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          ⚡ Quick Phrases
          <span className="text-xs font-normal text-gray-400">— tap any phrase to speak it aloud</span>
        </h2>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-white/5">
          <button onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === 'all' ? 'bg-gradient-to-r from-[#00E5FF] to-[#9D00FF] text-white shadow-lg' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}>
            All
          </button>
          {categories.map(cat => {
            const catData = quickPhrases[cat];
            return (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all capitalize ${
                  selectedCategory === cat ? 'bg-gradient-to-r from-[#00E5FF] to-[#9D00FF] text-white shadow-lg' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}>
                {catData?.icon} {cat}
              </button>
            );
          })}
        </div>

        {/* Phrase Buttons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(quickPhrases)
            .filter(([category]) => selectedCategory === 'all' || selectedCategory === category)
            .flatMap(([category, data]) =>
              data.phrases.map((phrase, idx) => (
                <button key={`${category}-${idx}`}
                  onClick={() => saveMessage(phrase, category === 'pain' || category === 'breathing', 'quick_phrase')}
                  className={`phrase-btn ${phraseColorMap[category] || 'phrase-btn-blue'} group`}
                  aria-label={`Quick phrase: ${phrase}`}>
                  <div className="text-xs uppercase text-gray-500 mb-1 flex items-center gap-1">
                    <span>{data.icon}</span> {category}
                  </div>
                  <div className="font-medium text-white group-hover:translate-x-1 transition-transform">{phrase}</div>
                </button>
              ))
            )}
        </div>
      </div>

      {/* === MESSAGE HISTORY === */}
      {showHistory && (
        <div className="glass-card animate-fade-in">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#00E5FF]" />
            Recent Messages
          </h2>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {messages.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No messages yet. Start communicating above.</p>
            ) : messages.map((msg) => (
              <div key={msg.id}
                className={`p-3 rounded-xl animate-fade-in ${
                  msg.is_emergency
                    ? 'bg-red-500/10 border-l-4 border-red-500'
                    : 'bg-white/3 border-l-4 border-[#00E5FF]/30'
                }`}>
                <div className="flex justify-between items-start gap-2">
                  <p className="text-white text-sm">{msg.message_text}</p>
                  <div className="flex items-center gap-2 shrink-0">
                    {msg.is_emergency && (
                      <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] rounded-full font-bold">SOS</span>
                    )}
                    {msg.spoken_via_tts && <Volume2 className="w-3 h-3 text-gray-500" />}
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  {new Date(msg.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
