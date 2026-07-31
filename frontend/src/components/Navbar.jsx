import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bot, Menu, X } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/features' },
    { name: 'Pricing', path: '/pricing' }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-4 bg-white/70 backdrop-blur-md border-b border-gray-100 font-sans">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-[#0a2540] rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-md">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight text-[#0a2540]">
            BMA <span className="text-[#10b981]">AI</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link 
              key={link.path}
              to={link.path}
              className={`text-xs font-black tracking-wider uppercase transition-all hover:text-[#10b981] ${
                location.pathname === link.path ? 'text-[#10b981]' : 'text-gray-500'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Action Button & Hamburger */}
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-[#0a2540] hover:text-[#10b981] text-xs font-black tracking-wider uppercase transition-colors hidden sm:inline-block mr-2">
            LOGIN
          </Link>
          <Link to="/signup" className="clinical-btn-accent hidden sm:inline-block px-6 py-2.5 text-xs tracking-wider uppercase font-bold">
            GET STARTED
          </Link>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 border border-gray-200 rounded-xl flex items-center justify-center text-[#0a2540] hover:bg-gray-50 focus:outline-none transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 px-6 py-4 flex flex-col gap-4 shadow-xl z-50">
          {navLinks.map((link) => (
            <Link 
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`text-sm font-bold uppercase py-2 border-b border-gray-50 hover:text-[#10b981] ${
                location.pathname === link.path ? 'text-[#10b981]' : 'text-gray-500'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <Link 
            to="/login" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-center w-full py-3 text-xs tracking-wider uppercase font-bold mt-2 text-[#0a2540] hover:text-[#10b981] transition-colors border border-gray-100 rounded-2xl"
          >
            LOGIN
          </Link>
          <Link 
            to="/signup" 
            onClick={() => setMobileMenuOpen(false)}
            className="clinical-btn-accent text-center w-full py-3 text-xs tracking-wider uppercase font-bold"
          >
            GET STARTED
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
