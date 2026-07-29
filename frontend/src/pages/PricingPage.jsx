import React from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Bot, ShieldCheck, MessageSquare, Phone, Globe, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const PricingPage = () => {
  const plans = [
    {
      name: 'Starter Pack',
      price: '499',
      desc: 'Perfect for solo practitioners starting their AI journey.',
      color: 'blue',
      features: [
        'WhatsApp AI Assistant',
        'Google Calendar Integration',
        '100+ Conversations / Month',
        '24/7 Priority Email Support',
        'Dentist Takeover Mode'
      ]
    },
    {
      name: 'Professional Pack',
      price: '999',
      desc: 'The complete clinical coordination suite for growing clinics.',
      color: 'indigo',
      popular: true,
      features: [
        'WhatsApp Voice & Text AI',
        'Fail-Safe Call Follow-ups',
        'Unlimited Conversations',
        'Website Booking Widget',
        '24/7 Priority Email Support',
        'Strategic ROI Dashboard',
        'Multi-language Support (50+)'
      ]
    }
  ];

  return (
    <div className="pt-40 pb-32 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-32">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass border-blue-500/20 text-blue-400 text-[10px] font-black tracking-[0.2em] uppercase mb-10"
          >
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(37,99,235,1)]" />
            Flexible Deployment Models
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl lg:text-7xl font-black mb-8 tracking-tighter uppercase"
          >
            INVEST IN <span className="text-gradient">EFFICIENCY</span>
          </motion.h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">
            Choose the intelligence level that matches your clinic's scale. No hidden fees. Zero setup costs.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`cyber-card p-12 relative group ${plan.popular ? 'border-blue-500/30 bg-blue-600/[0.03]' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 bg-blue-500 text-white text-[10px] font-black tracking-[0.2em] uppercase rounded-full shadow-2xl z-20">
                  MOST POPULAR
                </div>
              )}

              <div className="mb-10">
                <h3 className="text-2xl font-black mb-4 tracking-tight uppercase">{plan.name}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black">₹{plan.price}</span>
                  <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">/ Month</span>
                </div>
                <p className="text-gray-400 mt-6 font-medium leading-relaxed">{plan.desc}</p>
              </div>

              <div className="space-y-6 mb-12">
                {plan.features.map((f, j) => (
                  <div key={j} className="flex items-center gap-4 text-sm font-bold text-gray-300">
                    <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-blue-500" />
                    </div>
                    {f}
                  </div>
                ))}
              </div>

              <Link 
                to="/signup" 
                className={`w-full cyber-button py-5 text-sm tracking-widest uppercase ${plan.popular ? 'bg-blue-600' : 'glass bg-white/5'}`}
              >
                DEPLOY NOW
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Security Trust Section */}
        <div className="mt-32 pt-20 border-t border-white/5 grid md:grid-cols-3 gap-12 text-center opacity-60">
          {[
            { icon: ShieldCheck, title: 'BANK-GRADE SECURITY', desc: 'Secure medical data handling.' },
            { icon: Globe, title: 'MULTI-LANGUAGE', desc: 'Auto-detection in Indian regional languages.' },
            { icon: Activity, title: '99.9% UPTIME', desc: 'Always active patient coordination.' }
          ].map((item, i) => (
            <div key={i} className="space-y-4">
              <item.icon className="w-8 h-8 text-blue-500 mx-auto" />
              <h4 className="text-xs font-black tracking-widest uppercase">{item.title}</h4>
              <p className="text-xs text-gray-500 font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
