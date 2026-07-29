import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Zap, XCircle, TrendingUp, Users, Activity, Globe, Bot, Calendar, ArrowUpRight, MessageSquare, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  // ROI Calculator State
  const [missedCalls, setMissedCalls] = useState(25);
  const [avgTicket, setAvgTicket] = useState(1500);

  // Calculations
  const conversionRate = 0.65; // 65% booking success rate
  const weeklyRecovered = Math.round(missedCalls * avgTicket * conversionRate);
  const monthlyRecovered = Math.round(weeklyRecovered * 4.3);
  const hoursSaved = Math.round(missedCalls * 0.25 * 4.3); // 15 mins saved per call/reminder

  // FAQ Accordion State
  const [activeFaq, setActiveFaq] = useState(null);

  const faqs = [
    {
      q: "Does it integrate with my existing clinic system?",
      a: "Yes! BookMyAppointment syncs directly with Google Calendar and Airtable with a 1-click authorization. There is no complicated software integration or technical background required."
    },
    {
      q: "How does the 6-Hour automatic slot release rule work?",
      a: "If a patient books an appointment, the AI receptionist sends a confirmation request on WhatsApp 24 hours prior. If there is no reply, the AI calls the patient twice. If they remain unconfirmed 6 hours before the appointment, the slot is automatically freed and offered to patients on the waitlist."
    },
    {
      q: "Can the AI handle senior patients who use voice notes?",
      a: "Absolutely. Our agent runs on Whisper v3. Patients can send voice notes in their regional dialect, and the AI will transcribe, understand, and reply back instantly with text."
    },
    {
      q: "Which languages are supported?",
      a: "We support 12+ major Indian languages, including Hindi, English, Marathi, Telugu, Tamil, Bengali, Kannada, Malayalam, Gujarati, Punjabi, Odia, and Assamese."
    }
  ];

  return (
    <div className="relative pb-24">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-16 lg:pb-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="z-10"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0a2540] leading-[1.1] mb-6">
              The 24/7 AI Receptionist Built for <span className="text-gradient-accent">Dental Clinics</span>
            </h1>
            
            <p className="text-lg text-gray-600 mb-8 max-w-lg leading-relaxed font-medium">
              Never miss a patient call. Automate bookings, confirm appointments, and automatically recycle empty slots on WhatsApp and voice—fully integrated with your calendar.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/signup" className="clinical-btn-accent px-8 py-4 text-sm tracking-wide uppercase flex items-center justify-center gap-2 group">
                Start 14-Day Free Trial
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a href="#roi-calculator" className="clinical-btn-secondary px-8 py-4 text-sm tracking-wide uppercase flex items-center justify-center gap-2">
                Calculate your ROI
              </a>
            </div>

            {/* Value Proposition */}
            <div className="mt-12 pt-8 border-t border-gray-100">
              <p className="text-base font-bold text-[#0a2540] flex items-center gap-3 leading-relaxed">
                <span className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                Built to eliminate the #1 revenue leak in clinics: missed calls and slow rebooking.
              </p>
            </div>
          </motion.div>

          {/* Hero Visual Mockup */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative flex items-center justify-center w-full"
          >
            <div className="absolute inset-0 bg-[#3b82f6]/5 blur-[80px] rounded-full" />
            <div className="relative z-10 p-2.5 bg-white rounded-3xl border border-gray-200/80 shadow-2xl overflow-hidden w-full max-w-lg">
              <div className="bg-[#f8fafc] border border-gray-100 rounded-2xl p-6">
                {/* Simulated Conversation Feed */}
                <div className="flex items-center justify-between border-b border-gray-200/60 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#0a2540] rounded-xl flex items-center justify-center text-white">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#0a2540]">BMA AI Coordinator</h4>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Status: Online</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-[#10b981]/15 text-[#0d9668] text-[10px] font-black uppercase tracking-wider rounded-md">WhatsApp Active</span>
                </div>

                <div className="space-y-4 text-xs font-medium">
                  <div className="bg-white border border-gray-200/60 p-3.5 rounded-2xl max-w-[85%] self-start text-gray-600">
                    "Hi! I want to reschedule my dental checkup for tomorrow afternoon. Do you have any slots available?"
                  </div>
                  <div className="bg-[#0a2540] text-white p-3.5 rounded-2xl max-w-[85%] ml-auto text-right">
                    "Checking availability... Yes, Dr. Singhal has a slot open at 3:00 PM or 4:30 PM tomorrow. Which one works best for you?"
                  </div>
                  <div className="bg-white border border-gray-200/60 p-3.5 rounded-2xl max-w-[85%] self-start text-gray-600">
                    "4:30 PM is perfect."
                  </div>
                  <div className="bg-[#10b981] text-white p-3.5 rounded-2xl max-w-[85%] ml-auto text-right font-bold flex items-center gap-2 justify-end">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    "Confirmed! Google Calendar updated & WhatsApp reminder scheduled."
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Problem vs Solution Comparison Section */}
      <section className="py-20 px-6 bg-[#f8fafc] border-y border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0a2540] mb-4 tracking-tight">
              Why Traditional Front-Desks Lose Revenue
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto font-medium">
              Human staff get overwhelmed during busy hours. Our AI Receptionist provides instant support.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* The Clinic Bottleneck */}
            <div className="bg-white border border-red-100 p-8 rounded-2xl shadow-sm relative group overflow-hidden">
              <h3 className="text-lg font-bold mb-6 text-red-500 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                  <XCircle className="w-4 h-4 text-red-500" />
                </div>
                THE CLINIC BOTTLENECK
              </h3>
              <ul className="space-y-4 text-sm text-gray-600 font-medium">
                <li className="flex gap-3">
                  <span className="w-2 h-2 rounded-full bg-red-400 mt-2 shrink-0" />
                  Missed calls when your staff is busy or away.
                </li>
                <li className="flex gap-3">
                  <span className="w-2 h-2 rounded-full bg-red-400 mt-2 shrink-0" />
                  No-shows because manual confirmations are forgotten.
                </li>
                <li className="flex gap-3">
                  <span className="w-2 h-2 rounded-full bg-red-400 mt-2 shrink-0" />
                  Empty slots are wasted because they are released too late.
                </li>
                <li className="flex gap-3">
                  <span className="w-2 h-2 rounded-full bg-red-400 mt-2 shrink-0" />
                  Zero patient support after 6:00 PM and on Sundays.
                </li>
              </ul>
            </div>

            {/* The AI Assistant Solution */}
            <div className="bg-white border border-[#10b981]/30 p-8 rounded-2xl shadow-sm relative group overflow-hidden">
              <h3 className="text-lg font-bold mb-6 text-[#10b981] flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#10b981]/10 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-[#10b981]" />
                </div>
                THE AI RECEPTIONIST
              </h3>
              <ul className="space-y-4 text-sm text-gray-600 font-medium">
                <li className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#10b981] shrink-0 mt-0.5" />
                  Instant answers, booking, and rescheduling on WhatsApp 24/7.
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#10b981] shrink-0 mt-0.5" />
                  Automated notifications and WhatsApp confirmation reminders.
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#10b981] shrink-0 mt-0.5" />
                  Strict 6-hour release rule automatically recycles canceled slots.
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#10b981] shrink-0 mt-0.5" />
                  Real-time synchronization with Google Calendar & Airtable.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive ROI Calculator Section */}
      <section id="roi-calculator" className="py-20 px-6 scroll-mt-24">
        <div className="max-w-4xl mx-auto bg-white border border-gray-200/80 rounded-3xl p-8 sm:p-12 shadow-xl">
          <div className="text-center mb-10">
            <span className="text-xs font-black tracking-widest text-[#10b981] uppercase block mb-3">ROI Calculator</span>
            <h2 className="text-3xl font-extrabold text-[#0a2540]">See How Much Revenue You Can Reclaim</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Controls */}
            <div className="space-y-8 font-medium">
              <div>
                <div className="flex justify-between text-sm text-[#0a2540] font-bold mb-3">
                  <span>Weekly Missed Calls / Leads:</span>
                  <span className="text-[#10b981]">{missedCalls}</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="100" 
                  value={missedCalls} 
                  onChange={(e) => setMissedCalls(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#10b981]"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm text-[#0a2540] font-bold mb-3">
                  <span>Average Patient Value (₹):</span>
                  <span className="text-[#10b981]">₹{avgTicket}</span>
                </div>
                <input 
                  type="range" 
                  min="500" 
                  max="10000" 
                  step="100"
                  value={avgTicket} 
                  onChange={(e) => setAvgTicket(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#10b981]"
                />
              </div>
            </div>

            {/* Calculations Result */}
            <div className="bg-[#f8fafc] border border-gray-100 rounded-2xl p-6 space-y-6 text-center">
              <div>
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block mb-1">Monthly Saved Revenue</span>
                <div className="text-4xl font-black text-[#10b981]">₹{monthlyRecovered.toLocaleString('en-IN')}</div>
              </div>
              <div className="border-t border-gray-200/60 pt-4 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Hours Saved / Month</span>
                  <div className="text-lg font-extrabold text-[#0a2540]">{hoursSaved} Hrs</div>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Weekly Recovered</span>
                  <div className="text-lg font-extrabold text-[#0a2540]">₹{weeklyRecovered.toLocaleString('en-IN')}</div>
                </div>
              </div>
              <Link to="/signup" className="clinical-btn-primary w-full py-3.5 text-xs tracking-wider uppercase">
                Claim My Free Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Multi-Language Indian Accents Section */}
      <section className="py-20 px-6 bg-[#f8fafc] border-y border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-[#0a2540] mb-4">Localized AI for Indian Patient Care</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto font-medium">
              India's clinics speak multiple languages. Our AI receptionist understands 12+ regional languages instantly.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {['Hindi', 'English', 'Marathi', 'Telugu', 'Tamil', 'Bengali', 'Kannada', 'Malayalam', 'Gujarati', 'Punjabi', 'Odia', 'Assamese'].map((lang, idx) => (
              <div key={idx} className="bg-white border border-gray-200/60 px-5 py-4 rounded-xl flex items-center justify-between hover:border-[#10b981] transition-all">
                <span className="text-sm font-bold text-[#0a2540]">{lang}</span>
                <div className="w-2 h-2 bg-[#10b981] rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-[#0a2540] mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-500 text-lg font-medium">Everything you need to know about the receptionist software.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-gray-200/80 rounded-2xl bg-white overflow-hidden transition-all">
              <button 
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left font-bold text-[#0a2540] hover:text-[#10b981] transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${activeFaq === i ? 'rotate-180 text-[#10b981]' : 'text-gray-400'}`} />
              </button>
              {activeFaq === i && (
                <div className="px-6 pb-6 text-sm text-gray-500 font-medium leading-relaxed border-t border-gray-50">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
