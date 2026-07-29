import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Mail, Lock, KeyRound, ArrowRight, ShieldCheck, Activity } from 'lucide-react';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ email: '', password: '', code: '' });

  const [errorMsg, setErrorMsg] = useState('');

  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await fetch('http://localhost:3001/api/admin/auth/step1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      const data = await res.json();
      if (data.success) {
        setStep(2);
      } else {
        setErrorMsg(data.error || 'Authentication failed');
      }
    } catch (err) {
      setErrorMsg('Server connection failed');
    }
  };

  const handle2FASubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await fetch('http://localhost:3001/api/admin/auth/step2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: formData.code })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminRole', data.role);
        navigate('/admin/dashboard');
      } else {
        setErrorMsg(data.error || 'Invalid 2FA Code');
      }
    } catch (err) {
      setErrorMsg('Server connection failed');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-6 overflow-hidden bg-[#020617]">
      <div className="mesh-gradient" />
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-red-600/10 blur-[150px] rounded-full animate-pulse" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl mb-6 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-3xl font-black tracking-tight uppercase text-white">
            ADMIN <span className="text-red-500">AUTHORIZATION</span>
          </h1>
          <p className="text-gray-400 font-medium mt-2 text-sm">
            Restricted Area. IP tracking is active.
          </p>
        </div>

        <div className="cyber-card p-10 border-red-500/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-orange-500" />
          <div className="scanline bg-red-500/5" />
          
          {errorMsg && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold text-center">
              {errorMsg}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleInitialSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Admin Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input 
                    type="email" 
                    required
                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm font-medium focus:border-red-500/50 focus:bg-red-500/5 outline-none transition-all"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Master Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input 
                    type="password" 
                    required
                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm font-medium focus:border-red-500/50 focus:bg-red-500/5 outline-none transition-all"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>

              <button type="submit" className="w-full bg-red-600 hover:bg-red-500 text-white font-black tracking-widest uppercase py-5 rounded-xl text-sm transition-colors flex items-center justify-center gap-3">
                AUTHENTICATE
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          ) : (
            <form onSubmit={handle2FASubmit} className="space-y-6">
              <div className="text-center mb-6">
                <ShieldCheck className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-white font-bold text-lg">2FA Required</h3>
                <p className="text-gray-400 text-xs mt-1">Enter the 6-digit code from your authenticator app.</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Authentication Code</label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input 
                    type="text" 
                    required
                    maxLength="6"
                    placeholder="000000"
                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-xl tracking-[0.5em] font-medium focus:border-red-500/50 focus:bg-red-500/5 outline-none transition-all text-center"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                  />
                </div>
              </div>

              <button type="submit" className="w-full bg-red-600 hover:bg-red-500 text-white font-black tracking-widest uppercase py-5 rounded-xl text-sm transition-colors flex items-center justify-center gap-3">
                VERIFY & ENTER
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <button type="button" onClick={() => setStep(1)} className="w-full text-xs font-bold text-gray-500 hover:text-white transition-colors">
                CANCEL
              </button>
            </form>
          )}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 glass border border-white/5 rounded-xl">
            <Activity className="w-4 h-4 text-green-500" />
            <div>
              <div className="text-[8px] font-black uppercase tracking-widest text-gray-500">System Status</div>
              <div className="text-xs font-bold text-white">All Systems Operational</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 glass border border-white/5 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-blue-500" />
            <div>
              <div className="text-[8px] font-black uppercase tracking-widest text-gray-500">Active Connection</div>
              <div className="text-xs font-bold text-white">IP Whitelisted</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;
