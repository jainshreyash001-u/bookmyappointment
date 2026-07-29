import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MessageSquare, Phone, Trash2, LayoutPanelTop, UserCog, ChevronRight, Activity, Mic, Bot } from 'lucide-react';

const FeaturesPage = () => {
  const features = [
    {
      icon: MessageSquare,
      title: 'WhatsApp Intelligence',
      desc: 'Our AI doesn\'t just read; it understands context. Patients get a natural booking experience on the app they already use.',
      color: 'emerald',
      points: ['Natural Language Processing', 'Instant Appointment Locking', 'Multilingual Fluency']
    },
    {
      icon: Mic,
      title: 'Voice & Text Omnichannel',
      desc: 'Patients can book via voice notes or text. The AI transcribes voice in real-time and responds with perfect clarity.',
      color: 'blue',
      points: ['Whisper v3 Transcription', 'Audio Sentiment Analysis', 'Instant Voice Replies']
    },
    {
      icon: Phone,
      title: 'Fail-Safe Follow-ups',
      desc: 'An autonomous escalation system. If WhatsApp fails, the AI calls the patient. No appointment goes unconfirmed.',
      color: 'indigo',
      premium: true,
      points: [
        '24h Before: WhatsApp Confirmation Sent',
        'If No Answer: AI Calls patient twice (1h apart)',
        'Unanswered Calls: Moved to PENDING in database',
        '6h Before: Auto-Cancellation if still unconfirmed'
      ]
    },
    {
      icon: Trash2,
      title: '6-Hour Final Release',
      desc: 'Our system enforces a strict 6-hour confirmation cutoff. If a slot remains unconfirmed, it is automatically released to ensure zero empty chairs.',
      color: 'rose',
      points: [
        'Automatic slot recycling',
        'Manual override for PENDING status',
        'Dentist notification of release',
        'Optimized for walk-in availability'
      ]
    },
    {
      icon: LayoutPanelTop,
      title: 'Website Booking Widget',
      desc: 'Embed our 3D intelligence into your existing site. A seamless bridge between your web presence and your dental chair.',
      color: 'teal',
      points: ['1-Minute Integration', 'Custom Brand Styling', 'Mobile-First Design']
    },
    {
      icon: UserCog,
      title: 'Dentist-Agent Sync',
      desc: 'Total control. Monitor AI conversations in real-time and intervene whenever you need to add a personal touch.',
      color: 'amber',
      points: ['Live Conversation Feed', 'Agent Takeover Mode', 'Strategic Analytics']
    }
  ];

  // Helper map for tailwind classes to prevent compilation pruning
  const colorClasses = {
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-500', hoverBg: 'group-hover:bg-emerald-500' },
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-500', hoverBg: 'group-hover:bg-blue-500' },
    indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', text: 'text-indigo-500', hoverBg: 'group-hover:bg-indigo-500' },
    rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-500', hoverBg: 'group-hover:bg-rose-500' },
    teal: { bg: 'bg-teal-500/10', border: 'border-teal-500/20', text: 'text-teal-500', hoverBg: 'group-hover:bg-teal-500' },
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-500', hoverBg: 'group-hover:bg-amber-500' }
  };

  return (
    <div className="pt-28 pb-20 px-6 relative bg-white min-h-screen text-[#0a2540]">
      <div className="mesh-gradient" />
      
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-16 text-center">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center mb-4"
          >
            <span className="px-4 py-1.5 rounded-full border border-[#10b981]/20 bg-[#10b981]/5 text-[#10b981] text-xs font-black tracking-widest uppercase">
              Technical Features
            </span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl lg:text-5xl font-black mb-6 tracking-tighter text-[#0a2540]"
          >
            THE <span className="text-gradient-clinical">AUTONOMOUS</span> CORE
          </motion.h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto font-medium">
            We've built a multi-layered intelligence system designed to handle every complexity of a modern dental practice.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => {
            const cls = colorClasses[f.color] || colorClasses.blue;
            return (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="clinical-card p-8 group flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-8">
                    <div className={`w-12 h-12 ${cls.bg} rounded-2xl flex items-center justify-center border ${cls.border} ${cls.hoverBg} group-hover:scale-110 transition-all duration-300`}>
                      <f.icon className={`w-6 h-6 ${cls.text} group-hover:text-white transition-colors`} />
                    </div>
                    {f.premium && (
                      <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-wider rounded-lg">
                        PRO
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-extrabold mb-3 tracking-tight text-[#0a2540] group-hover:text-[#10b981] transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-6 font-medium">
                    {f.desc}
                  </p>

                  {/* Data Points */}
                  <div className="space-y-3 mb-8">
                    {f.points.map((point, j) => (
                      <div key={j} className="flex items-start gap-2.5 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                        <ChevronRight className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Visual */}
                <div className="pt-5 border-t border-gray-100 flex items-center justify-between opacity-40 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(b => (
                      <div key={b} className="w-1 h-3 bg-[#10b981]/50 rounded-full" />
                    ))}
                  </div>
                  <Activity className="w-4 h-4 text-[#10b981]" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Global Capabilities Summary */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-20 p-10 rounded-[2.5rem] border border-gray-200/80 bg-[#0a2540] relative overflow-hidden text-white"
        >
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-xl text-center lg:text-left">
              <h2 className="text-3xl font-black mb-3 tracking-tight">READY FOR DEPLOYMENT?</h2>
              <p className="text-gray-300 font-medium">Experience the next generation of dental practice management today.</p>
            </div>
            <Link to="/signup" className="clinical-btn-accent px-10 py-4.5 whitespace-nowrap text-xs tracking-wider uppercase font-black">
              INITIALIZE SETUP
            </Link>
          </div>
          <Bot className="absolute -bottom-10 -right-10 w-64 h-64 text-white/5 rotate-12 pointer-events-none" />
        </motion.div>
      </div>
    </div>
  );
};

export default FeaturesPage;
