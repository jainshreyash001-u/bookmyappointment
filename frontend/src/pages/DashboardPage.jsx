import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Users, Calendar, TrendingUp, MessageSquare, Bell, Settings, LogOut, Bot, CheckCircle2, Clock, Phone, AlertTriangle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const DashboardPage = () => {
  const location = useLocation();
  const userPlan = localStorage.getItem('userPlan') || 'starter';
  
  const stats = [
    { label: 'Synced Appointments', value: 'Syncing...', change: 'Live', icon: Calendar, color: 'blue' },
    { label: 'AI Processed Queries', value: 'Fetching...', change: 'Active', icon: MessageSquare, color: 'cyan' },
    { label: 'No-Show Recovery', value: 'Tracking', change: '6h Rule', icon: Activity, color: 'green' },
    { label: 'Current Revenue Leak', value: 'Calculating', change: 'Audit', icon: TrendingUp, color: 'indigo' }
  ];

  const recentActivity = [
    { patient: 'Rahul Sharma', action: 'Booked Root Canal', time: '2 mins ago', status: 'confirmed' },
    { patient: 'Priya Verma', action: 'Inquiry: Teeth Whitening', time: '15 mins ago', status: 'ai-handled' },
    { patient: 'Amit Singh', action: 'Rescheduled Checkup', time: '1 hour ago', status: 'confirmed' },
    { patient: 'Sneha Kapur', action: 'Follow-up Call', time: '3 hours ago', status: 'pending' }
  ];

  return (
    <div className="flex min-h-screen bg-[#020617] pt-28">
      {/* Sidebar */}
      <aside className="w-72 border-r border-white/5 p-8 hidden lg:block">
        <div className="space-y-12">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">MANAGEMENT</h4>
            <nav className="space-y-2">
              {[
                { name: 'Overview', icon: Activity, active: location.pathname === '/dashboard', path: '/dashboard' },
                { name: 'Queries', icon: MessageSquare, active: location.pathname === '/queries', path: '/queries' },
                { name: 'Appointments', icon: Calendar, path: '/appointments' },
                { name: 'AI Brain', icon: Bot, path: '/ai-brain' },
                { name: 'Knowledge Base', icon: Settings, path: '/knowledge' }
              ].map((item, i) => (
                <Link 
                  key={i} 
                  to={item.path}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${item.active ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-gray-400 hover:bg-white/5'}`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-bold tracking-tight">{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="pt-12 border-t border-white/5">
            <button className="flex items-center gap-4 px-4 py-3 text-red-400 hover:bg-red-500/5 w-full rounded-xl transition-all">
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-bold tracking-tight">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Practice <span className="text-gradient">Dashboard</span></h1>
            <p className="text-gray-400 font-medium">System Status: <span className="text-green-400">All Nodes Active</span> | Clinical Sync: <span className="text-blue-400 font-bold">100%</span></p>
          </div>
          <div className="flex gap-4">
            <div className="px-6 py-4 glass rounded-2xl flex items-center gap-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Calendar: Active
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                Airtable: Linked
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center font-black">DR</div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="cyber-card p-8 group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 bg-${stat.color}-500/10 rounded-xl flex items-center justify-center border border-${stat.color}-500/20`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                </div>
                <span className={`text-xs font-black ${stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                  {stat.change}
                </span>
              </div>
              <div className="text-3xl font-black mb-1 tracking-tight">{stat.value}</div>
              <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Analytics & Activity */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Live Feed */}
          <div className="lg:col-span-2 space-y-8">
            <div className="cyber-card p-10 h-full">
              <h3 className="text-lg font-black uppercase tracking-widest mb-8 flex items-center gap-3">
                <Activity className="w-5 h-5 text-blue-500" /> Live AI Operations
              </h3>
              <div className="space-y-6">
                {recentActivity.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-6 glass rounded-2xl border-white/5 hover:border-blue-500/20 transition-all group">
                    <div className="flex items-center gap-6">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xs font-black ${item.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                          item.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                        {item.patient.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-bold text-white group-hover:text-blue-400 transition-colors">{item.patient}</div>
                        <div className="text-xs text-gray-400 font-medium">{item.action}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">{item.time}</div>
                      <div className={`text-[10px] font-black uppercase tracking-widest ${item.status === 'confirmed' ? 'text-green-400' :
                          item.status === 'pending' ? 'text-amber-400' : 'text-blue-400'
                        }`}>{item.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Health */}
          <div className="space-y-8">
            <div className="cyber-card p-10">
              <h3 className="text-lg font-black uppercase tracking-widest mb-8 flex items-center gap-3 text-gradient">
                <Bot className="w-5 h-5 text-blue-500" /> AI Brain Health
              </h3>
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-3">
                    <span className="text-gray-400">Knowledge Coverage</span>
                    <span className="text-blue-400">94%</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[94%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-3">
                    <span className="text-gray-400">Response Latency</span>
                    <span className="text-blue-400">1.2s</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[96%]" />
                  </div>
                </div>
                <div className="pt-6 border-t border-white/5">
                  <button className="w-full py-4 glass rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-500 transition-all border-blue-500/20">
                    OPEN AI CONFIG
                  </button>
                </div>
              </div>
            </div>

            {/* Pro Features */}
            {userPlan === 'pro' && (
              <div className="cyber-card p-10 border-indigo-500/20">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-3 text-indigo-400">
                    <Phone className="w-5 h-5 text-indigo-500" /> VAPI Voice Core
                  </h3>
                  <div className="px-3 py-1 bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-lg">PRO</div>
                </div>
                
                <div className="space-y-6">
                  <div className="p-4 glass rounded-xl border border-white/5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-gray-300">Voice Call Logs</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">12 Today</span>
                    </div>
                    <div className="text-[10px] text-gray-500">Autonomous Follow-ups completed via VAPI.</div>
                  </div>

                  <div className="p-4 glass rounded-xl border border-white/5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-gray-300">Call Follow-up Status</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-green-400">92% Connected</span>
                    </div>
                    <div className="text-[10px] text-gray-500">Patients answering AI verification calls.</div>
                  </div>

                  <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-red-400 flex items-center gap-2"><AlertTriangle className="w-3 h-3" /> No-Response Alerts</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-red-400">2 Pending</span>
                    </div>
                    <div className="text-[10px] text-gray-400">Patients failed to confirm after 2 calls.</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
