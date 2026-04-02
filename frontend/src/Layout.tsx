import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import {
  MessageSquare, Activity, BookOpen, Shield, Search,
  Bell, LogOut, AlertTriangle, Brain, LayoutDashboard, Users, Clock
} from 'lucide-react';

export default function Layout({ role }: { role: string | null }) {
  const navigate = useNavigate();
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    const checkAlerts = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/als/emergency/alerts', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setAlertCount((data.alerts || []).filter((a: any) => !a.resolved).length);
        }
      } catch (e) {}
    };
    checkAlerts();
    const interval = setInterval(checkAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8000/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (e) {}
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  const isCaregiver = role === 'admin' || role === 'caregiver';

  const patientNav = [
    { name: 'Home', icon: LayoutDashboard, path: '/' },
    { name: 'Communicate', icon: MessageSquare, path: '/communicate' },
    { name: 'Symptoms', icon: Activity, path: '/symptoms' },
    { name: 'Education', icon: BookOpen, path: '/education' },
  ];

  const caregiverNav = [
    { name: 'Dashboard', icon: Shield, path: '/' },
    { name: 'Patients', icon: Users, path: '/admin' },
    { name: 'Logs', icon: Clock, path: '/logs' },
  ];

  const navItems = isCaregiver ? caregiverNav : patientNav;

  return (
    <div className="min-h-screen bg-[#060910] text-[#ecedf6] flex font-sans">

      {/* Sidebar */}
      <aside className="w-72 border-r border-white/5 bg-[#0a0d14] hidden md:flex flex-col">
        {/* Brand */}
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00E5FF] to-[#9D00FF] flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.4)]">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-black text-xl tracking-tight bg-gradient-to-r from-[#00E5FF] to-[#9D00FF] bg-clip-text text-transparent">
              NeuroVoice
            </span>
            <p className="text-[10px] text-gray-500 -mt-0.5">ALS AI Assistant</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 pt-6 px-3 space-y-1">
          <p className="px-3 text-[10px] uppercase tracking-widest text-gray-500 mb-3">
            {isCaregiver ? 'Caregiver' : 'Patient'} Menu
          </p>
          {navItems.map((item) => (
            <NavLink key={item.name} to={item.path} end={item.path === '/'}
              className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-white/8 text-white shadow-[0_0_20px_rgba(0,229,255,0.05)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/4'
              }`}>
              {({ isActive }) => (
                <>
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-[#00E5FF]' : ''}`} />
                  <span className="font-medium text-sm">{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Emergency SOS Button (Patient only) */}
        {!isCaregiver && (
          <div className="p-4 mx-3 mb-2">
            <Link to="/communicate"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF0040] to-[#FF4444] text-white font-black text-lg shadow-[0_0_25px_rgba(255,0,64,0.4)] hover:shadow-[0_0_35px_rgba(255,0,64,0.6)] hover:scale-[1.02] transition-all flex items-center justify-center gap-2 animate-pulse-emergency">
              <AlertTriangle className="w-6 h-6" />
              SOS
            </Link>
          </div>
        )}

        {/* User & Logout */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#00E5FF] to-[#9D00FF] flex items-center justify-center text-sm font-bold shadow-lg">
              {(localStorage.getItem('user_name') || 'U')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{localStorage.getItem('user_name') || 'User'}</p>
              <p className="text-[10px] text-gray-500 capitalize">{role}</p>
            </div>
            <button onClick={handleLogout}
              className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all"
              title="Logout" aria-label="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Subtle Grid Background */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(0, 229, 255, 0.03) 1px, transparent 1px)',
            backgroundSize: '32px 32px'
          }} />

        {/* Top Header */}
        <header className="h-16 border-b border-white/5 bg-[#060910]/80 backdrop-blur-xl flex items-center justify-between px-6 relative z-10">
          {/* Mobile Brand */}
          <div className="flex items-center gap-2 md:hidden">
            <Brain className="w-6 h-6 text-[#00E5FF]" />
            <span className="font-black text-lg bg-gradient-to-r from-[#00E5FF] to-[#9D00FF] bg-clip-text text-transparent">NeuroVoice</span>
          </div>

          <div className="hidden md:block" />

          <div className="flex items-center gap-4">
            {/* Alert Badge */}
            <button className="relative text-gray-400 hover:text-white transition-colors p-2" aria-label="Notifications">
              <Bell className="w-5 h-5" />
              {alertCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-[0_0_10px_rgba(255,0,64,0.6)] animate-pulse">
                  {alertCount}
                </span>
              )}
            </button>

            {/* Mobile Nav */}
            <div className="flex md:hidden gap-2">
              {navItems.map(item => (
                <NavLink key={item.name} to={item.path} end={item.path === '/'}
                  className={({ isActive }) => `p-2 rounded-lg transition-all ${isActive ? 'text-[#00E5FF] bg-white/5' : 'text-gray-500'}`}
                  aria-label={item.name}>
                  <item.icon className="w-5 h-5" />
                </NavLink>
              ))}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 md:p-8 relative z-10 flex-1 overflow-y-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
