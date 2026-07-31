import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, Mail, Lock, ArrowRight, User, Phone, Globe, ShieldCheck } from 'lucide-react';

const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    clinic: '',
    phone: '',
    password: '',
    plan: 'starter'
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          clinicName: formData.clinic,
          phoneNumber: formData.phone,
          password: formData.password,
          workingHours: {},
          slackMode: 'none'
        })
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userPlan', formData.plan);
        localStorage.setItem('dentistId', data.dentist.dentistId);
        navigate('/onboarding');
      } else {
        setErrorMsg(data.error || 'Registration failed');
      }
    } catch (err) {
      setErrorMsg('Could not connect to authentication server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-6 overflow-hidden bg-white py-20 text-[#0a2540]">
      <div className="mesh-gradient" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl z-10"
      >
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center gap-3 group mb-8">
            <div className="w-12 h-12 bg-[#0a2540] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-[#0a2540]">BMA <span className="text-[#10b981]">AI</span></span>
          </Link>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight uppercase text-[#0a2540]">
            REQUEST <span className="text-gradient-clinical">DEPLOYMENT</span>
          </h1>
          <p className="text-gray-500 font-medium mt-2">Join the autonomous era of clinical coordination.</p>
        </div>

        <div className="clinical-card p-8 sm:p-12 relative overflow-hidden">
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold text-center">
              {errorMsg}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#0a2540]/80 ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0a2540]/40" />
                  <input 
                    type="text" required placeholder="Dr. Shreyash Jain"
                    className="w-full bg-gray-50 border border-gray-200/80 rounded-2xl py-4 pl-12 pr-6 text-sm font-medium focus:bg-white focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981]/20 outline-none transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#0a2540]/80 ml-1">Clinic Name</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0a2540]/40" />
                  <input 
                    type="text" required placeholder="Precision Dental Care"
                    className="w-full bg-gray-50 border border-gray-200/80 rounded-2xl py-4 pl-12 pr-6 text-sm font-medium focus:bg-white focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981]/20 outline-none transition-all"
                    value={formData.clinic}
                    onChange={(e) => setFormData({...formData, clinic: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#0a2540]/80 ml-1">Work Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0a2540]/40" />
                  <input 
                    type="email" required placeholder="shreyash@clinic.com"
                    className="w-full bg-gray-50 border border-gray-200/80 rounded-2xl py-4 pl-12 pr-6 text-sm font-medium focus:bg-white focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981]/20 outline-none transition-all"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#0a2540]/80 ml-1">WhatsApp Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0a2540]/40" />
                  <input 
                    type="tel" required placeholder="+91 9999999999"
                    className="w-full bg-gray-50 border border-gray-200/80 rounded-2xl py-4 pl-12 pr-6 text-sm font-medium focus:bg-white focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981]/20 outline-none transition-all"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#0a2540]/80 ml-1">Secure Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0a2540]/40" />
                <input 
                  type="password" required placeholder="••••••••••••"
                  className="w-full bg-gray-50 border border-gray-200/80 rounded-2xl py-4 pl-12 pr-6 text-sm font-medium focus:bg-white focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981]/20 outline-none transition-all"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#0a2540]/80 ml-1">Select Your Intelligence Level</label>
              <div className="grid grid-cols-2 gap-4">
                <div 
                  onClick={() => setFormData({...formData, plan: 'starter'})}
                  className={`cursor-pointer p-4 rounded-2xl border transition-all ${formData.plan === 'starter' ? 'bg-[#10b981]/5 border-[#10b981] text-[#10b981]' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'}`}
                >
                  <div className="text-xs font-black uppercase mb-1">Starter Pack</div>
                  <div className="text-lg font-black text-[#0a2540]">₹499<span className="text-[10px] text-gray-400 font-bold">/mo</span></div>
                </div>
                <div 
                  onClick={() => setFormData({...formData, plan: 'pro'})}
                  className={`cursor-pointer p-4 rounded-2xl border relative transition-all ${formData.plan === 'pro' ? 'bg-[#0a2540]/5 border-[#0a2540] text-[#0a2540]' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'}`}
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-[#0a2540] text-white text-[8px] font-black tracking-widest uppercase rounded-full">PRO</div>
                  <div className="text-xs font-black uppercase mb-1">Professional</div>
                  <div className="text-lg font-black text-[#0a2540]">₹999<span className="text-[10px] text-gray-400 font-bold">/mo</span></div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={loading} 
                className="clinical-btn-primary w-full py-4 text-xs tracking-wider uppercase font-black flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? 'INITIALIZING...' : 'INITIALIZE DEPLOYMENT'}
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[10px] text-center text-gray-400 mt-6 font-bold tracking-widest uppercase">
                BY SIGNING UP, YOU AGREE TO OUR <a href="#" className="text-[#10b981] underline">TERMS OF SERVICE</a>
              </p>
            </div>
          </form>

          <div className="mt-10 pt-8 border-t border-gray-100 text-center">
            <p className="text-gray-500 text-xs font-bold tracking-tight">
              Already part of the network? <Link to="/login" className="text-[#10b981] hover:text-[#0d9668] transition-colors">Login</Link>
            </p>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-8 opacity-80">
          {[
            { icon: ShieldCheck, text: 'Bank-Grade Security' },
            { icon: Bot, text: 'Autonomous Ready' },
            { icon: Globe, text: 'Global Network' }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-2 text-center text-[#0a2540]/80">
              <item.icon className="w-6 h-6 text-[#10b981]" />
              <div className="text-[10px] font-black uppercase tracking-widest leading-tight">{item.text}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;
