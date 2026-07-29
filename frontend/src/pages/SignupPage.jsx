import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, Mail, Lock, ArrowRight, User, Phone, Globe, ShieldCheck } from 'lucide-react';

const SignupPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    clinic: '',
    phone: '',
    password: '',
    plan: 'starter' // default plan
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // For demo: Mock Razorpay flow and navigate to onboarding
    localStorage.setItem('authToken', 'demo-token');
    localStorage.setItem('userPlan', formData.plan);
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-6 overflow-hidden bg-[#020617] py-20">
      {/* Visual Background */}
      <div className="mesh-gradient" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl z-10"
      >
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center gap-3 group mb-8">
            <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(37,99,235,0.4)]">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter">BMA <span className="text-blue-500">AI</span></span>
          </Link>
          <h1 className="text-5xl font-black tracking-tight uppercase">REQUEST <span className="text-gradient">DEPLOYMENT</span></h1>
          <p className="text-gray-400 font-medium mt-2">Join the autonomous era of clinical coordination.</p>
        </div>

        <div className="cyber-card p-12 relative overflow-hidden">
          <div className="scanline" />
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input 
                    type="text" required placeholder="Dr. Shreyash Jain"
                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm font-medium focus:border-blue-500/50 focus:bg-blue-500/5 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Clinic Name</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input 
                    type="text" required placeholder="Precision Dental Care"
                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm font-medium focus:border-blue-500/50 focus:bg-blue-500/5 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Work Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input 
                    type="email" required placeholder="shreyash@clinic.com"
                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm font-medium focus:border-blue-500/50 focus:bg-blue-500/5 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">WhatsApp Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input 
                    type="tel" required placeholder="+91 7000016180"
                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm font-medium focus:border-blue-500/50 focus:bg-blue-500/5 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Secure Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input 
                  type="password" required placeholder="••••••••••••"
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm font-medium focus:border-blue-500/50 focus:bg-blue-500/5 outline-none transition-all"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Select Your Intelligence Level</label>
              <div className="grid grid-cols-2 gap-4">
                <div 
                  onClick={() => setFormData({...formData, plan: 'starter'})}
                  className={`cursor-pointer p-4 rounded-2xl border transition-all ${formData.plan === 'starter' ? 'bg-blue-500/10 border-blue-500 text-blue-400' : 'bg-white/5 border-white/5 text-gray-400 hover:border-white/20'}`}
                >
                  <div className="text-sm font-black uppercase mb-1">Starter Pack</div>
                  <div className="text-xl font-black text-white">₹499<span className="text-[10px] text-gray-500">/mo</span></div>
                </div>
                <div 
                  onClick={() => setFormData({...formData, plan: 'pro'})}
                  className={`cursor-pointer p-4 rounded-2xl border relative transition-all ${formData.plan === 'pro' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' : 'bg-white/5 border-white/5 text-gray-400 hover:border-white/20'}`}
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-500 text-white text-[8px] font-black tracking-widest uppercase rounded-full">PRO</div>
                  <div className="text-sm font-black uppercase mb-1">Professional</div>
                  <div className="text-xl font-black text-white">₹999<span className="text-[10px] text-gray-500">/mo</span></div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button type="submit" className="w-full cyber-button py-5 text-sm tracking-widest uppercase flex items-center justify-center gap-3">
                INITIALIZE DEPLOYMENT
                <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-[10px] text-center text-gray-500 mt-6 font-bold tracking-widest uppercase">
                BY INITIALIZING, YOU AGREE TO OUR <a href="#" className="text-blue-500 underline">TERMS OF SERVICE</a>
              </p>
            </div>
          </form>

          <div className="mt-12 pt-8 border-t border-white/5 text-center">
            <p className="text-gray-500 text-xs font-bold tracking-tight">
              Already part of the network? <Link to="/login" className="text-blue-500 hover:text-blue-400">Initialize Session</Link>
            </p>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-8 opacity-40">
          {[
            { icon: ShieldCheck, text: 'Bank-Grade Security' },
            { icon: Bot, text: 'Autonomous Ready' },
            { icon: Globe, text: 'Global Network' }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-3 text-center">
              <item.icon className="w-6 h-6 text-blue-500" />
              <div className="text-[10px] font-black uppercase tracking-widest leading-tight">{item.text}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;
