import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calendar, ShieldCheck, MessageSquare, CheckCircle2, ArrowRight, Bot } from 'lucide-react';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [whatsappTested, setWhatsappTested] = useState(false);
  const [operatingHours, setOperatingHours] = useState('Mon-Sat: 10AM - 8PM, Sun: Closed');
  const [cancellationPolicy, setCancellationPolicy] = useState('Requires 24h notice');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleConnectCalendar = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';
      const res = await fetch(`${API_BASE}/api/dentist/calendar-url`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
            const profileData = await profileRes.json();
            if (profileData.calendarConnected) {
              setGoogleConnected(true);
              clearInterval(interval);
              setLoading(false);
            }
          } catch (e) {
            console.error('Error polling calendar status:', e);
          }
        }, 2000);

        // Auto-clear interval if popup is closed manually
        const checkClosed = setInterval(() => {
          if (popup && popup.closed && !googleConnected) {
            clearInterval(interval);
            clearInterval(checkClosed);
            setLoading(false);
          }
        }, 1000);
      } else {
        setErrorMsg(data.error || 'Failed to fetch calendar OAuth URL');
        setLoading(false);
      }
    } catch (err) {
      setErrorMsg('Could not fetch calendar URL');
      setLoading(false);
    }
  };

  const handleSavePolicies = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';
      
      // Save working hours to Database
      const resProfile = await fetch(`${API_BASE}/api/dentist/profile`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          workingHours: { hours: operatingHours }
        })
      });
      const dataProfile = await resProfile.json();
      if (!dataProfile.success) {
        throw new Error(dataProfile.error || 'Failed to save working hours');
      }

      // Save Cancellation Policy to Database
      const resKnowledge = await fetch(`${API_BASE}/api/dentist/knowledge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          entries: [
            {
              title: 'Cancellation Policy',
              description: cancellationPolicy,
              type: 'policy'
            }
          ]
        })
      });
      const dataKnowledge = await resKnowledge.json();
      if (!dataKnowledge.success) {
        throw new Error(dataKnowledge.error || 'Failed to save cancellation policy');
      }

      setStep(3);
    } catch (err) {
      setErrorMsg(err.message || 'Could not save clinic settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestMessage = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';
      
      const res = await fetch(`${API_BASE}/api/dentist/test-whatsapp`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setWhatsappTested(true);
      } else {
        setErrorMsg(data.error || 'Failed to send test message');
      }
    } catch (err) {
      setErrorMsg('Could not trigger test WhatsApp message');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      handleSavePolicies();
    } else if (step === 3) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-6 overflow-hidden bg-white py-20 text-[#0a2540]">
      <div className="mesh-gradient" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-3xl z-10"
      >
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 group mb-8">
            <div className="w-12 h-12 bg-[#0a2540] rounded-2xl flex items-center justify-center shadow-md">
              <Bot className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-black tracking-tight uppercase text-[#0a2540]">
            SYSTEM <span className="text-gradient-clinical">ONBOARDING</span>
          </h1>
          <p className="text-gray-500 font-medium mt-2">Configure your autonomous practice.</p>
        </div>

        <div className="clinical-card p-10 relative overflow-hidden min-h-[400px] flex flex-col">
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold text-center">
              {errorMsg}
            </div>
          )}

          {/* Progress Bar */}
          <div className="flex items-center justify-between mb-12 relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 rounded-full z-0" />
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#10b981] rounded-full z-0 transition-all duration-500" 
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            />
            
            {[1, 2, 3].map((s) => (
              <div 
                key={s} 
                className={`w-10 h-10 rounded-xl relative z-10 flex items-center justify-center text-sm font-black transition-all duration-500 ${step >= s ? 'bg-[#10b981] text-white shadow-md' : 'bg-gray-50 text-gray-400 border border-gray-200'}`}
              >
                {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
              </div>
            ))}
          </div>

          <div className="flex-1 flex flex-col justify-center">
            {/* Step 1: Google Calendar */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-center">
                <Calendar className="w-16 h-16 text-[#10b981] mx-auto mb-6" />
                <h2 className="text-2xl font-black uppercase tracking-tight mb-4 text-[#0a2540]">Sync Google Calendar</h2>
                <p className="text-gray-500 font-medium mb-8 max-w-md mx-auto">
                  The AI needs read/write access to your clinic's calendar to automatically block slots and check availability.
                </p>
                <button 
                  onClick={handleConnectCalendar}
                  disabled={loading}
                  className={`px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border flex items-center gap-3 mx-auto disabled:opacity-50 ${googleConnected ? 'bg-[#10b981]/10 border-[#10b981] text-[#10b981]' : 'bg-white border-gray-200 text-[#0a2540] hover:border-[#10b981] hover:bg-gray-50'}`}
                >
                  {googleConnected ? <><CheckCircle2 className="w-5 h-5" /> SYNCED SUCCESSFULLY</> : (loading ? 'CONNECTING...' : 'CONNECT CALENDAR WITH OAUTH')}
                </button>
              </motion.div>
            )}

            {/* Step 2: Policies */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <ShieldCheck className="w-16 h-16 text-[#10b981] mx-auto mb-6" />
                <h2 className="text-2xl font-black uppercase tracking-tight mb-4 text-center text-[#0a2540]">Clinic Policies & Hours</h2>
                <p className="text-gray-500 font-medium mb-8 max-w-md mx-auto text-center">
                  Teach your AI the rules of your clinic. You can update these anytime.
                </p>
                <div className="space-y-4 max-w-md mx-auto">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#0a2540]/80 ml-1">Daily Operating Hours</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Mon-Sat: 10AM - 8PM, Sun: Closed" 
                      className="w-full bg-gray-50 border border-gray-200/80 rounded-2xl py-3 px-4 text-sm font-medium focus:bg-white focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981]/20 outline-none mt-1 text-[#0a2540]" 
                      value={operatingHours}
                      onChange={(e) => setOperatingHours(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#0a2540]/80 ml-1">Cancellation Policy</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Requires 24h notice" 
                      className="w-full bg-gray-50 border border-gray-200/80 rounded-2xl py-3 px-4 text-sm font-medium focus:bg-white focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981]/20 outline-none mt-1 text-[#0a2540]" 
                      value={cancellationPolicy}
                      onChange={(e) => setCancellationPolicy(e.target.value)}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Test WhatsApp */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-center">
                <MessageSquare className="w-16 h-16 text-[#10b981] mx-auto mb-6" />
                <h2 className="text-2xl font-black uppercase tracking-tight mb-4 text-[#0a2540]">Initialize WhatsApp</h2>
                <p className="text-gray-500 font-medium mb-8 max-w-md mx-auto">
                  Send a test message to your configured number to verify the AI assistant is active and responding.
                </p>
                <button 
                  onClick={handleSendTestMessage}
                  disabled={loading}
                  className={`px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border flex items-center gap-3 mx-auto disabled:opacity-50 ${whatsappTested ? 'bg-[#10b981]/10 border-[#10b981] text-[#10b981]' : 'bg-white border-gray-200 text-[#0a2540] hover:border-[#10b981] hover:bg-gray-50'}`}
                >
                  {whatsappTested ? <><CheckCircle2 className="w-5 h-5" /> AI IS RESPONDING</> : (loading ? 'SENDING TEST...' : 'SEND TEST MESSAGE')}
                </button>
              </motion.div>
            )}
          </div>

          <div className="mt-8 pt-8 border-t border-gray-100 flex justify-between items-center">
            {step > 1 ? (
              <button 
                onClick={() => setStep(step - 1)}
                disabled={loading}
                className="text-gray-400 text-xs font-black uppercase tracking-widest hover:text-[#0a2540] transition-colors disabled:opacity-50"
              >
                Back
              </button>
            ) : <div />}
            
            <button 
              onClick={handleNext}
              disabled={loading || (step === 1 && !googleConnected) || (step === 3 && !whatsappTested)}
              className="clinical-btn-primary px-8 py-4 text-xs tracking-widest uppercase flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'SAVING...' : (step === 3 ? 'FINISH SETUP' : 'CONTINUE')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingPage;
