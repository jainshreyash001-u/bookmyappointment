import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MessageSquare, Calendar, Phone, ShieldCheck, Zap, Bot, UserCog, AlarmClock, Trash2, Globe, Mic, LayoutPanelTop, ChevronRight, Activity, Key } from 'lucide-react';

const FeaturesPage = () => {
  const features = [
    {
      icon: MessageSquare,
      title: 'WhatsApp Intelligence',
      desc: 'Our AI doesn\'t just read; it understands context. Patients get a natural booking experience on the app they already use.',
      image: '/assets/whatsapp_3d_mockup.png',
      color: 'blue',
      points: ['Natural Language Processing', 'Instant Appointment Locking', 'Multilingual Fluency']
    },
    {
      icon: Mic,
      title: 'Voice & Text Omnichannel',
      desc: 'Patients can book via voice notes or text. The AI transcribes voice in real-time and responds with perfect clarity.',
      color: 'cyan',
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
      color: 'red',
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
      color: 'blue',
      points: ['1-Minute Integration', 'Custom Brand Styling', 'Mobile-First Design']
    },
    {
      icon: UserCog,
      title: 'Dentist-Agent Sync',
      desc: 'Total control. Monitor AI conversations in real-time and intervene whenever you need to add a personal touch.',
      color: 'orange',
      points: ['Live Conversation Feed', 'Agent Takeover Mode', 'Strategic Analytics']
    }
  ];

  return (
    <div className="pt-28 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-16 text-center">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center mb-4"
          >
            <div className="px-4 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-400 text-xs font-bold tracking-[0.3em] uppercase">
              Technical Features
            </div>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl lg:text-5xl font-black mb-6 tracking-tighter"
          >
            THE <span className="text-gradient">AUTONOMOUS</span> CORE
          </motion.h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-medium">
            We've built a multi-layered intelligence system designed to handle every complexity of a modern dental practice.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="cyber-card p-10 group"
            >
              {/* Card Header */}
              <div className="flex justify-between items-start mb-10">
                <div className={`w-14 h-14 bg-${f.color}-500/10 rounded-2xl flex items-center justify-center border border-${f.color}-500/20 group-hover:bg-${f.color}-500 group-hover:scale-110 transition-all duration-500`}>
                  <f.icon className={`w-7 h-7 text-${f.color}-400 group-hover:text-white transition-colors`} />
                </div>
                {f.premium && (
                  <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-lg">
                    PRO
                  </div>
                )}
              </div>

              <h3 className="text-2xl font-black mb-4 tracking-tight group-hover:text-blue-400 transition-colors">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-10 font-medium">{f.desc}</p>

              {/* Data Points */}
              <div className="space-y-4 mb-10">
                {f.points.map((point, j) => (
                  <div key={j} className="flex items-center gap-3 text-[11px] font-bold text-gray-300 uppercase tracking-wider">
                    <ChevronRight className="w-4 h-4 text-blue-500" />
                    {point}
                  </div>
                ))}
              </div>

              {/* Footer Visual */}
              <div className="pt-6 border-t border-white/5 flex items-center justify-between opacity-30 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(b => (
                    <div key={b} className="w-1 h-3 bg-blue-500/50 rounded-full" />
                  ))}
                </div>
                <Activity className="w-4 h-4 text-blue-500" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Global Capabilities Summary */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-20 p-10 rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-blue-600/10 to-transparent relative overflow-hidden"
        >
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-xl">
              <h2 className="text-3xl font-black mb-4 tracking-tight">READY FOR DEPLOYMENT?</h2>
              <p className="text-gray-400 font-medium">Experience the next generation of dental practice management today.</p>
            </div>
            <Link to="/signup" className="cyber-button px-12 py-5 whitespace-nowrap">
              INITIALIZE SETUP
            </Link>
          </div>
          <Bot className="absolute -bottom-10 -right-10 w-64 h-64 text-white/5 rotate-12" />
        </motion.div>
      </div>
    </div>
  );
};

export default FeaturesPage;
