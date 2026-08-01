import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles, User, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const ChatPage = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userPlan');
    localStorage.removeItem('dentistId');
    navigate('/login');
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }

    let sid = sessionStorage.getItem('chat_session_id');
    if (!sid) {
      sid = `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('chat_session_id', sid);
    }
    setSessionId(sid);

    // Initial greeting for the Dentist
    setMessages([
      {
        role: 'assistant',
        content: "👩‍⚕️ Welcome Doctor! I am Ressa, your clinic's AI assistant. I'm here to help you manage schedules and patients.\n\nYou can ask me about your upcoming appointments, check guidelines, or instruct me on schedules, e.g.:\n• 'I am on leave tomorrow'\n• 'I will be away next Monday from 10 AM to 2 PM'\n\nIf you tell me you're taking leave, I will sweep your calendar, mark affected appointments as rescheduling, calculate the next available slots, and message patients via WhatsApp automatically.",
        timestamp: new Date()
      }
    ]);
  }, [navigate]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    const userMessage = message;
    const dentistId = localStorage.getItem('activeClinicId') || localStorage.getItem('dentistId') || 'DT_DEMO';
    const token = localStorage.getItem('authToken');
    
    setMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date() }]);
    setLoading(true);

    try {
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';
      const url = `${API_BASE}/api/chat/${dentistId}/admin`;

      const headers = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        headers['x-clinic-id'] = dentistId;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: userMessage,
          sessionId: sessionId
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
          intent: data.intent,
          appointmentData: data.appointmentData
        }]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (err) {
      console.error('[Chat Error]', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ Sorry Dr., I ran into an error: ${err.message}. Please try again in a moment.`,
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white pt-28 text-[#0a2540]">
      <Sidebar handleLogout={handleLogout} />

      <main className="flex-1 p-8 lg:p-12 overflow-y-auto bg-gray-50/30 flex flex-col h-[calc(100vh-112px)]">
        <header className="mb-6 shrink-0 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase mb-2 text-[#0a2540]">
              AI Assistant <span className="text-gradient-clinical">Playground</span>
            </h1>
            <p className="text-gray-500 font-medium">Converse with Ressa, your clinic's scheduling coordinator.</p>
          </div>
        </header>

        <div className="clinical-card flex-1 flex flex-col overflow-hidden bg-white shadow-sm border border-gray-100/80 min-h-0">
          {/* Chat Window Header */}
          <div className="bg-[#0a2540] p-6 text-white flex items-center justify-between border-b border-gray-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <ShieldAlert className="w-6 h-6 text-[#10b981]" />
              </div>
              <div>
                <h4 className="text-sm font-black tracking-wide uppercase flex items-center gap-1.5">
                  Ressa (Clinic Assistant)
                  <Sparkles className="w-3.5 h-3.5 text-[#10b981]" />
                </h4>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  Dentist Dashboard Chatbot Workspace
                </span>
              </div>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#f8fafc]">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-4 rounded-2xl text-sm font-semibold leading-relaxed whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-[#0a2540] text-white rounded-tr-none'
                      : 'bg-white border border-gray-200/80 text-gray-700 rounded-tl-none shadow-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200/80 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1 items-center">
                  <span className="w-2 h-2 bg-[#0a2540]/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-[#0a2540]/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-[#0a2540]/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <form onSubmit={handleSend} className="p-4 border-t border-gray-100 bg-white flex gap-4 items-center shrink-0">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type instructions (e.g. 'I am on leave tomorrow') or ask questions..."
              className="flex-1 bg-[#f1f5f9] border-0 rounded-2xl px-5 py-4 text-sm font-semibold text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#0a2540]/20 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!message.trim() || loading}
              className="px-6 py-4 bg-[#0a2540] hover:bg-[#10b981] disabled:bg-gray-200 text-white rounded-2xl flex items-center justify-center gap-2 transition-all font-black text-xs uppercase tracking-widest shadow-md shrink-0"
            >
              Send <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;
