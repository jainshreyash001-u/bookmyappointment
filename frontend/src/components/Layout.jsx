import React from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { Bot, MessageSquare, ShieldCheck, Mail, MapPin, Phone, Globe } from 'lucide-react';

const Layout = () => {
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/features' },
    { name: 'Pricing', path: '/pricing' }
  ];

  return (
    <div className="min-h-screen relative text-white selection:bg-blue-500/30">
      {/* Visual Background Layers */}
      <div className="mesh-gradient" />
      
      {/* Sticky Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between glass-dark px-8 py-4 rounded-[2rem] border border-white/5 shadow-2xl">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(37,99,235,0.3)]">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter">BMA <span className="text-blue-500">AI</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link 
                key={link.path}
                to={link.path}
                className={`text-sm font-bold tracking-widest uppercase transition-all hover:text-blue-400 ${location.pathname === link.path ? 'text-blue-400' : 'text-gray-400'}`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <Link to="/signup" className="cyber-button px-8 py-3 text-xs tracking-widest uppercase">
            GET STARTED
          </Link>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="relative z-10 min-h-[calc(100vh-400px)]">
        <Outlet />
      </main>

      {/* Professional Footer */}
      <footer className="relative z-10 pt-20 pb-12 px-6 border-t border-white/5 bg-gradient-to-b from-transparent to-[#020617]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="space-y-8">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-black tracking-tighter uppercase">BookMyAppointment</span>
            </Link>
            <p className="text-gray-400 font-medium leading-relaxed">
              The world's most advanced autonomous patient coordinator for modern dental practices.
            </p>
            <div className="flex gap-4">
              {[Globe, MessageSquare, Bot].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:bg-blue-500 transition-colors">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <h4 className="text-sm font-black uppercase tracking-[0.3em] text-blue-500">PLATFORM</h4>
            <ul className="space-y-4">
              {navLinks.map(link => (
                <li key={link.path}>
                  <Link to={link.path} className="text-gray-400 hover:text-white transition-colors font-medium">{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-8">
            <h4 className="text-sm font-black uppercase tracking-[0.3em] text-blue-500">SECURITY</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-gray-400 font-medium">
                <ShieldCheck className="w-4 h-4 text-green-500" /> Bank-Grade Security
              </li>
              <li className="flex items-center gap-3 text-gray-400 font-medium">
                <ShieldCheck className="w-4 h-4 text-green-500" /> Encrypted Transmissions
              </li>
            </ul>
          </div>

          <div className="space-y-8">
            <h4 className="text-sm font-black uppercase tracking-[0.3em] text-blue-500">CONTACT</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-4 text-gray-400 font-medium hover:text-white transition-colors">
                <Mail className="w-4 h-4" /> jainshreyash001@gmail.com
              </li>
              <li className="flex items-center gap-4 text-gray-400 font-medium">
                <Phone className="w-4 h-4" /> +91 7000016180
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-500 text-xs font-bold tracking-widest uppercase">
            © 2026 BOOKMYAPPOINTMENT. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-10">
            <a href="#" className="text-xs text-gray-500 font-bold uppercase tracking-widest hover:text-white">Privacy Policy</a>
            <a href="#" className="text-xs text-gray-500 font-bold uppercase tracking-widest hover:text-white">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
