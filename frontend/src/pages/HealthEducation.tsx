import React, { useState, useEffect } from 'react';
import { BookOpen, Globe, ChevronDown, ChevronUp, Search, Heart, ExternalLink } from 'lucide-react';

const API = 'http://localhost:8000/api/als';

interface TopicContent {
  title: string;
  icon: string;
  content: string;
}

export default function HealthEducation() {
  const [topics, setTopics] = useState<any[]>([]);
  const [alsInfo, setAlsInfo] = useState<Record<string, TopicContent>>({});
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [level, setLevel] = useState<'simple' | 'detailed'>('simple');
  const [expandedTopic, setExpandedTopic] = useState<string | null>('what_is_als');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const apiFetch = async (url: string, options?: RequestInit) => {
    const res = await fetch(url, { credentials: 'include', ...options });
    if (!res.ok) throw new Error('API Error');
    return res.json();
  };

  useEffect(() => { fetchTopics(); }, [lang, level]);

  const fetchTopics = async () => {
    try {
      const [topicsData, infoData] = await Promise.all([
        apiFetch(`${API}/education/topics?lang=${lang}`),
        apiFetch(`${API}/education/als-info?lang=${lang}&level=${level}`)
      ]);
      setTopics(topicsData.topics || []);
      setAlsInfo(infoData.als_information || {});
    } catch (e) { console.error(e); }
  };

  const searchMedicalTerm = async () => {
    if (!searchTerm.trim()) return;
    setSearchLoading(true);
    try {
      const data = await apiFetch(`${API}/education/explain`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ term: searchTerm, simple: level === 'simple', lang })
      });
      setSearchResult(data.explanation);
    } catch (e) { console.error(e); }
    setSearchLoading(false);
  };

  // Additional static content for treatments and clinical trials (displayed inline)
  const treatmentCards = [
    {
      name: 'Riluzole',
      type: 'FDA-Approved',
      desc: lang === 'en' ? 'First approved ALS drug. Slows progression by reducing glutamate (brain chemical) damage. Taken as tablet twice daily.'
        : 'पहली FDA-स्वीकृत ALS दवा। ग्लूटामेट क्षति को कम करके प्रगति को धीमा करती है।',
      dosage: '50mg twice daily',
      sideEffects: 'Nausea, fatigue, dizziness, liver enzyme changes',
      color: 'from-blue-500/20 to-cyan-500/20',
      border: 'border-blue-500/20'
    },
    {
      name: 'Edaravone (Radicava)',
      type: 'FDA-Approved',
      desc: lang === 'en' ? 'Protects nerve cells from oxidative damage. May slow decline in daily functioning. Available as IV or oral formulation.'
        : 'ऑक्सीडेटिव क्षति से तंत्रिका कोशिकाओं की रक्षा करती है। दैनिक कामकाज में गिरावट को धीमा कर सकती है।',
      dosage: '60mg daily (IV cycles) or oral',
      sideEffects: 'Bruising, gait disturbance, headache',
      color: 'from-purple-500/20 to-pink-500/20',
      border: 'border-purple-500/20'
    },
    {
      name: 'AMX0035 (Relyvrio)',
      type: 'FDA-Approved',
      desc: lang === 'en' ? 'Newer treatment targeting mitochondrial and ER stress pathways. Taken as oral suspension dissolved in water.'
        : 'माइटोकॉन्ड्रियल और ER तनाव मार्गों को लक्षित करने वाला नया उपचार।',
      dosage: 'Oral suspension, twice daily',
      sideEffects: 'Diarrhea, nausea, upper respiratory infection',
      color: 'from-green-500/20 to-emerald-500/20',
      border: 'border-green-500/20'
    }
  ];

  const supportResources = [
    { name: lang === 'en' ? 'ALS Association India' : 'ALS एसोसिएशन इंडिया', url: '#', desc: lang === 'en' ? 'Patient support, resources, and advocacy' : 'रोगी सहायता और संसाधन' },
    { name: lang === 'en' ? 'Vandrevala Foundation Helpline' : 'वंद्रेवाला फाउंडेशन हेल्पलाइन', url: 'tel:18002662345', desc: '1860-2662-345 (24/7)' },
    { name: lang === 'en' ? 'NIMHANS Helpline' : 'निमहांस हेल्पलाइन', url: 'tel:08046110007', desc: '080-46110007' },
    { name: lang === 'en' ? 'Clinical Trials Registry India' : 'क्लिनिकल ट्रायल रजिस्ट्री इंडिया', url: 'http://ctri.nic.in', desc: lang === 'en' ? 'Search for active ALS clinical trials in India' : 'भारत में सक्रिय ALS परीक्षण खोजें' },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </span>
            {lang === 'en' ? 'ALS Health Education' : 'ALS स्वास्थ्य शिक्षा'}
          </h1>
          <p className="text-gray-400 mt-1">
            {lang === 'en' ? 'Learn about ALS • Treatments • Emotional support • Clinical trials' : 'ALS के बारे में जानें • उपचार • भावनात्मक सहायता'}
          </p>
        </div>

        {/* Language & Level Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white/5 rounded-xl border border-white/10 p-1">
            <button onClick={() => setLang('en')}
              className={`px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-1 ${lang === 'en' ? 'bg-white/10 text-white' : 'text-gray-400'}`}>
              <Globe className="w-4 h-4" /> English
            </button>
            <button onClick={() => setLang('hi')}
              className={`px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-1 ${lang === 'hi' ? 'bg-white/10 text-white' : 'text-gray-400'}`}>
              <Globe className="w-4 h-4" /> हिंदी
            </button>
          </div>
          <div className="flex items-center bg-white/5 rounded-xl border border-white/10 p-1">
            <button onClick={() => setLevel('simple')}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${level === 'simple' ? 'bg-amber-500/20 text-amber-300' : 'text-gray-400'}`}>
              {lang === 'en' ? 'Simple' : 'सरल'}
            </button>
            <button onClick={() => setLevel('detailed')}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${level === 'detailed' ? 'bg-amber-500/20 text-amber-300' : 'text-gray-400'}`}>
              {lang === 'en' ? 'Detailed' : 'विस्तृत'}
            </button>
          </div>
        </div>
      </div>

      {/* Medical Term Search */}
      <div className="glass-card">
        <h2 className="text-sm font-medium text-gray-400 mb-2">
          🔍 {lang === 'en' ? 'Search Medical Terms' : 'चिकित्सा शब्द खोजें'}
        </h2>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input type="text" value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchMedicalTerm()}
              placeholder={lang === 'en' ? 'e.g. Riluzole, Dysphagia, BiPAP, Motor Neuron...' : 'जैसे: रिलुज़ोल, डिस्फेगिया...'}
              className="w-full p-3 pl-10 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/30" />
          </div>
          <button onClick={searchMedicalTerm} disabled={searchLoading}
            className="px-6 py-3 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-all font-medium disabled:opacity-50">
            {searchLoading ? '...' : lang === 'en' ? 'Explain' : 'समझाएं'}
          </button>
        </div>
        {searchResult && (
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{searchResult.icon}</span>
              <h3 className="font-bold text-amber-300">{searchResult.title}</h3>
            </div>
            <p className="text-gray-300 whitespace-pre-line leading-relaxed">{searchResult.text}</p>
          </div>
        )}
      </div>

      {/* ALS Topics Accordion */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold flex items-center gap-2">
          📚 {lang === 'en' ? 'Understanding ALS' : 'ALS को समझना'}
        </h2>
        {Object.entries(alsInfo).map(([key, info]) => (
          <div key={key} className="glass-card glass-card-hover cursor-pointer transition-all"
            onClick={() => setExpandedTopic(expandedTopic === key ? null : key)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{info.icon}</span>
                <h3 className="font-bold text-white text-lg">{info.title}</h3>
              </div>
              {expandedTopic === key ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </div>
            {expandedTopic === key && (
              <div className="mt-4 pt-4 border-t border-white/5 animate-fade-in">
                <p className="text-gray-300 whitespace-pre-line leading-relaxed text-sm">{info.content}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Treatment Cards */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold flex items-center gap-2">
          💊 {lang === 'en' ? 'Current ALS Treatments' : 'वर्तमान ALS उपचार'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {treatmentCards.map(drug => (
            <div key={drug.name} className={`glass-card bg-gradient-to-br ${drug.color} border ${drug.border}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-white text-lg">{drug.name}</h3>
                <span className="px-2 py-1 rounded-full bg-white/10 text-xs text-gray-300">{drug.type}</span>
              </div>
              <p className="text-gray-300 text-sm mb-4 leading-relaxed">{drug.desc}</p>
              <div className="space-y-2 text-xs">
                <div className="flex gap-2">
                  <span className="text-gray-500 shrink-0">{lang === 'en' ? 'Dosage:' : 'खुराक:'}</span>
                  <span className="text-white">{drug.dosage}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-500 shrink-0">{lang === 'en' ? 'Side Effects:' : 'दुष्प्रभाव:'}</span>
                  <span className="text-gray-400">{drug.sideEffects}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emotional Support & Resources */}
      <div className="glass-card">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Heart className="w-5 h-5 text-pink-400" />
          {lang === 'en' ? 'Support Resources' : 'सहायता संसाधन'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {supportResources.map((r, idx) => (
            <a key={idx} href={r.url} target="_blank" rel="noopener noreferrer"
              className="p-4 rounded-xl bg-white/3 border border-white/5 hover:bg-white/6 hover:border-white/10 transition-all group flex items-center justify-between">
              <div>
                <p className="font-medium text-white group-hover:text-pink-300 transition-colors">{r.name}</p>
                <p className="text-xs text-gray-400">{r.desc}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-pink-400 transition-colors shrink-0" />
            </a>
          ))}
        </div>

        {/* Emotional support message */}
        <div className="mt-6 p-5 rounded-xl bg-gradient-to-r from-pink-500/5 to-purple-500/5 border border-pink-500/10">
          <p className="text-white font-medium mb-2">
            {lang === 'en' ? '💛 You are not alone' : '💛 आप अकेले नहीं हैं'}
          </p>
          <p className="text-gray-300 text-sm leading-relaxed">
            {lang === 'en'
              ? 'Living with ALS is one of the most challenging journeys anyone can face. It\'s okay to feel scared, angry, or sad. Your feelings are valid. Remember — asking for help is a sign of strength, not weakness. Every moment matters, and you matter.'
              : 'ALS के साथ जीना सबसे चुनौतीपूर्ण यात्राओं में से एक है। डरना, गुस्सा होना या उदास होना ठीक है। आपकी भावनाएं मान्य हैं। याद रखें — मदद मांगना ताकत की निशानी है, कमजोरी की नहीं।'}
          </p>
        </div>
      </div>
    </div>
  );
}
