import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userPlan', data.dentist.plan || 'starter');
        localStorage.setItem('dentistId', data.dentist.dentistId);
        window.location.href = '/dashboard';
      } else {
        setErrorMsg(data.error || 'Login failed');
      }
    } catch (err) {
      setErrorMsg('Could not connect to authentication server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-6 overflow-hidden bg-white text-[#0a2540]">
      <div className="mesh-gradient" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-3 group mb-8">
            <div className="w-12 h-12 bg-[#0a2540] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-[#0a2540]">BMA <span className="text-[#10b981]">AI</span></span>
          </Link>
          <h1 className="text-4xl font-black tracking-tight uppercase text-[#0a2540]">WELCOME <span className="text-gradient-clinical">BACK</span></h1>
          <p className="text-gray-500 font-medium mt-2">Login to your clinical account.</p>
        </div>

        <div className="clinical-card p-10 relative overflow-hidden">
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold text-center">
              {errorMsg}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#0a2540]/80 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0a2540]/40" />
                <input 
                  type="email" 
                  required
                  placeholder="name@clinic.com"
                  className="w-full bg-gray-50 border border-gray-200/80 rounded-2xl py-4 pl-12 pr-6 text-sm font-medium focus:bg-white focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981]/20 outline-none transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#0a2540]/80">Password</label>
                <a href="#" className="text-[10px] font-black uppercase tracking-widest text-[#10b981] hover:text-[#0d9668] transition-colors">Forgot?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0a2540]/40" />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border border-gray-200/80 rounded-2xl py-4 pl-12 pr-6 text-sm font-medium focus:bg-white focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981]/20 outline-none transition-all"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="clinical-btn-primary w-full py-4 text-xs tracking-wider uppercase font-black flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? 'LOGGING IN...' : 'LOGIN'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-100 text-center">
            <p className="text-gray-500 text-xs font-bold tracking-tight">
              Don't have an account? <Link to="/signup" className="text-[#10b981] hover:text-[#0d9668] transition-colors">Sign Up</Link>
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-8 opacity-80 text-[#0a2540]/80">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4 text-[#10b981]" /> Secure Encryption
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
            <Bot className="w-4 h-4 text-[#10b981]" /> AI Identity Verified
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
