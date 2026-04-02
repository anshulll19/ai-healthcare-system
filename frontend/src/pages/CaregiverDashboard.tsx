import React, { useState, useEffect } from 'react';
import { Shield, Bell, Users, CheckCircle, AlertTriangle, Clock, MessageSquare, Pill, FileText, RefreshCw } from 'lucide-react';

const API = 'http://localhost:8000/api/als';

export default function CaregiverDashboard() {
  const [dashData, setDashData] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');
  const [noteCategory, setNoteCategory] = useState('observation');
  const [medForm, setMedForm] = useState({ medication_name: '', dosage: '', frequency: '', patient_id: 0 });
  const [activeTab, setActiveTab] = useState<'overview' | 'alerts' | 'medications' | 'notes'>('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const apiFetch = async (url: string, options?: RequestInit) => {
    const res = await fetch(url, { credentials: 'include', ...options });
    if (!res.ok) throw new Error('API Error');
    return res.json();
  };

  const fetchAll = async () => {
    try {
      const [dash, alertsData] = await Promise.all([
        apiFetch(`${API}/caregiver/dashboard`),
        apiFetch(`${API}/emergency/alerts`)
      ]);
      setDashData(dash);
      setAlerts(alertsData.alerts || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
    const interval = autoRefresh ? setInterval(fetchAll, 5000) : undefined;
    return () => { if (interval) clearInterval(interval); };
  }, [autoRefresh]);

  const resolveAlert = async (alertId: number) => {
    try {
      await apiFetch(`${API}/emergency/alert/${alertId}/resolve`, { method: 'PUT' });
      fetchAll();
    } catch (e) { console.error(e); }
  };

  const addNote = async () => {
    if (!noteText.trim() || !selectedPatient) return;
    try {
      await apiFetch(`${API}/caregiver/notes`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient_id: selectedPatient, note_text: noteText, category: noteCategory })
      });
      setNoteText('');
      fetchAll();
    } catch (e) { console.error(e); }
  };

  const addMedication = async () => {
    if (!medForm.medication_name || !selectedPatient) return;
    try {
      await apiFetch(`${API}/medications`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...medForm, patient_id: selectedPatient })
      });
      setMedForm({ medication_name: '', dosage: '', frequency: '', patient_id: 0 });
      fetchAll();
    } catch (e) { console.error(e); }
  };

  const stats = dashData?.stats || {};
  const patients = dashData?.patients || [];
  const unresolvedAlerts = alerts.filter(a => !a.resolved);

  const getRiskColor = (level: string) => {
    const map: Record<string, string> = { Low: 'text-green-400', Moderate: 'text-yellow-400', High: 'text-orange-400', Critical: 'text-red-400' };
    return map[level] || 'text-gray-400';
  };

  const getRiskBg = (level: string) => {
    const map: Record<string, string> = { Low: 'bg-green-500/10 border-green-500/20', Moderate: 'bg-yellow-500/10 border-yellow-500/20', High: 'bg-orange-500/10 border-orange-500/20', Critical: 'bg-red-500/10 border-red-500/20' };
    return map[level] || 'bg-white/5';
  };

  const getAlertIcon = (type: string) => {
    const map: Record<string, string> = { pain: '🔴', breathing: '🫁', fall: '⚠️', help: '🆘', medication: '💊', general: '🚨' };
    return map[type] || '🚨';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-[#00E5FF] animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading caregiver dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-[#FF007F] flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </span>
            Caregiver Dashboard
          </h1>
          <p className="text-gray-400 mt-1">Monitor patients • Manage alerts • AI care suggestions</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${autoRefresh ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-white/5 text-gray-400 border border-white/10'}`}>
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Live' : 'Paused'}
          </button>
          <button onClick={fetchAll} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-all text-sm">
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Users className="w-6 h-6 text-[#00E5FF]" />} label="Total Patients" value={stats.total_patients || 0} bg="bg-[#00E5FF]/10" />
        <StatCard icon={<Bell className={`w-6 h-6 ${unresolvedAlerts.length > 0 ? 'text-red-400 animate-pulse' : 'text-gray-400'}`} />}
          label="Active Alerts" value={unresolvedAlerts.length} bg={unresolvedAlerts.length > 0 ? 'bg-red-500/10' : 'bg-white/5'} />
        <StatCard icon={<AlertTriangle className="w-6 h-6 text-orange-400" />} label="Critical Patients" value={stats.critical_patients || 0} bg="bg-orange-500/10" />
        <StatCard icon={<CheckCircle className="w-6 h-6 text-green-400" />} label="Stable Patients"
          value={(stats.total_patients || 0) - (stats.critical_patients || 0)} bg="bg-green-500/10" />
      </div>

      {/* Active Alerts Banner */}
      {unresolvedAlerts.length > 0 && (
        <div className="glass-card border-red-500/30 animate-pulse-emergency">
          <h2 className="text-lg font-bold text-red-400 mb-3 flex items-center gap-2">
            <Bell className="w-5 h-5" /> Active Emergency Alerts ({unresolvedAlerts.length})
          </h2>
          <div className="space-y-2">
            {unresolvedAlerts.slice(0, 5).map(alert => (
              <div key={alert.id} className="flex items-center justify-between p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getAlertIcon(alert.alert_type)}</span>
                  <div>
                    <p className="font-medium text-white">{alert.patient_name || 'Patient'} — <span className="capitalize text-red-400">{alert.alert_type}</span></p>
                    <p className="text-xs text-gray-400">{new Date(alert.created_at).toLocaleString('en-IN')} • Urgency: {alert.urgency_level}/5</p>
                  </div>
                </div>
                <button onClick={() => resolveAlert(alert.id)}
                  className="px-4 py-2 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all text-sm font-medium">
                  ✓ Resolve
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 bg-white/3 rounded-xl p-1">
        {([
          { key: 'overview', label: '👥 Patients', icon: Users },
          { key: 'alerts', label: '🔔 Alerts', icon: Bell },
          { key: 'medications', label: '💊 Medications', icon: Pill },
          { key: 'notes', label: '📝 Notes', icon: FileText },
        ] as const).map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
              activeTab === tab.key ? 'bg-gradient-to-r from-[#FF007F]/20 to-[#9D00FF]/20 text-white border border-[#FF007F]/20' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* === PATIENTS OVERVIEW === */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {patients.length === 0 ? (
            <div className="glass-card text-center py-16 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg">No patients registered yet</p>
            </div>
          ) : patients.map((p: any) => (
            <div key={p.patient.id} className={`glass-card border ${getRiskBg(p.risk_analysis?.risk_level || 'Unknown')} transition-all hover:shadow-lg`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{p.patient.name}</h3>
                  <p className="text-xs text-gray-400">{p.patient.email} • Joined {new Date(p.patient.created_at).toLocaleDateString('en-IN')}</p>
                </div>
                <div className="flex items-center gap-3">
                  {p.active_alerts > 0 && (
                    <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold flex items-center gap-1">
                      <Bell className="w-3 h-3" /> {p.active_alerts} Alert{p.active_alerts > 1 ? 's' : ''}
                    </span>
                  )}
                  {p.risk_analysis && (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRiskBg(p.risk_analysis.risk_level)} ${getRiskColor(p.risk_analysis.risk_level)}`}>
                      {p.risk_analysis.risk_level} Risk
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Symptom Summary */}
              {p.latest_symptoms && (
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4 text-xs">
                  {[
                    { label: 'Muscle', val: p.latest_symptoms.muscle_weakness, icon: '💪' },
                    { label: 'Speech', val: p.latest_symptoms.speech_clarity, icon: '🗣️' },
                    { label: 'Swallow', val: p.latest_symptoms.swallowing_difficulty, icon: '🍽️' },
                    { label: 'Breathing', val: p.latest_symptoms.breathing_difficulty, icon: '🫁' },
                    { label: 'Mobility', val: p.latest_symptoms.mobility_score, icon: '🚶' },
                    { label: 'Fatigue', val: p.latest_symptoms.fatigue_level, icon: '😴' },
                  ].map(s => (
                    <div key={s.label} className="text-center p-2 rounded-lg bg-white/3">
                      <span className="text-base">{s.icon}</span>
                      <p className="text-gray-500 mt-1">{s.label}</p>
                      <p className="font-bold text-white">{s.val}/10</p>
                    </div>
                  ))}
                </div>
              )}

              {/* AI Care Suggestions */}
              {p.care_suggestions?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/5">
                  <p className="text-xs text-gray-400 mb-2 font-medium">🤖 AI Care Suggestions:</p>
                  <div className="flex flex-wrap gap-2">
                    {p.care_suggestions.slice(0, 3).map((s: any, i: number) => (
                      <span key={i} className={`text-xs px-3 py-1 rounded-full ${
                        s.priority === 'high' ? 'bg-orange-500/10 text-orange-300' : 'bg-white/5 text-gray-400'
                      }`}>
                        {s.text.substring(0, 80)}{s.text.length > 80 ? '...' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Messages */}
              {p.recent_messages?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/5">
                  <p className="text-xs text-gray-400 mb-2 font-medium flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Recent Messages:</p>
                  {p.recent_messages.slice(0, 2).map((m: any) => (
                    <p key={m.id} className={`text-xs py-1 ${m.is_emergency ? 'text-red-400' : 'text-gray-300'}`}>
                      {m.is_emergency ? '🚨 ' : '💬 '}{m.message_text} <span className="text-gray-500">— {new Date(m.created_at).toLocaleTimeString('en-IN')}</span>
                    </p>
                  ))}
                </div>
              )}

              <button onClick={() => setSelectedPatient(p.patient.id)}
                className="mt-3 w-full py-2 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all text-sm">
                Select Patient for Notes/Medications
              </button>
            </div>
          ))}
        </div>
      )}

      {/* === ALERTS TAB === */}
      {activeTab === 'alerts' && (
        <div className="glass-card">
          <h2 className="text-xl font-bold mb-4">🔔 All Emergency Alerts</h2>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {alerts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No alerts</p>
            ) : alerts.map(alert => (
              <div key={alert.id} className={`p-4 rounded-xl flex items-center justify-between ${
                alert.resolved ? 'bg-white/3 opacity-50' : 'bg-red-500/5 border border-red-500/10'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getAlertIcon(alert.alert_type)}</span>
                  <div>
                    <p className="font-medium text-white">{alert.patient_name || `Patient #${alert.user_id}`} — <span className="capitalize">{alert.alert_type}</span></p>
                    <p className="text-xs text-gray-400">
                      {new Date(alert.created_at).toLocaleString('en-IN')} • Urgency: {alert.urgency_level}/5
                      {alert.response_time_seconds && ` • Resolved in ${Math.round(alert.response_time_seconds / 60)}min`}
                    </p>
                  </div>
                </div>
                {!alert.resolved ? (
                  <button onClick={() => resolveAlert(alert.id)}
                    className="px-4 py-2 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all text-sm font-medium shrink-0">
                    ✓ Resolve
                  </button>
                ) : (
                  <span className="text-xs text-green-400/50">Resolved</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === MEDICATIONS TAB === */}
      {activeTab === 'medications' && (
        <div className="glass-card">
          <h2 className="text-xl font-bold mb-4">💊 Medication Management</h2>
          {selectedPatient ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-400">Adding medication for Patient #{selectedPatient}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input type="text" placeholder="Medication name (e.g. Riluzole)" value={medForm.medication_name}
                  onChange={e => setMedForm(prev => ({ ...prev, medication_name: e.target.value }))}
                  className="p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF]/30" />
                <input type="text" placeholder="Dosage (e.g. 50mg)" value={medForm.dosage}
                  onChange={e => setMedForm(prev => ({ ...prev, dosage: e.target.value }))}
                  className="p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF]/30" />
                <input type="text" placeholder="Frequency (e.g. twice daily)" value={medForm.frequency}
                  onChange={e => setMedForm(prev => ({ ...prev, frequency: e.target.value }))}
                  className="p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF]/30" />
              </div>
              <button onClick={addMedication} className="als-btn-primary flex items-center gap-2">
                <Pill className="w-5 h-5" /> Add Medication
              </button>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Select a patient from the Patients tab first.</p>
          )}
        </div>
      )}

      {/* === NOTES TAB === */}
      {activeTab === 'notes' && (
        <div className="glass-card">
          <h2 className="text-xl font-bold mb-4">📝 Caregiver Notes</h2>
          {selectedPatient ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-400">Adding note for Patient #{selectedPatient}</p>
              <div className="flex gap-2 mb-3">
                {['observation', 'concern', 'milestone'].map(cat => (
                  <button key={cat} onClick={() => setNoteCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-sm capitalize transition-all ${
                      noteCategory === cat ? 'bg-[#FF007F]/20 text-[#FF007F] border border-[#FF007F]/30' : 'bg-white/5 text-gray-400 border border-white/5'
                    }`}>
                    {cat}
                  </button>
                ))}
              </div>
              <textarea value={noteText} onChange={e => setNoteText(e.target.value)}
                placeholder="Write your observation, concern, or milestone..."
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#FF007F]/30 resize-none"
                rows={4} />
              <button onClick={addNote} className="als-btn-primary flex items-center gap-2">
                <FileText className="w-5 h-5" /> Save Note
              </button>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Select a patient from the Patients tab first.</p>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, bg }: { icon: React.ReactNode; label: string; value: number; bg: string }) {
  return (
    <div className="glass-card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg}`}>{icon}</div>
      <div>
        <p className="text-gray-400 text-xs">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}
