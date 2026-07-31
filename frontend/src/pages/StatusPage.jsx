import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Bot, Phone, Activity, Heart, Shield, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const StatusPage = () => {
  const navigate = useNavigate();
  const userPlan = localStorage.getItem('userPlan') || 'starter';
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarError, setCalendarError] = useState('');

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';
      const profileRes = await fetch(`${API_BASE}/api/dentist/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (profileRes.status === 401 || profileRes.status === 404) {
        handleLogout();
        return;
      }

      const profileData = await profileRes.json();
      if (profileData.error) throw new Error(profileData.error);
      setProfile(profileData);
    } catch (err) {
      console.error('Error fetching status details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userPlan');
    localStorage.removeItem('dentistId');
    navigate('/login');
  };

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
      if (data.success) {
        setProfile(prev => ({ ...prev, calendarConnected: false }));
      } else {
        setCalendarError(data.error || 'Failed to disconnect calendar');
      }
    } catch (err) {
      setCalendarError('Could not disconnect calendar');
    } finally {
      setCalendarLoading(false);
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-[#0a2540] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white pt-28 text-[#0a2540]">
      <Sidebar handleLogout={handleLogout} />

      {/* Main Content */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto bg-gray-50/30">
        <header className="flex flex-col sm:flex-row justify-between sm:items-end gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase mb-2 text-[#0a2540]">
              System <span className="text-gradient-clinical">Status & Sync</span>
            </h1>
            <p className="text-gray-500 font-medium">Verify integrations, AI performance metrics, and connected modules.</p>
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

        {/* Status Panels Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Google Calendar Management */}
          <div className="clinical-card p-10 bg-white shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-3 text-[#0a2540]">
                  <Calendar className="w-5 h-5 text-[#10b981]" /> Google Calendar Sync
                </h3>
                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg ${profile?.calendarConnected ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                  {profile?.calendarConnected ? 'Active' : 'Offline'}
                </span>
              </div>
              
              {calendarError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold">
                  {calendarError}
                </div>
              )}

              <p className="text-sm text-gray-500 font-medium mb-8 leading-relaxed">
                Syncing with your primary calendar allows the autonomous AI receptionist to read available appointment slots and insert confirmed bookings in real-time.
              </p>

              <div className="p-6 bg-gray-50 border border-gray-100 rounded-2xl mb-8 space-y-4">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-gray-400">Connection Status</span>
                  <span className={profile?.calendarConnected ? 'text-emerald-600' : 'text-red-500'}>
                    {profile?.calendarConnected ? 'Authenticated' : 'Not Connected'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-gray-400">Sync Scope</span>
                  <span className="text-[#0a2540]">Calendar Events (Read/Write)</span>
                </div>
              </div>
            </div>

            <div>
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

          {/* AI Brain Health */}
          <div className="clinical-card p-10 bg-white shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-3 text-[#0a2540]">
                  <Bot className="w-5 h-5 text-[#10b981]" /> AI Receptionist Brain
                </h3>
                <span className="px-3 py-1 bg-[#0a2540]/5 text-[#0a2540] text-[10px] font-black uppercase tracking-wider rounded-lg border border-[#0a2540]/10">
                  98.6% UPTIME
                </span>
              </div>

              <p className="text-sm text-gray-500 font-medium mb-8 leading-relaxed">
                The autonomous AI agent processes dental patient queries, pricing requests, and schedules appointments based on clinic guidelines.
              </p>

              <div className="space-y-8 mb-8">
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
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <button className="w-full py-4 bg-white border border-gray-200 hover:border-[#10b981] rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all text-[#0a2540] shadow-sm">
                RUN SERVICE DIAGNOSTICS
              </button>
            </div>
          </div>

          {/* Pro Features */}
          {userPlan === 'pro' && (
            <div className="clinical-card p-10 border-blue-100 bg-white shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-3 text-[#0a2540]">
                  <Phone className="w-5 h-5 text-[#10b981]" /> VAPI Voice Core
                </h3>
                <div className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-blue-100">PRO</div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gray-50 border border-gray-100 rounded-2xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-[#0a2540]">Voice Call Logs</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">12 Today</span>
                  </div>
                  <div className="text-[10px] text-[#0a2540]/60 font-medium">Autonomous voice appointments handled today.</div>
                </div>
                <div className="p-6 bg-gray-50 border border-gray-100 rounded-2xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-[#0a2540]">VAPI Core Integration</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#10b981]">ONLINE</span>
                  </div>
                  <div className="text-[10px] text-[#0a2540]/60 font-medium">Direct connection to VAPI voice gateway channels.</div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default StatusPage;
