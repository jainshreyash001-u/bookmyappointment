import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { Bot, MessageSquare, ShieldCheck, Mail, Phone, Globe } from 'lucide-react';
import ChatWidget from './ChatWidget';
import Navbar from './Navbar';

const Layout = () => {
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/features' },
    { name: 'Pricing', path: '/pricing' }
  ];

  const activeClinicId = localStorage.getItem('activeClinicId') || localStorage.getItem('dentistId') || 'DT_DEMO';

  return (
    <div className="min-h-screen relative text-[#0a2540] selection:bg-[#10b981]/20">
      {/* Light Clinical Mesh Background */}
      <div className="mesh-gradient" />
      
      
      {/* Sticky Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="relative z-10 min-h-[calc(100vh-350px)] pt-20">
        <Outlet />
        <ChatWidget dentistId={activeClinicId} />
      </main>

      {/* Professional B2B Footer */}
      <footer className="relative z-10 pt-20 pb-12 px-6 border-t border-gray-100 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#0a2540] rounded-xl flex items-center justify-center shadow-sm">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-[#0a2540] uppercase">BookMyAppointment</span>
            </Link>
            <p className="text-gray-500 text-sm font-medium leading-relaxed">
              The world's most advanced autonomous patient coordinator built specifically for dental practices and clinic owners.
            </p>
            <div className="flex gap-4">
              {[Globe, MessageSquare, Bot].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-[#0a2540] hover:bg-[#10b981] hover:text-white hover:border-transparent transition-all">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#0a2540]">PLATFORM</h4>
            <ul className="space-y-3 text-sm">
              {navLinks.map(link => (
                <li key={link.path}>
                  <Link to={link.path} className="text-gray-500 hover:text-[#10b981] transition-colors font-medium">{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#0a2540]">SECURITY & COMPLIANCE</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2.5 text-gray-500 font-medium">
                <ShieldCheck className="w-4 h-4 text-[#10b981]" /> HIPAA Compliant Protocols
              </li>
              <li className="flex items-center gap-2.5 text-gray-500 font-medium">
                <ShieldCheck className="w-4 h-4 text-[#10b981]" /> Encrypted Database Storage
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#0a2540]">CONTACT</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3 text-gray-500 font-medium hover:text-[#10b981] transition-colors">
                <Mail className="w-4 h-4" /> jainshreyash001@gmail.com
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-gray-200/60 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-400 text-xs font-bold tracking-wider uppercase">
            © 2026 BOOKMYAPPOINTMENT. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-8">
            <a href="#" className="text-xs text-gray-400 font-bold uppercase tracking-wider hover:text-[#10b981]">Privacy Policy</a>
            <a href="#" className="text-xs text-gray-400 font-bold uppercase tracking-wider hover:text-[#10b981]">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
