import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Activity, 
  FileText,
  Search,
  Bell,
  HelpCircle,
  Database
} from 'lucide-react';

// Reusable StatCard with Glassmorphism
const StatCard = ({ title, value, trend, trendUp, children }: { 
  title: string, value: string, trend: string, trendUp: boolean, children?: React.ReactNode 
}) => (
  <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
    <div>
      <h3 className="text-gray-400 text-sm font-medium mb-2">{title}</h3>
      <div className="flex items-end gap-3 mb-4">
        <span className="text-3xl font-bold text-white">{value}</span>
        <span className={`text-sm mb-1 ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
          {trendUp ? '+' : ''}{trend}
        </span>
      </div>
    </div>
    {children}
  </div>
);

// ConversionFlow component using mapped list and neon gradients
const ConversionFlow = () => {
  const stages = [
    { name: 'Intake', percentage: 95, color: 'from-[#00E5FF] to-[#39FF14]' },
    { name: 'Consultation', percentage: 75, color: 'from-[#39FF14] to-[#CCFF00]' },
    { name: 'Diagnosis', percentage: 60, color: 'from-[#CCFF00] to-[#FF007F]' },
    { name: 'Treatment', percentage: 40, color: 'from-[#FF007F] to-[#9D00FF]' },
  ];

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 w-full">
      <h3 className="text-lg font-semibold text-white mb-6">Patient Flow</h3>
      <div className="flex flex-col gap-5">
        {stages.map((stage) => (
          <div key={stage.name} className="relative">
            <div className="flex justify-between text-sm text-gray-300 mb-2">
              <span>{stage.name}</span>
              <span>{stage.percentage}%</span>
            </div>
            {/* Background Track */}
            <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
              {/* Neon Gradient Fill */}
              <div 
                className={`h-full rounded-full bg-gradient-to-r ${stage.color} shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-all duration-1000`} 
                style={{ width: `${stage.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#0b0e14] text-[#ecedf6] flex font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#10131a] hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00E5FF] to-[#9D00FF] flex items-center justify-center shadow-[0_0_12px_rgba(0,229,255,0.4)]">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">Lumina Health</span>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-2">
          {[
            { name: 'Dashboard', icon: LayoutDashboard, active: true },
            { name: 'Patients', icon: Users },
            { name: 'Appointments', icon: Calendar },
            { name: 'Team', icon: Activity },
            { name: 'Reports', icon: FileText },
            { name: 'Data Sources', icon: Database },
          ].map((item) => (
            <button 
              key={item.name}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                item.active 
                  ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className={`w-5 h-5 ${item.active ? 'text-[#00E5FF]' : ''}`} />
              <span className="font-medium">{item.name}</span>
            </button>
          ))}
        </nav>
        
        {/* Log New Vitals Button */}
        <div className="p-4 mb-4">
          <button className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#39FF14] text-[#0b0e14] font-bold shadow-[0_0_20px_rgba(0,229,255,0.5)] hover:shadow-[0_0_25px_rgba(0,229,255,0.8)] hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
            <Activity className="w-5 h-5" />
            Log New Vitals
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Subtle Background Grid Element */}
        <div className="absolute inset-0 pointer-events-none" 
             style={{ 
               backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
               backgroundSize: '40px 40px' 
             }} 
        />

        {/* Top Header */}
        <header className="h-20 border-b border-white/5 bg-[#0b0e14]/80 backdrop-blur-md flex items-center justify-between px-8 relative z-10">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search patients, doctors, or reports..." 
              className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#00E5FF]/50 focus:shadow-[0_0_10px_rgba(0,229,255,0.2)] transition-all"
            />
          </div>
          <div className="flex items-center gap-5">
            <button className="text-gray-400 hover:text-white transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#FF007F] rounded-full shadow-[0_0_8px_rgba(255,0,127,0.6)]"></span>
            </button>
            <button className="text-gray-400 hover:text-white transition-colors">
              <HelpCircle className="w-5 h-5" />
            </button>
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-[#FF007F] flex items-center justify-center text-sm font-bold shadow-[0_0_10px_rgba(255,0,127,0.3)] cursor-pointer">
              DA
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <div className="p-8 relative z-10 flex-1 overflow-y-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome back, Dr. Aris.</h1>
            <p className="text-gray-400">Here's what's happening at your facility today.</p>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Total Patients" value="1,248" trend="12%" trendUp={true} />
            <StatCard title="Appointments Today" value="42" trend="3%" trendUp={false} />
            <StatCard title="Monthly Revenue" value="$124.5k" trend="8%" trendUp={true} />
            <StatCard title="Bed Occupancy" value="84%" trend="4%" trendUp={true}>
              <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-[#39FF14] shadow-[0_0_8px_rgba(57,255,20,0.8)]" style={{ width: '84%' }}></div>
              </div>
            </StatCard>
          </div>

          {/* Flow & Leaderboard Grids */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              <ConversionFlow />
              
              {/* Dummy Matrix Plot representation for layout completeness */}
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 w-full min-h-[300px] flex flex-col justify-center items-center">
                 <h3 className="text-lg font-semibold text-white mb-2 self-start">Patient Risk Matrix</h3>
                 <p className="text-gray-500 text-sm mb-6 self-start">Scatter plot visualization</p>
                 <div className="w-full h-full border-l border-b border-white/10 relative mt-4">
                    {/* Random generated points */}
                    {[...Array(18)].map((_, i) => {
                      const colors = ['#00E5FF', '#FF007F', '#CCFF00', '#39FF14', '#9D00FF'];
                      const top = Math.floor(Math.random() * 85) + 5;
                      const left = Math.floor(Math.random() * 85) + 5;
                      const color = colors[i % colors.length];
                      return (
                        <div 
                          key={i} 
                          className="absolute w-3 h-3 rounded-full" 
                          style={{ 
                            top: `${top}%`, 
                            left: `${left}%`, 
                            backgroundColor: color, 
                            boxShadow: `0 0 12px ${color}` 
                          }} 
                        />
                      );
                    })}
                 </div>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 h-full">
              <h3 className="text-lg font-semibold text-white mb-6">Top Doctors</h3>
              <div className="space-y-6">
                {[
                   { name: 'Dr. Sarah Smith', role: 'Cardiology', score: 98, color: 'from-[#00E5FF] to-[#39FF14]' },
                   { name: 'Dr. John Davis', role: 'Neurology', score: 92, color: 'from-[#39FF14] to-[#CCFF00]' },
                   { name: 'Dr. Emily Chen', role: 'Pediatrics', score: 85, color: 'from-[#CCFF00] to-[#FF007F]' },
                   { name: 'Dr. Michael Lee', role: 'Orthopedics', score: 79, color: 'from-[#FF007F] to-[#9D00FF]' },
                ].map((doc) => (
                  <div key={doc.name} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex-shrink-0 flex items-center justify-center font-bold text-sm text-white border border-white/20 shadow-[0_0_8px_rgba(255,255,255,0.1)]">
                      {doc.name.replace('Dr. ', '').split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold">{doc.name}</h4>
                      <p className="text-xs text-gray-400">{doc.role}</p>
                      <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden mt-2">
                         <div className={`h-full bg-gradient-to-r ${doc.color} shadow-[0_0_8px_rgba(255,255,255,0.4)]`} style={{ width: `${doc.score}%` }}></div>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-white">{doc.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
