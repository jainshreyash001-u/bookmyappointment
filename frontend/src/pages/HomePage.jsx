import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Star, CheckCircle2, Zap, XCircle, TrendingUp, ShieldCheck, Users, Activity, Globe, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-32 pb-40 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-32 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="z-10 max-w-2xl"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass border-blue-500/20 text-blue-400 text-[10px] font-black tracking-[0.2em] uppercase mb-10"
            >
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(37,99,235,1)]" />
              Autonomous Clinical Intelligence
            </motion.div>
            
            <h1 className="text-7xl lg:text-[5.5rem] font-black leading-[0.85] mb-10 tracking-tightest">
              PRECISION <br />
              <span className="text-gradient">COORDINATION.</span>
            </h1>
            
            <p className="text-xl text-gray-400 mb-14 max-w-lg leading-relaxed font-medium">
              Transform your practice with the world's most advanced <span className="text-white">AI Dental Assistant</span>. 
              Automate bookings, eliminate no-shows, and deliver a premium patient experience.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6">
              <Link to="/signup" className="cyber-button group flex items-center justify-center gap-4 text-sm tracking-widest uppercase">
                GET STARTED
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/features" className="px-10 py-4 glass rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-white/10 transition-all border border-white/5 hover:border-blue-500/30 text-sm tracking-widest uppercase">
                EXPLORE FEATURES
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative flex items-center justify-center w-full max-w-[450px] lg:max-w-full"
          >
            <div className="absolute inset-0 bg-blue-600/5 blur-[120px] rounded-full" />
            <div className="relative z-10 p-2 glass rounded-[3.5rem] border border-white/5 shadow-2xl overflow-hidden w-full aspect-square lg:aspect-auto">
              <img 
                src="/assets/dental_ai_hero.png" 
                alt="AI Dental Coordinator" 
                className="w-full h-auto rounded-[3rem] shadow-2xl animate-float-slow object-cover"
              />
              <div className="scanline rounded-[3rem]" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Experience Comparison Section */}
      <section className="py-40 relative px-6 bg-gradient-to-b from-[#020617] to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-32">
            <h2 className="text-5xl lg:text-6xl font-black mb-8 tracking-tighter uppercase">THE <span className="text-gradient">EVOLUTION</span> OF CARE</h2>
            <p className="text-gray-400 text-xl font-medium max-w-2xl mx-auto">Stop wasting time on legacy booking methods. Move to autonomous practice management.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-12 rounded-[3.5rem] border border-white/5 bg-white/[0.01] relative group overflow-hidden"
            >
              <h3 className="text-2xl font-bold mb-10 text-gray-500 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full border border-red-500/30 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-500/50" />
                </div>
                LEGACY COORDINATION
              </h3>
              <ul className="space-y-8">
                {[
                  'Manual WhatsApp & Phone juggling',
                  'Hours wasted on confirmation calls',
                  'High no-show rates (unconfirmed slots)',
                  'Limited 10 AM - 6 PM availability'
                ].map((text, i) => (
                  <li key={i} className="flex gap-4 text-gray-500 font-medium">
                    <span className="w-6 h-6 rounded-full bg-red-500/5 flex items-center justify-center shrink-0 mt-1">
                      <div className="w-1.5 h-1.5 bg-red-500/30 rounded-full" />
                    </span>
                    {text}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-12 rounded-[3.5rem] border border-blue-500/30 bg-blue-600/[0.03] relative shadow-[0_0_50px_rgba(37,99,235,0.05)] overflow-hidden"
            >
              <h3 className="text-2xl font-bold mb-10 text-blue-400 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full border border-blue-500 flex items-center justify-center bg-blue-500/10">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                AUTONOMOUS SYSTEM
              </h3>
              <ul className="space-y-8">
                {[
                  'Unified WhatsApp Voice & Text AI',
                  '6-Hour Automated Cancellation Rule',
                  'Instant WhatsApp Slot Release',
                  'Dynamic Multi-language Engagement'
                ].map((text, i) => (
                  <li key={i} className="flex gap-4 text-gray-200 font-bold">
                    <CheckCircle2 className="w-6 h-6 text-blue-500 shrink-0 mt-1" />
                    {text}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-40 relative px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center mb-24">
          <h2 className="text-5xl lg:text-6xl font-black mb-8 tracking-tighter uppercase">THE ROAD TO <span className="text-gradient">AUTONOMY</span></h2>
          <p className="text-gray-400 text-xl font-medium max-w-2xl mx-auto">4 steps to transform your clinic into a high-performance clinical engine.</p>
        </div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { step: '01', title: 'Initialize', desc: 'Connect your Google Calendar and Airtable with one click.', color: 'blue' },
            { step: '02', title: 'Train', desc: 'Upload your clinic protocols. The AI learns your specific workflow.', color: 'cyan' },
            { step: '03', title: 'Deploy', desc: 'Your AI Coordinator goes live on WhatsApp and your website.', color: 'indigo' },
            { step: '04', title: 'Scale', desc: 'Watch your no-shows drop as the AI handles 100% of coordination.', color: 'purple' }
          ].map((s, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="cyber-card p-10 group relative"
            >
              <div className="text-6xl font-black text-white/5 absolute top-6 right-6 group-hover:text-blue-500/10 transition-colors">{s.step}</div>
              <div className={`w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20 mb-8`}>
                <Bot className={`w-6 h-6 text-blue-400`} />
              </div>
              <h3 className="text-2xl font-black mb-4 tracking-tight">{s.title}</h3>
              <p className="text-gray-400 font-medium leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Global Impact Grid */}
      <section className="py-40 relative px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center mb-32">
          <h2 className="text-5xl lg:text-7xl font-black mb-8 tracking-tighter leading-[0.9] uppercase">MEASURING <br /><span className="text-gradient">CLINICAL IMPACT</span></h2>
          <p className="text-xl text-gray-400 font-medium leading-relaxed max-w-2xl mx-auto">We don't just book appointments. We optimize the entire economic engine of your practice.</p>
        </div>
        
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: 'Revenue Recovery / Month', value: '₹1.2L+', icon: TrendingUp },
            { label: 'Patient Retention', value: '94%', icon: Users },
            { label: 'Admin Time Saved', value: '4.5 hrs/day', icon: Activity },
            { 
              label: 'Indian Languages', 
              value: '12+', 
              icon: Globe,
              clickable: true,
              details: ['Hindi', 'English', 'Marathi', 'Telugu', 'Tamil', 'Bengali', 'Kannada', 'Malayalam', 'Gujarati', 'Punjabi', 'Odia', 'Assamese']
            }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`cyber-card p-12 text-center group relative overflow-hidden ${stat.clickable ? 'cursor-pointer' : ''}`}
            >
              {stat.clickable && (
                <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/[0.02] transition-colors flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 p-6 glass backdrop-blur-2xl">
                  <div className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-4">Supported Dialects</div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] font-bold text-gray-300">
                    {stat.details.map((lang, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-blue-500 rounded-full" />
                        {lang}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <stat.icon className="w-10 h-10 text-blue-500 mx-auto mb-8 group-hover:scale-110 transition-transform" />
              <div className="text-5xl font-black mb-4 tracking-tighter text-white">{stat.value}</div>
              <div className="text-gray-500 font-black uppercase tracking-widest text-[10px]">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-15px) scale(1.02); }
        }
        .track-tightest {
          letter-spacing: -0.05em;
        }
      `}</style>
    </div>
  );
};

export default HomePage;
