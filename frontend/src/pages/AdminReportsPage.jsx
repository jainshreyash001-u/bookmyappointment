import React from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, Users, CreditCard, Cpu, MessagesSquare, 
  LineChart as LineChartIcon, ShieldAlert, Settings, LogOut, Globe, Search, Bell
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';

const AdminReportsPage = () => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: BarChart3, path: '/admin/dashboard' },
    { name: 'Users Management', icon: Users, path: '/admin/users' },
    { name: 'Payments & Billing', icon: CreditCard, path: '/admin/billing' },
    { name: 'System & API', icon: Cpu, path: '/admin/system' },
    { name: 'Customer Support', icon: MessagesSquare, path: '/admin/support' },
    { name: 'Reports & Analytics', icon: LineChartIcon, path: '/admin/reports' },
    { name: 'Security & Audit', icon: ShieldAlert, path: '/admin/security' },
    { name: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  // Dummy Data for Charts
  const revenueData = [
    { name: 'Jan', revenue: 150000 },
    { name: 'Feb', revenue: 180000 },
    { name: 'Mar', revenue: 220000 },
    { name: 'Apr', revenue: 250000 },
    { name: 'May', revenue: 344430 },
  ];

  const aiProcessingData = [
    { time: '08:00', queries: 120 },
    { time: '10:00', queries: 350 },
    { time: '12:00', queries: 280 },
    { time: '14:00', queries: 400 },
    { time: '16:00', queries: 510 },
    { time: '18:00', queries: 310 },
  ];

  return (
    <div className="flex h-screen bg-[#020617] overflow-hidden text-white">
      
      {/* Left Sidebar Menu */}
      <aside className="w-72 bg-[#0f172a] border-r border-white/5 flex flex-col z-20 shadow-2xl relative">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center font-black shadow-[0_0_15px_rgba(220,38,38,0.5)]">
              DEV
            </div>
            <div>
              <div className="text-xs font-black tracking-widest uppercase">Global Admin</div>
              <div className="text-[10px] text-red-400 font-bold uppercase">Superuser Access</div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {menuItems.map((item, i) => (
            <Link 
              key={i} 
              to={item.path}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                location.pathname === item.path 
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-bold tracking-tight">{item.name}</span>
            </Link>
          ))}
        </div>

        <div className="p-6 border-t border-white/5 bg-[#0a0f1c]">
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">
            <span>System Status</span>
            <span className="text-green-500 animate-pulse">Operational</span>
          </div>
          <button className="flex items-center justify-center gap-3 w-full py-3 bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 rounded-xl transition-colors text-xs font-bold uppercase tracking-widest">
            <LogOut className="w-4 h-4" /> End Session
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none" />
        
        {/* Top Navigation Bar */}
        <header className="h-20 bg-[#020617]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-black uppercase tracking-tight">Reports & <span className="text-red-500">Analytics</span></h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="text" placeholder="Search analytics..." className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-xs font-medium focus:border-red-500/50 outline-none w-64" />
            </div>
            <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-8">
          
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Revenue Growth Chart */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 bg-[#0f172a] border border-white/5 rounded-2xl"
            >
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                <LineChartIcon className="w-5 h-5 text-green-500" /> MRR Growth (YTD)
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="name" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#020617', borderColor: '#ffffff20', borderRadius: '12px' }}
                      itemStyle={{ color: '#22c55e', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* AI Query Processing Chart */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-8 bg-[#0f172a] border border-white/5 rounded-2xl"
            >
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-blue-500" /> Hourly AI Queries Processed
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={aiProcessingData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="time" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#020617', borderColor: '#ffffff20', borderRadius: '12px' }}
                      itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                      cursor={{ fill: '#ffffff05' }}
                    />
                    <Bar dataKey="queries" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* VAPI Cost Analysis */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-8 bg-[#0f172a] border border-white/5 rounded-2xl"
          >
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-500" /> Global API Cost Analysis
            </h3>
            
            <div className="grid grid-cols-3 gap-6">
              <div className="p-5 bg-[#020617] rounded-xl border border-white/5">
                <div className="text-sm font-bold text-white mb-1">WhatsApp API</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">Meta Platform</div>
                <div className="text-2xl font-black text-green-400">₹14,250</div>
                <div className="h-1 w-full bg-white/5 rounded-full mt-3 overflow-hidden"><div className="h-full w-[45%] bg-green-500" /></div>
              </div>
              <div className="p-5 bg-[#020617] rounded-xl border border-white/5">
                <div className="text-sm font-bold text-white mb-1">VAPI Voice Core</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">Outbound Calls</div>
                <div className="text-2xl font-black text-indigo-400">₹32,100</div>
                <div className="h-1 w-full bg-white/5 rounded-full mt-3 overflow-hidden"><div className="h-full w-[80%] bg-indigo-500" /></div>
              </div>
              <div className="p-5 bg-[#020617] rounded-xl border border-white/5">
                <div className="text-sm font-bold text-white mb-1">ElevenLabs TTS</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">Character Generation</div>
                <div className="text-2xl font-black text-blue-400">₹8,400</div>
                <div className="h-1 w-full bg-white/5 rounded-full mt-3 overflow-hidden"><div className="h-full w-[20%] bg-blue-500" /></div>
              </div>
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  );
};

export default AdminReportsPage;
