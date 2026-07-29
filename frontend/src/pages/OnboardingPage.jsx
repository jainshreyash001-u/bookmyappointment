import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calendar, ShieldCheck, MessageSquare, CheckCircle2, ArrowRight, Bot } from 'lucide-react';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [whatsappTested, setWhatsappTested] = useState(false);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-6 overflow-hidden bg-[#020617] py-20">
      <div className="mesh-gradient" />
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-3xl z-10"
      >
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 group mb-8">
            <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.4)]">
              <Bot className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-black tracking-tight uppercase">SYSTEM <span className="text-gradient">ONBOARDING</span></h1>
          <p className="text-gray-400 font-medium mt-2">Configure your autonomous practice.</p>
        </div>

        <div className="cyber-card p-10 relative overflow-hidden min-h-[400px] flex flex-col">
          <div className="scanline" />
          
          {/* Progress Bar */}
          <div className="flex items-center justify-between mb-12 relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/5 rounded-full z-0" />
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-500 rounded-full z-0 transition-all duration-500" 
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            />
            
            {[1, 2, 3].map((s) => (
              <div 
                key={s} 
                className={`w-10 h-10 rounded-xl relative z-10 flex items-center justify-center text-sm font-black transition-all duration-500 ${step >= s ? 'bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.5)]' : 'bg-[#0f172a] text-gray-500 border border-white/5'}`}
              >
                {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
              </div>
            ))}
          </div>

          <div className="flex-1 flex flex-col justify-center">
            {/* Step 1: Google Calendar */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-center">
                <Calendar className="w-16 h-16 text-blue-500 mx-auto mb-6" />
                <h2 className="text-2xl font-black uppercase tracking-tight mb-4">Sync Google Calendar</h2>
                <p className="text-gray-400 font-medium mb-8 max-w-md mx-auto">
                  The AI needs read/write access to your clinic's calendar to automatically block slots and check availability.
                </p>
                <button 
                  onClick={() => setGoogleConnected(true)}
                  className={`px-8 py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all border flex items-center gap-3 mx-auto ${googleConnected ? 'bg-green-500/10 border-green-500 text-green-400' : 'glass border-white/10 text-white hover:border-blue-500 hover:bg-blue-500/10'}`}
                >
                  {googleConnected ? <><CheckCircle2 className="w-5 h-5" /> SYNCED SUCCESSFULLY</> : 'CONNECT CALENDAR WITH OAUTH'}
                </button>
              </motion.div>
            )}

            {/* Step 2: Policies */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <ShieldCheck className="w-16 h-16 text-blue-500 mx-auto mb-6" />
                <h2 className="text-2xl font-black uppercase tracking-tight mb-4 text-center">Clinic Policies & Hours</h2>
                <p className="text-gray-400 font-medium mb-8 max-w-md mx-auto text-center">
                  Teach your AI the rules of your clinic. You can update these anytime.
                </p>
                <div className="space-y-4 max-w-md mx-auto">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Daily Operating Hours</label>
                    <input type="text" placeholder="e.g. Mon-Sat: 10AM - 8PM, Sun: Closed" className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-sm font-medium focus:border-blue-500/50 outline-none mt-1" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Cancellation Policy</label>
                    <input type="text" placeholder="e.g. Requires 24h notice" className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-sm font-medium focus:border-blue-500/50 outline-none mt-1" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Test WhatsApp */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-center">
                <MessageSquare className="w-16 h-16 text-blue-500 mx-auto mb-6" />
                <h2 className="text-2xl font-black uppercase tracking-tight mb-4">Initialize WhatsApp</h2>
                <p className="text-gray-400 font-medium mb-8 max-w-md mx-auto">
                  Send a test message to your configured number to verify the AI assistant is active and responding.
                </p>
                <button 
                  onClick={() => setWhatsappTested(true)}
                  className={`px-8 py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all border flex items-center gap-3 mx-auto ${whatsappTested ? 'bg-green-500/10 border-green-500 text-green-400' : 'glass border-white/10 text-white hover:border-blue-500 hover:bg-blue-500/10'}`}
                >
                  {whatsappTested ? <><CheckCircle2 className="w-5 h-5" /> AI IS RESPONDING</> : 'SEND TEST MESSAGE'}
                </button>
              </motion.div>
            )}
          </div>

          <div className="mt-8 pt-8 border-t border-white/5 flex justify-between items-center">
            {step > 1 ? (
              <button 
                onClick={() => setStep(step - 1)}
                className="text-gray-500 text-xs font-black uppercase tracking-widest hover:text-white transition-colors"
              >
                Back
              </button>
            ) : <div />}
            
            <button 
              onClick={handleNext}
              disabled={(step === 1 && !googleConnected) || (step === 3 && !whatsappTested)}
              className="cyber-button px-8 py-4 text-xs tracking-widest uppercase flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {step === 3 ? 'FINISH SETUP' : 'CONTINUE'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingPage;
