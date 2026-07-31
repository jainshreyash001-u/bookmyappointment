import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Password reset states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1 = email input, 2 = code & password input
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    setForgotLoading(true);

    try {
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setForgotSuccess(data.message || 'Verification code sent to your email.');
        setForgotStep(2);
      } else {
        setForgotError(data.error || 'Failed to send verification code.');
      }
    } catch (err) {
      setForgotError('Could not connect to authentication server.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    setForgotLoading(true);

    try {
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';
      const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail,
          otp: otpCode,
          newPassword: newPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        setForgotSuccess('Password reset successfully! You can now log in.');
        setTimeout(() => {
          setShowForgotModal(false);
          setFormData({ ...formData, email: forgotEmail, password: '' });
        }, 2000);
      } else {
        setForgotError(data.error || 'Failed to reset password.');
      }
    } catch (err) {
      setForgotError('Could not connect to authentication server.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userPlan', data.dentist.plan || 'starter');
        localStorage.setItem('dentistId', data.dentist.dentistId);
        navigate('/dashboard');
      } else {
        setErrorMsg(data.error || 'Login failed');
      }
    } catch (err) {
      setErrorMsg('Could not connect to authentication server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-6 overflow-hidden bg-white text-[#0a2540]">
      <div className="mesh-gradient" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-3 group mb-8">
            <div className="w-12 h-12 bg-[#0a2540] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-[#0a2540]">BMA <span className="text-[#10b981]">AI</span></span>
          </Link>
          <h1 className="text-4xl font-black tracking-tight uppercase text-[#0a2540]">WELCOME <span className="text-gradient-clinical">BACK</span></h1>
          <p className="text-gray-500 font-medium mt-2">Login to your clinical account.</p>
        </div>

        <div className="clinical-card p-10 relative overflow-hidden">
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold text-center">
              {errorMsg}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#0a2540]/80 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0a2540]/40" />
                <input 
                  type="email" 
                  required
                  placeholder="name@clinic.com"
                  className="w-full bg-gray-50 border border-gray-200/80 rounded-2xl py-4 pl-12 pr-6 text-sm font-medium focus:bg-white focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981]/20 outline-none transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#0a2540]/80">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(formData.email);
                    setShowForgotModal(true);
                    setForgotStep(1);
                    setForgotError('');
                    setForgotSuccess('');
                    setOtpCode('');
                    setNewPassword('');
                  }}
                  className="text-[10px] font-black uppercase tracking-widest text-[#10b981] hover:text-[#0d9668] transition-colors outline-none"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0a2540]/40" />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border border-gray-200/80 rounded-2xl py-4 pl-12 pr-6 text-sm font-medium focus:bg-white focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981]/20 outline-none transition-all"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="clinical-btn-primary w-full py-4 text-xs tracking-wider uppercase font-black flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? 'LOGGING IN...' : 'LOGIN'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-100 text-center">
            <p className="text-gray-500 text-xs font-bold tracking-tight">
              Don't have an account? <Link to="/signup" className="text-[#10b981] hover:text-[#0d9668] transition-colors">Sign Up</Link>
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-8 opacity-80 text-[#0a2540]/80">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4 text-[#10b981]" /> Secure Encryption
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
            <Bot className="w-4 h-4 text-[#10b981]" /> AI Identity Verified
          </div>
        </div>
      </motion.div>

      {/* Forgot Password Recovery Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 relative overflow-hidden"
          >
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-lg"
            >
              ✕
            </button>

            <h2 className="text-2xl font-black tracking-tight text-[#0a2540] uppercase mb-2">
              Reset <span className="text-[#10b981]">Password</span>
            </h2>
            <p className="text-gray-500 text-xs font-semibold mb-6">
              {forgotStep === 1
                ? "Enter your email to receive a secure 6-digit verification code."
                : "Enter the code sent to your email and set your new password."}
            </p>

            {forgotError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold text-center">
                {forgotError}
              </div>
            )}

            {forgotSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-100 text-[#10b981] rounded-xl text-xs font-bold text-center">
                {forgotSuccess}
              </div>
            )}

            {forgotStep === 1 ? (
              <form onSubmit={handleRequestOTP} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#0a2540]/80">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="name@clinic.com"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-5 text-sm font-medium focus:bg-white focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981]/20 outline-none transition-all"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="clinical-btn-primary w-full py-4 text-xs tracking-wider uppercase font-black flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {forgotLoading ? 'Sending Code...' : 'Send Reset Code'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#0a2540]/80">6-Digit Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-5 text-sm font-medium focus:bg-white focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981]/20 outline-none transition-all text-center tracking-widest font-bold"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#0a2540]/80">New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-5 text-sm font-medium focus:bg-white focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981]/20 outline-none transition-all"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="clinical-btn-primary w-full py-4 text-xs tracking-wider uppercase font-black flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {forgotLoading ? 'Updating Password...' : 'Reset Password'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
