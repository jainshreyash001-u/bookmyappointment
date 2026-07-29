import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, Users, CreditCard, Cpu, MessagesSquare, 
  LineChart, ShieldAlert, Settings, LogOut, Bell, 
  Search, Activity, Server, Zap, Globe
} from 'lucide-react';

const AdminDashboardPage = () => {
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  
  // Real-time monitoring vibe
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const menuItems = [
    { name: 'Dashboard', icon: BarChart3, path: '/admin/dashboard' },
    { name: 'Users Management', icon: Users, path: '/admin/users' },
    { name: 'Payments & Billing', icon: CreditCard, path: '/admin/billing' },
    { name: 'System & API', icon: Cpu, path: '/admin/system' },
    { name: 'Customer Support', icon: MessagesSquare, path: '/admin/support' },
    { name: 'Reports & Analytics', icon: LineChart, path: '/admin/reports' },
    { name: 'Security & Audit', icon: ShieldAlert, path: '/admin/security' },
    { name: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  const liveStats = [
    { label: 'Active Sessions', value: '1,284', icon: Activity, color: 'blue' },
    { label: 'Bookings Today', value: '8,432', icon: Zap, color: 'green' },
    { label: 'Messages Processed', value: '45.2K', icon: MessagesSquare, color: 'indigo' },
    { label: 'Global Server Load', value: '24%', icon: Server, color: 'red' }
  ];

  const revenueData = [
    { plan: 'Starter Pack', active: 450, mrr: '₹2,24,550' },
    { plan: 'Professional Pack', active: 120, mrr: '₹1,19,880' },
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
            <h1 className="text-2xl font-black uppercase tracking-tight">Developer <span className="text-red-500">Command Center</span></h1>
            <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black tracking-widest uppercase text-gray-400 flex items-center gap-2">
              <Globe className="w-3 h-3 text-blue-500" />
              Live Feed: {currentTime}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="text" placeholder="Search clinics, IDs, logs..." className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-xs font-medium focus:border-red-500/50 outline-none w-64" />
            </div>
            <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-[#020617]" />
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* Quick Action Buttons */}
          <div className="flex gap-4 mb-8">
            <button className="px-6 py-3 bg-red-600 hover:bg-red-500 rounded-xl text-xs font-black uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(220,38,38,0.3)]">
              Force Sync AI Models
            </button>
            <button className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs font-black uppercase tracking-widest transition-colors">
              Deploy Hotfix
            </button>
            <button className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs font-black uppercase tracking-widest transition-colors">
              Export Audit Logs
            </button>
          </div>

          {/* Live Metrics Grid */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            {liveStats.map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-[#0f172a] border border-white/5 rounded-2xl relative overflow-hidden group"
              >
                <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-500/10 blur-2xl rounded-full group-hover:bg-${stat.color}-500/20 transition-all`} />
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className={`p-3 bg-${stat.color}-500/10 rounded-xl border border-${stat.color}-500/20`}>
                    <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-green-400">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Live
                  </div>
                </div>
                <div className="text-3xl font-black mb-1 relative z-10">{stat.value}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 relative z-10">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Revenue Tracking */}
            <div className="col-span-2 p-8 bg-[#0f172a] border border-white/5 rounded-2xl">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  <LineChart className="w-5 h-5 text-green-500" /> Platform Financials (MRR)
                </h3>
                <span className="text-[10px] font-bold bg-white/5 px-3 py-1 rounded-full text-gray-400">Updates every 30s</span>
              </div>
              
              <div className="space-y-4">
                {revenueData.map((data, i) => (
                  <div key={i} className="flex items-center justify-between p-5 bg-[#020617] rounded-xl border border-white/5">
                    <div>
                      <div className="text-sm font-bold text-white mb-1">{data.plan}</div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">{data.active} Active Clinics</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black text-green-400">{data.mrr}</div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">Monthly Revenue</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center">
                <div className="text-xs font-black uppercase tracking-widest text-gray-400">Total Projected MRR</div>
                <div className="text-3xl font-black text-white">₹3,44,430</div>
              </div>
            </div>

            {/* System Security Feed */}
            <div className="p-8 bg-[#0f172a] border border-white/5 rounded-2xl">
              <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 mb-6">
                <ShieldAlert className="w-5 h-5 text-red-500" /> Security Audit Log
              </h3>
              
              <div className="space-y-4">
                {[
                  { msg: 'Failed Admin Login Attempt', ip: '192.168.1.45', time: '2m ago', alert: true },
                  { msg: 'Clinic Data Backup Complete', ip: 'Internal', time: '15m ago', alert: false },
                  { msg: 'VAPI Webhook Timeout', ip: 'API Gateway', time: '1h ago', alert: true },
                  { msg: 'New Pro Plan Subscribed', ip: 'Stripe Hook', time: '2h ago', alert: false },
                ].map((log, i) => (
                  <div key={i} className="flex gap-4 p-3 border-l-2 border-white/5 hover:bg-white/5 transition-colors">
                    <div className={`w-2 h-2 mt-1.5 rounded-full ${log.alert ? 'bg-red-500' : 'bg-green-500'}`} />
                    <div>
                      <div className={`text-xs font-bold mb-1 ${log.alert ? 'text-red-400' : 'text-gray-300'}`}>{log.msg}</div>
                      <div className="flex gap-3 text-[9px] font-black uppercase tracking-widest text-gray-600">
                        <span>IP: {log.ip}</span>
                        <span>{log.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardPage;
