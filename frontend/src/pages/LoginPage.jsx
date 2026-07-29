import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    // For demo: set a fake token and navigate to dashboard
    localStorage.setItem('authToken', 'demo-token');
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-6 overflow-hidden bg-[#020617]">
      {/* Visual Background */}
      <div className="mesh-gradient" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-3 group mb-8">
            <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(37,99,235,0.4)]">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter">BMA <span className="text-blue-500">AI</span></span>
          </Link>
          <h1 className="text-4xl font-black tracking-tight uppercase">WELCOME <span className="text-gradient">BACK</span></h1>
          <p className="text-gray-400 font-medium mt-2">Initialize your clinical session.</p>
        </div>

        <div className="cyber-card p-10 relative overflow-hidden">
          <div className="scanline" />
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input 
                  type="email" 
                  required
                  placeholder="name@clinic.com"
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm font-medium focus:border-blue-500/50 focus:bg-blue-500/5 outline-none transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Password</label>
                <a href="#" className="text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-400">Forgot?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm font-medium focus:border-blue-500/50 focus:bg-blue-500/5 outline-none transition-all"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <button type="submit" className="w-full cyber-button py-5 text-sm tracking-widest uppercase flex items-center justify-center gap-3">
              INITIALIZE SESSION
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-gray-500 text-xs font-bold tracking-tight">
              Don't have an account? <Link to="/signup" className="text-blue-500 hover:text-blue-400">Request Deployment</Link>
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-8 opacity-40">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4 text-blue-500" /> Secure Encryption
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
            <Bot className="w-4 h-4 text-blue-500" /> AI Identity Verified
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
