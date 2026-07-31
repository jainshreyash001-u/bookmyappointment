import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, Calendar, Sparkles } from 'lucide-react';

const ChatWidget = ({ dentistId = 'DT_DEMO' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef(null);

  // Initialize session and welcome message
  useEffect(() => {
    let sid = sessionStorage.getItem('chat_session_id');
    if (!sid) {
      sid = `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('chat_session_id', sid);
    }
    setSessionId(sid);

    // Initial greeting
    setMessages([
      {
        role: 'assistant',
        content: '👋 Hello! I am your AI Dental Assistant. How can I help you today? You can ask about treatments, check pricing, or request to book an appointment.',
        timestamp: new Date()
      }
    ]);
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    const userMessage = message;
    setMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date() }]);
    setLoading(true);

    try {
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';
      const response = await fetch(`${API_BASE}/api/chat/${dentistId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
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
        content: '⚠️ Sorry, I ran into an error connecting to our system. Please try again in a moment.',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Expand/Collapse Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-[#0a2540] text-white rounded-2xl flex items-center justify-center shadow-2xl hover:bg-[#10b981] transition-colors duration-300 relative focus:outline-none"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center"
            >
              <MessageSquare className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#10b981]"></span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="absolute bottom-20 right-0 w-[360px] sm:w-[400px] h-[520px] bg-white rounded-3xl border border-gray-100 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#0a2540] p-4 text-white flex items-center justify-between border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
                  <Bot className="w-5 h-5 text-[#10b981]" />
                </div>
                <div>
                  <h4 className="text-sm font-black tracking-wide uppercase flex items-center gap-1.5">
                    Dental Assistant
                    <Sparkles className="w-3.5 h-3.5 text-[#10b981]" />
                  </h4>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Autonomous 24/7 Coordinator</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8fafc]">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3.5 rounded-2xl text-xs font-semibold leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#0a2540] text-white rounded-tr-none'
                        : 'bg-white border border-gray-200/80 text-gray-700 rounded-tl-none shadow-sm'
                    }`}
                  >
                    {msg.content}
                    {msg.appointmentData && (
                      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2.5 text-[#10b981]">
                        <Calendar className="w-4 h-4" />
                        <span className="font-extrabold uppercase text-[10px] tracking-wider">
                          Ready to Schedule
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200/80 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-[#0a2540]/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#0a2540]/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#0a2540]/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-3 border-t border-gray-100 bg-white flex gap-2 items-center">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask dental questions or book..."
                className="flex-1 bg-[#f1f5f9] border-0 rounded-xl px-4 py-3 text-xs font-semibold text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#0a2540]/20 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!message.trim() || loading}
                className="w-10 h-10 bg-[#0a2540] hover:bg-[#10b981] disabled:bg-gray-200 text-white rounded-xl flex items-center justify-center transition-colors shadow-md focus:outline-none shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatWidget;
