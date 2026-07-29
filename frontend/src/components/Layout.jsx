import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { Bot, MessageSquare, ShieldCheck, Mail, Phone, Globe } from 'lucide-react';

const Layout = () => {
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/features' },
    { name: 'Pricing', path: '/pricing' }
  ];

  return (
    <div className="min-h-screen relative text-[#0a2540] selection:bg-[#10b981]/20">
      {/* Light Clinical Mesh Background */}
      <div className="mesh-gradient" />
      
      {/* Sticky Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-4 bg-white/70 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-[#0a2540] rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-md">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-[#0a2540]">
              BMA <span className="text-[#10b981]">AI</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link 
                key={link.path}
                to={link.path}
                className={`text-sm font-bold tracking-wider uppercase transition-all hover:text-[#10b981] ${
                  location.pathname === link.path ? 'text-[#10b981]' : 'text-gray-500'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <Link to="/signup" className="clinical-btn-accent px-6 py-2.5 text-xs tracking-wider uppercase">
            GET STARTED
          </Link>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="relative z-10 min-h-[calc(100vh-350px)] pt-20">
        <Outlet />
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
              <li className="flex items-center gap-3 text-gray-500 font-medium">
                <Phone className="w-4 h-4" /> +91 7000016180
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
