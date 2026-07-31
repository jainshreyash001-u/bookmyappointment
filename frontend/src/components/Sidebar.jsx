import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Activity, Settings, LogOut, X, Lock, CheckCircle2, AlertCircle, MapPin, Clock, FileText, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ handleLogout }) => {
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('knowledge'); // 'knowledge', 'password'

  // Profile fields state
  const [doctorName, setDoctorName] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [operatingHours, setOperatingHours] = useState('');

  // Knowledge list & fields state
  const [knowledgeList, setKnowledgeList] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  // Password fields state
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

  // Fetch settings details
  const fetchSettingsData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';
      
      // Get Dentist Profile details
      const profileRes = await fetch(`${API_BASE}/api/dentist/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setDoctorName(profileData.name || '');
        setClinicName(profileData.clinicName || '');
        setClinicAddress(profileData.clinicAddress || '');
        setOperatingHours(profileData.workingHours?.hours || '');
      }

      // Get Dentist Knowledge entries
      const knowledgeRes = await fetch(`${API_BASE}/api/dentist/knowledge`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (knowledgeRes.ok) {
        const knowledgeData = await knowledgeRes.json();
        setKnowledgeList(knowledgeData.entries || []);
      }
    } catch (err) {
      console.error('Error fetching settings details:', err);
    }
  };

  useEffect(() => {
    if (isSettingsOpen || isProfileOpen) {
      fetchSettingsData();
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isSettingsOpen, isProfileOpen]);

  // Profile Update Handler
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';
      
      const res = await fetch(`${API_BASE}/api/dentist/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: doctorName,
          clinicName,
          clinicAddress,
          workingHours: { hours: operatingHours }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setSuccessMsg('Profile and hours updated successfully!');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Knowledge Addition Handler
  const handleAddKnowledge = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    
    if (!newTitle || !newDescription) {
      setErrorMsg('Title and description are required.');
      return;
    }
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';
      
      const res = await fetch(`${API_BASE}/api/dentist/knowledge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          entries: [{
            title: newTitle,
            description: newDescription,
            type: 'guideline'
          }]
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add guideline');
      }

      setSuccessMsg('New guideline added to AI Receptionist!');
      setNewTitle('');
      setNewDescription('');

      // Refresh list
      const knowledgeRes = await fetch(`${API_BASE}/api/dentist/knowledge`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (knowledgeRes.ok) {
        const knowledgeData = await knowledgeRes.json();
        setKnowledgeList(knowledgeData.entries || []);
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Knowledge Deletion Handler
  const handleDeleteKnowledge = async (id) => {
    setErrorMsg('');
    setSuccessMsg('');
    
    if (!window.confirm('Are you sure you want to delete this guideline? The AI receptionist will forget this instruction.')) {
      return;
    }
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';
      
      const res = await fetch(`${API_BASE}/api/dentist/knowledge/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete guideline');
      }

      setSuccessMsg('Guideline removed successfully.');
      setKnowledgeList(prev => prev.filter(k => k.id !== id));
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Change Password Handler
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
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-4 px-4 py-3 text-gray-500 hover:bg-gray-100/50 w-full rounded-xl transition-all font-black text-sm uppercase tracking-wider focus:outline-none"
            >
              <User className="w-5 h-5 shrink-0 text-gray-500" />
              <span className="text-xs tracking-wider">Profile</span>
            </button>

            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-4 px-4 py-3 text-gray-500 hover:bg-gray-100/50 w-full rounded-xl transition-all font-black text-sm uppercase tracking-wider focus:outline-none"
            >
              <Settings className="w-5 h-5 shrink-0 text-gray-500" />
              <span className="text-xs tracking-wider">Settings</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Profile slide-up panel */}
      <AnimatePresence>
        {isProfileOpen && (
          <>
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsProfileOpen(false);
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

              <div className="max-w-xl mx-auto w-full px-6 pb-12 pt-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-[#0a2540]">
                      Clinic Profile
                    </h3>
                    <p className="text-xs text-gray-500 font-semibold mt-0.5">Manage your clinic details and operating hours</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                    className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Error & Success Messages */}
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 mb-6 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-3 animate-pulse"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </motion.div>
                )}

                {successMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 mb-6 bg-green-50 border border-green-100 text-[#10b981] rounded-2xl text-xs font-bold flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{successMsg}</span>
                  </motion.div>
                )}

                {/* Profile Form */}
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  {/* Doctor Name Top Display */}
                  <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-100 rounded-2xl shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-[#0a2540] text-white flex items-center justify-center font-black text-sm shrink-0">
                      DR
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Registered Doctor</span>
                      <span className="text-sm font-black text-[#0a2540] uppercase tracking-wide">{doctorName || 'Not Set'}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/30 flex items-start gap-4">
                    <Settings className="w-5 h-5 text-[#10b981] mt-0.5" />
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-[#0a2540]">Clinic Configuration</h4>
                      <p className="text-[10px] text-gray-400 font-medium">Update your clinic details and operating hours for the AI receptionist.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#0a2540]/60 mb-2 block">
                        Doctor Name
                      </label>
                      <input
                        type="text"
                        value={doctorName}
                        onChange={(e) => setDoctorName(e.target.value)}
                        placeholder="e.g. Dr. Shreyash Jain"
                        className="w-full bg-gray-50 border border-gray-200/80 rounded-2xl px-5 py-4 text-sm font-semibold text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] focus:outline-none transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#0a2540]/60 mb-2 block">
                        Clinic Name
                      </label>
                      <input
                        type="text"
                        value={clinicName}
                        onChange={(e) => setClinicName(e.target.value)}
                        placeholder="e.g. Bright Smiles Dental"
                        className="w-full bg-gray-50 border border-gray-200/80 rounded-2xl px-5 py-4 text-sm font-semibold text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] focus:outline-none transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#0a2540]/60 mb-2 block">
                        Clinic Address
                      </label>
                      <textarea
                        value={clinicAddress}
                        onChange={(e) => setClinicAddress(e.target.value)}
                        placeholder="e.g. 123 Dental Suite, Medical District"
                        className="w-full bg-gray-50 border border-gray-200/80 rounded-2xl px-5 py-4 text-sm font-semibold text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] focus:outline-none transition-all h-20 resize-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#0a2540]/60 mb-2 block">
                        Operating Hours
                      </label>
                      <input
                        type="text"
                        value={operatingHours}
                        onChange={(e) => setOperatingHours(e.target.value)}
                        placeholder="e.g. Mon-Sat: 10AM - 8PM, Sun: Closed"
                        className="w-full bg-gray-50 border border-gray-200/80 rounded-2xl px-5 py-4 text-sm font-semibold text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] focus:outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-[#0a2540] hover:bg-[#10b981] text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-md disabled:opacity-50"
                  >
                    {loading ? 'Saving Profile...' : 'Save Profile Details'}
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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

              <div className="max-w-xl mx-auto w-full px-6 pb-12 pt-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-[#0a2540]">
                      Account Settings
                    </h3>
                    <p className="text-xs text-gray-500 font-semibold mt-0.5">Manage your practice credentials and AI settings</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 transition-all text-red-600 hover:text-red-700 text-xs font-black uppercase tracking-wider flex items-center gap-2 focus:outline-none shadow-sm"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
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
                </div>

                {/* Tab selectors */}
                <div className="flex gap-2 border-b border-gray-100 pb-4 mb-6">
                  <button
                    type="button"
                    onClick={() => { setActiveTab('knowledge'); setErrorMsg(''); setSuccessMsg(''); }}
                    className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                      activeTab === 'knowledge'
                        ? 'bg-[#0a2540] text-white shadow-sm'
                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100/80'
                    }`}
                  >
                    AI Guidelines
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('password'); setErrorMsg(''); setSuccessMsg(''); }}
                    className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                      activeTab === 'password'
                        ? 'bg-[#0a2540] text-white shadow-sm'
                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100/80'
                    }`}
                  >
                    Password
                  </button>
                </div>

                {/* Error & Success Messages */}
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 mb-6 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-3 animate-pulse"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </motion.div>
                )}

                {successMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 mb-6 bg-green-50 border border-green-100 text-[#10b981] rounded-2xl text-xs font-bold flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{successMsg}</span>
                  </motion.div>
                )}

                {/* 1. AI Guidelines (Knowledge Base) */}
                {activeTab === 'knowledge' && (
                  <div className="space-y-8">
                    <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/30 flex items-start gap-4">
                      <FileText className="w-5 h-5 text-[#10b981] mt-0.5" />
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-[#0a2540]">AI Receptionist Guidelines</h4>
                        <p className="text-[10px] text-gray-400 font-medium">Add rules or custom instructions for the AI receptionist to follow when chatting with patients.</p>
                      </div>
                    </div>

                    {/* Add Guideline Form */}
                    <form onSubmit={handleAddKnowledge} className="space-y-4 p-5 bg-gray-50/60 border border-gray-100 rounded-2xl">
                      <h4 className="text-xs font-black uppercase tracking-widest text-[#0a2540] mb-2">Add New Guideline</h4>
                      <div>
                        <input
                          type="text"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          placeholder="Title (e.g., Refund Policy, Pricing info)"
                          className="w-full bg-white border border-gray-200/80 rounded-2xl px-5 py-3.5 text-xs font-semibold text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] focus:outline-none transition-all"
                        />
                      </div>
                      <div>
                        <textarea
                          value={newDescription}
                          onChange={(e) => setNewDescription(e.target.value)}
                          placeholder="Rule description or text instructions for the AI..."
                          className="w-full bg-white border border-gray-200/80 rounded-2xl px-5 py-3.5 text-xs font-semibold text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] focus:outline-none transition-all h-24 resize-none"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-[#10b981] hover:bg-[#0d9668] text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
                      >
                        {loading ? 'Adding...' : 'Add Guideline'}
                      </button>
                    </form>

                    {/* Guideline List */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-[#0a2540]">Active AI Guidelines</h4>
                      {knowledgeList.length === 0 ? (
                        <p className="text-xs text-gray-400 font-medium italic">No custom guidelines found. The AI receptionist is using standard clinic defaults.</p>
                      ) : (
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                          {knowledgeList.map((item) => (
                            <div key={item.id} className="p-4 bg-white border border-gray-100 rounded-2xl flex justify-between items-start gap-4 hover:border-gray-200/80 transition-all shadow-sm">
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-bold text-[#0a2540] truncate">{item.title || 'Untitled Guideline'}</div>
                                <div className="text-[11px] text-gray-500 font-medium mt-1 leading-relaxed break-words">{item.content}</div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleDeleteKnowledge(item.id)}
                                className="text-[10px] font-black uppercase tracking-wider text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100/65 px-3 py-1.5 rounded-lg transition-all focus:outline-none shrink-0"
                              >
                                Delete
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. Password Modification */}
                {activeTab === 'password' && (
                  <form onSubmit={handleChangePassword} className="space-y-6">
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-4">
                      <Lock className="w-5 h-5 text-[#10b981] mt-0.5" />
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-[#0a2540]">Change Password</h4>
                        <p className="text-[10px] text-gray-400 font-medium">Keep your account secure with regular updates.</p>
                      </div>
                    </div>

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
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
