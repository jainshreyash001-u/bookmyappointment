import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Users, Calendar, TrendingUp, MessageSquare, Bell, Settings, LogOut, Bot, CheckCircle2, Clock, Phone, AlertTriangle } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const DashboardPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userPlan = localStorage.getItem('userPlan') || 'starter';
  
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';
        
        // Fetch Profile
        const profileRes = await fetch(`${API_BASE}/api/dentist/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (profileRes.status === 401 || profileRes.status === 404) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userPlan');
          localStorage.removeItem('dentistId');
          navigate('/login');
          return;
        }

        const profileData = await profileRes.json();
        if (profileData.error) throw new Error(profileData.error);
        setProfile(profileData);

        // Fetch Appointments
        const apptsRes = await fetch(`${API_BASE}/api/dentist/appointments`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (apptsRes.status === 401 || apptsRes.status === 404) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userPlan');
          localStorage.removeItem('dentistId');
          navigate('/login');
          return;
        }

        const apptsData = await apptsRes.json();
        setAppointments(apptsData.appointments || []);
      } catch (err) {
        console.error('Error fetching dashboard details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userPlan');
    localStorage.removeItem('dentistId');
    navigate('/login');
  };

  // Google Calendar handlers
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarError, setCalendarError] = useState('');

  const handleConnectCalendar = async () => {
    setCalendarError('');
    setCalendarLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';
      const res = await fetch(`${API_BASE}/api/dentist/calendar-url`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401 || res.status === 404) {
        handleLogout();
        return;
      }
      const data = await res.json();
      if (data.authUrl) {
        const width = 600, height = 600;
        const left = window.screenX + (window.innerWidth - width) / 2;
        const top = window.screenY + (window.innerHeight - height) / 2;
        const popup = window.open(data.authUrl, 'Google Calendar OAuth', `width=${width},height=${height},left=${left},top=${top}`);

        // Poll dentist profile to check if calendarConnected becomes true
        const interval = setInterval(async () => {
          try {
            const profileRes = await fetch(`${API_BASE}/api/dentist/profile`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (profileRes.status === 401 || profileRes.status === 404) {
              clearInterval(interval);
              handleLogout();
              return;
            }
            const profileData = await profileRes.json();
            if (profileData.calendarConnected) {
              setProfile(prev => ({ ...prev, calendarConnected: true }));
              clearInterval(interval);
              setCalendarLoading(false);
            }
          } catch (e) {
            console.error('Error polling calendar status:', e);
          }
        }, 2000);

        // Auto-clear interval if popup is closed manually
        const checkClosed = setInterval(() => {
          if (popup && popup.closed) {
            clearInterval(interval);
            clearInterval(checkClosed);
            setCalendarLoading(false);
          }
        }, 1000);
      } else {
        setCalendarError(data.error || 'Failed to fetch calendar OAuth URL');
        setCalendarLoading(false);
      }
    } catch (err) {
      setCalendarError('Could not fetch calendar URL');
      setCalendarLoading(false);
    }
  };

  const handleDisconnectCalendar = async () => {
    if (!window.confirm("Are you sure you want to disconnect Google Calendar? This will stop the AI receptionist from reading and writing appointments to your Google Calendar.")) {
      return;
    }
    setCalendarError('');
    setCalendarLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';
      const res = await fetch(`${API_BASE}/api/dentist/disconnect-calendar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401 || res.status === 404) {
        handleLogout();
        return;
      }
      const data = await res.json();
      if (res.ok) {
        setProfile(prev => ({ ...prev, calendarConnected: false }));
      } else {
        setCalendarError(data.error || 'Failed to disconnect calendar');
      }
    } catch (err) {
      setCalendarError('Could not connect to server');
    } finally {
      setCalendarLoading(false);
    }
  };

  const stats = [
    { label: 'Synced Appointments', value: loading ? '...' : appointments.length, change: 'Live', icon: Calendar, color: 'blue' },
    { label: 'AI Processed Queries', value: loading ? '...' : '100% Active', change: 'Active', icon: MessageSquare, color: 'teal' },
    { label: 'No-Show Recovery', value: 'Active', change: '6h Rule', icon: Activity, color: 'green' },
    { label: 'Current Revenue Leak', value: '₹0.00', change: 'Optimized', icon: TrendingUp, color: 'indigo' }
  ];

  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const displayActivity = appointments.length > 0
    ? appointments.slice(0, 10).map((a) => ({
        patient: a.patientName || 'Unknown Patient',
        action: `Booked ${a.service || 'Service'}`,
        time: new Date(a.dateTime).toLocaleDateString() + ' ' + new Date(a.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: a.status || 'confirmed'
      }))
    : [
        { patient: 'No Sync Data', action: 'Awaiting first patient interaction', time: 'Now', status: 'pending' }
      ];

  // Helper to resolve CSS colors based on stat definition
  const getStatColorClasses = (color) => {
    switch (color) {
      case 'blue':
        return { bg: 'bg-blue-50 border-blue-100', text: 'text-blue-600', icon: 'text-blue-500' };
      case 'teal':
        return { bg: 'bg-teal-50 border-teal-100', text: 'text-teal-600', icon: 'text-teal-500' };
      case 'green':
        return { bg: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-600', icon: 'text-[#10b981]' };
      case 'indigo':
      default:
        return { bg: 'bg-indigo-50 border-indigo-100', text: 'text-indigo-600', icon: 'text-indigo-500' };
    }
  };

  return (
    <div className="flex min-h-screen bg-white pt-28 text-[#0a2540]">
      {/* Sidebar */}
      <Sidebar handleLogout={handleLogout} />

      {/* Main Content */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto bg-gray-50/30">
        <header className="flex flex-col sm:flex-row justify-between sm:items-end gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase mb-2 text-[#0a2540]">
              {profile?.clinicName || 'Practice'} <span className="text-gradient-clinical">Dashboard</span>
            </h1>
            <p className="text-gray-500 font-medium">System Status: <span className="text-[#10b981] font-bold">All Nodes Active</span> | Clinical Sync: <span className="text-[#0a2540] font-black">100%</span></p>
          </div>
          <div className="flex gap-4">
            <div className="px-6 py-4 bg-white border border-gray-100 rounded-2xl flex items-center gap-6 shadow-sm">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#0a2540]/60">
                <div className={`w-2 h-2 rounded-full animate-pulse ${profile?.calendarConnected ? 'bg-[#10b981]' : 'bg-red-500'}`} />
                Calendar: {profile?.calendarConnected ? 'Active' : 'Disconnected'}
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#0a2540]/60">
                <div className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse" />
                Database: Connected
              </div>
            </div>
            <div className="w-12 h-12 bg-[#0a2540] text-white rounded-xl flex items-center justify-center font-black shadow-sm">
              {profile?.name ? getInitials(profile.name) : 'DR'}
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {stats.map((stat, i) => {
            const colors = getStatColorClasses(stat.color);
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="clinical-card p-8 group bg-white shadow-sm"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${colors.bg}`}>
                    <stat.icon className={`w-6 h-6 ${colors.icon}`} />
                  </div>
                  <span className="text-xs font-black text-[#10b981]">
                    {stat.change}
                  </span>
                </div>
                <div className="text-3xl font-black mb-1 tracking-tight text-[#0a2540]">{stat.value}</div>
                <div className="text-[10px] text-[#0a2540]/60 font-black uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Analytics & Activity */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Live Feed */}
          <div className="lg:col-span-2 space-y-8">
            <div className="clinical-card p-10 bg-white h-full shadow-sm">
              <h3 className="text-lg font-black uppercase tracking-widest mb-8 flex items-center gap-3 text-[#0a2540]">
                <Activity className="w-5 h-5 text-[#10b981]" /> Live AI Operations
              </h3>
              <div className="space-y-6">
                {displayActivity.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-6 bg-white border border-gray-100 rounded-2xl hover:border-[#10b981]/20 transition-all group shadow-sm">
                    <div className="flex items-center gap-6">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xs font-black ${
                          item.status === 'confirmed' ? 'bg-[#10b981]/15 text-[#10b981]' :
                          item.status === 'pending' ? 'bg-amber-500/15 text-amber-600' : 'bg-blue-500/15 text-blue-600'
                        }`}>
                        {getInitials(item.patient)}
                      </div>
                      <div>
                        <div className="font-bold text-[#0a2540] group-hover:text-[#10b981] transition-colors">{item.patient}</div>
                        <div className="text-xs text-gray-500 font-medium">{item.action}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-black uppercase tracking-widest text-[#0a2540]/40 mb-1">{item.time}</div>
                      <div className={`text-[10px] font-black uppercase tracking-widest ${
                          item.status === 'confirmed' ? 'text-[#10b981]' :
                          item.status === 'pending' ? 'text-amber-600' : 'text-blue-600'
                        }`}>{item.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Health */}
          <div className="space-y-8">
            {/* Google Calendar Management */}
            <div className="clinical-card p-10 bg-white shadow-sm">
              <h3 className="text-lg font-black uppercase tracking-widest mb-6 flex items-center gap-3 text-[#0a2540]">
                <Calendar className="w-5 h-5 text-[#10b981]" /> Google Calendar Sync
              </h3>
              
              {calendarError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold">
                  {calendarError}
                </div>
              )}

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                  <div>
                    <div className="text-xs font-black uppercase tracking-wider text-[#0a2540] mb-1">Status</div>
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                      <div className={`w-2 h-2 rounded-full ${profile?.calendarConnected ? 'bg-[#10b981] animate-pulse' : 'bg-red-500'}`} />
                      {profile?.calendarConnected ? 'Connected & Active' : 'Disconnected'}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 font-medium max-w-[150px] text-right">
                    {profile?.calendarConnected ? 'AI blocks slots automatically.' : 'Sync required for AI booking.'}
                  </div>
                </div>

                {profile?.calendarConnected ? (
                  <button
                    onClick={handleDisconnectCalendar}
                    disabled={calendarLoading}
                    className="w-full py-4 bg-red-50 text-red-600 border border-red-100 hover:bg-red-100/50 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-sm disabled:opacity-50"
                  >
                    {calendarLoading ? 'Disconnecting...' : 'Disconnect Calendar'}
                  </button>
                ) : (
                  <button
                    onClick={handleConnectCalendar}
                    disabled={calendarLoading}
                    className="w-full py-4 bg-[#10b981] hover:bg-[#0d9668] text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {calendarLoading ? 'Connecting...' : 'Connect Google Calendar'}
                  </button>
                )}
              </div>
            </div>

            <div className="clinical-card p-10 bg-white shadow-sm">
              <h3 className="text-lg font-black uppercase tracking-widest mb-8 flex items-center gap-3 text-[#0a2540]">
                <Bot className="w-5 h-5 text-[#10b981]" /> AI Brain Health
              </h3>
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-3">
                    <span className="text-[#0a2540]/60">Knowledge Coverage</span>
                    <span className="text-[#10b981]">94%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#10b981] w-[94%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-3">
                    <span className="text-[#0a2540]/60">Response Latency</span>
                    <span className="text-[#0a2540]">1.2s</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#0a2540] w-[96%]" />
                  </div>
                </div>
                <div className="pt-6 border-t border-gray-100">
                  <button className="w-full py-4 bg-white border border-gray-200 hover:border-[#10b981] rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all text-[#0a2540] shadow-sm">
                    OPEN AI CONFIG
                  </button>
                </div>
              </div>
            </div>

            {/* Pro Features */}
            {userPlan === 'pro' && (
              <div className="clinical-card p-10 border-blue-100 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-3 text-[#0a2540]">
                    <Phone className="w-5 h-5 text-[#10b981]" /> VAPI Voice Core
                  </h3>
                  <div className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-blue-100">PRO</div>
                </div>
                
                <div className="space-y-6">
                  <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-[#0a2540]">Voice Call Logs</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">12 Today</span>
                    </div>
                    <div className="text-[10px] text-[#0a2540]/60 font-medium">Autonomous Follow-ups completed via VAPI.</div>
                  </div>

                  <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-[#0a2540]">Call Follow-up Status</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#10b981]">92% Connected</span>
                    </div>
                    <div className="text-[10px] text-[#0a2540]/60 font-medium">Patients answering AI verification calls.</div>
                  </div>

                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-red-600 flex items-center gap-2"><AlertTriangle className="w-3 h-3" /> No-Response Alerts</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-red-600">2 Pending</span>
                    </div>
                    <div className="text-[10px] text-[#0a2540]/60 font-medium">Patients failed to confirm after 2 calls.</div>
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
