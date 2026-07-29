import React from 'react';
import { motion } from 'framer-motion';
import { Check, ShieldCheck, Globe, Activity } from 'lucide-react';
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
    <div className="pt-28 pb-20 px-6 overflow-hidden bg-white text-[#0a2540] relative min-h-screen">
      <div className="mesh-gradient" />
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-[#10b981]/20 bg-[#10b981]/5 text-[#10b981] text-[10px] font-black tracking-widest uppercase mb-6"
          >
            <div className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse" />
            Flexible Deployment Models
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl lg:text-5xl font-black mb-6 tracking-tighter uppercase text-[#0a2540]"
          >
            INVEST IN <span className="text-gradient-clinical">EFFICIENCY</span>
          </motion.h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed">
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
              className={`clinical-card p-12 relative group ${plan.popular ? 'border-[#10b981]/30 bg-[#10b981]/[0.02]' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 bg-[#10b981] text-white text-[10px] font-black tracking-[0.2em] uppercase rounded-full shadow-lg z-20">
                  MOST POPULAR
                </div>
              )}

              <div className="mb-10">
                <h3 className="text-2xl font-black mb-4 tracking-tight uppercase text-[#0a2540]">{plan.name}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-[#0a2540]">₹{plan.price}</span>
                  <span className="text-gray-400 font-bold uppercase tracking-widest text-xs">/ Month</span>
                </div>
                <p className="text-gray-500 mt-6 font-medium leading-relaxed">{plan.desc}</p>
              </div>

              <div className="space-y-6 mb-12">
                {plan.features.map((f, j) => (
                  <div key={j} className="flex items-center gap-4 text-sm font-bold text-[#0a2540]/80">
                    <div className="w-5 h-5 rounded-full bg-[#10b981]/10 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-[#10b981]" />
                    </div>
                    {f}
                  </div>
                ))}
              </div>

              <Link 
                to="/signup" 
                className={`w-full py-4 text-xs tracking-wider uppercase font-bold text-center block ${plan.popular ? 'clinical-btn-accent' : 'clinical-btn-secondary'}`}
              >
                DEPLOY NOW
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Security Trust Section */}
        <div className="mt-20 pt-12 border-t border-gray-100 grid md:grid-cols-3 gap-12 text-center opacity-80">
          {[
            { icon: ShieldCheck, title: 'BANK-GRADE SECURITY', desc: 'Secure medical data handling.' },
            { icon: Globe, title: 'MULTI-LANGUAGE', desc: 'Auto-detection in Indian regional languages.' },
            { icon: Activity, title: '99.9% UPTIME', desc: 'Always active patient coordination.' }
          ].map((item, i) => (
            <div key={i} className="space-y-3">
              <item.icon className="w-8 h-8 text-[#10b981] mx-auto" />
              <h4 className="text-xs font-black tracking-widest uppercase text-[#0a2540]">{item.title}</h4>
              <p className="text-xs text-gray-500 font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
