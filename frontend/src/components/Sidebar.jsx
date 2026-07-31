import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Activity, Settings, LogOut, X, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ handleLogout }) => {
  const location = useLocation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Queries', icon: MessageSquare, path: '/queries' },
    { name: 'Status', icon: Activity, path: '/status' }
  ];

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMsg('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';
      
      const res = await fetch(`${API_BASE}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password');
      }

      setSuccessMsg('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <aside className="w-72 border-r border-gray-100 p-8 hidden lg:block bg-gray-50/50 font-sans">
        <div className="space-y-12">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#0a2540]/60">MANAGEMENT</h4>
            <nav className="space-y-2">
              {menuItems.map((item, i) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link 
                    key={i} 
                    to={item.path}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-bold ${
                      isActive 
                        ? 'bg-[#0a2540]/5 text-[#0a2540] border border-[#0a2540]/10 shadow-sm' 
                        : 'text-gray-500 hover:bg-gray-100/50 hover:text-[#0a2540]'
                    }`}
                  >
                    <item.icon className="w-5 h-5 text-gray-500" />
                    <span className="text-sm tracking-tight">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="pt-12 border-t border-gray-100 space-y-4">
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-4 px-4 py-3 text-gray-500 hover:bg-gray-100/50 w-full rounded-xl transition-all font-black text-sm uppercase tracking-wider focus:outline-none"
            >
              <Settings className="w-5 h-5 shrink-0 text-gray-500" />
              <span className="text-xs tracking-wider">Settings</span>
            </button>

            <button 
              onClick={handleLogout}
              className="flex items-center gap-4 px-4 py-3 text-red-500 hover:bg-red-50 w-full rounded-xl transition-all font-black text-sm uppercase tracking-wider focus:outline-none"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              <span className="text-xs tracking-wider">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Settings slide-up panel */}
      <AnimatePresence>
        {isSettingsOpen && (
          <>
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsSettingsOpen(false);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="fixed inset-0 bg-[#0a2540]/40 backdrop-blur-sm z-50"
            />

            {/* Slide-Up Drawer Panel */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-white rounded-t-[32px] shadow-2xl border-t border-gray-100 z-50 overflow-y-auto flex flex-col font-sans"
            >
              {/* Drawer Handle */}
              <div className="flex justify-center pt-4 pb-2">
                <div className="w-16 h-1.5 bg-gray-200 rounded-full" />
              </div>

              <div className="max-w-md mx-auto w-full px-6 pb-12 pt-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-[#0a2540]">
                      Account Settings
                    </h3>
                    <p className="text-xs text-gray-500 font-semibold mt-0.5">Manage your practice credentials securely</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                    className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Settings Form */}
                <form onSubmit={handleChangePassword} className="space-y-6">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-4">
                    <Lock className="w-5 h-5 text-[#10b981] mt-0.5" />
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-[#0a2540]">Change Password</h4>
                      <p className="text-[10px] text-gray-400 font-medium">Keep your account secure with regular updates.</p>
                    </div>
                  </div>

                  {errorMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-3 animate-pulse"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </motion.div>
                  )}

                  {successMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-green-50 border border-green-100 text-[#10b981] rounded-2xl text-xs font-bold flex items-center gap-3"
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{successMsg}</span>
                    </motion.div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#0a2540]/60 mb-2 block">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-gray-50 border border-gray-200/80 rounded-2xl px-5 py-4 text-sm font-semibold text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] focus:outline-none transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#0a2540]/60 mb-2 block">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-gray-50 border border-gray-200/80 rounded-2xl px-5 py-4 text-sm font-semibold text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] focus:outline-none transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#0a2540]/60 mb-2 block">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-gray-50 border border-gray-200/80 rounded-2xl px-5 py-4 text-sm font-semibold text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] focus:outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-[#0a2540] hover:bg-[#10b981] text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? 'Updating Credentials...' : 'Change Password'}
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
