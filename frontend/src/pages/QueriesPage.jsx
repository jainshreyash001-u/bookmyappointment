import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Bot, User, Filter, AlertCircle, Clock, Check } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const QueriesPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('active');

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userPlan');
    localStorage.removeItem('dentistId');
    navigate('/login');
  };

  const queries = [
    { id: 1, type: 'active', patient: 'Rahul Sharma', query: 'Do you have painless root canal?', status: 'AI Responding', time: '2m ago' },
    { id: 2, type: 'escalated', patient: 'Anjali Gupta', query: 'I have severe bleeding after extraction.', status: 'Dentist Required', time: '15m ago' },
    { id: 3, type: 'support', dentist: 'Dr. Sameer', query: 'How do I upload my clinic schedule for Sunday?', status: 'In Review', time: '1h ago' },
    { id: 4, type: 'active', patient: 'Vikram Singh', query: 'What is the cost of Zirconia Crown?', status: 'AI Responding', time: '5m ago' }
  ];

  const filteredQueries = queries.filter(q => {
    if (activeTab === 'active') return q.type === 'active';
    if (activeTab === 'escalated') return q.type === 'escalated';
    return q.type === 'support';
  });

  const getStatColorClasses = (color) => {
    switch (color) {
      case 'blue':
        return { bg: 'bg-blue-50 border-blue-100', icon: 'text-blue-500' };
      case 'red':
        return { bg: 'bg-rose-50 border-rose-100', icon: 'text-rose-500' };
      case 'purple':
      default:
        return { bg: 'bg-purple-50 border-purple-100', icon: 'text-purple-500' };
    }
  };

  return (
    <div className="flex min-h-screen bg-white pt-28 text-[#0a2540]">
      {/* Sidebar */}
      <Sidebar handleLogout={handleLogout} />

      {/* Main Content */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto bg-gray-50/30">
        <header className="flex flex-col sm:flex-row justify-between sm:items-end gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase mb-2 text-[#0a2540]">
              Query <span className="text-gradient-clinical">Control Center</span>
            </h1>
            <p className="text-gray-500 font-medium">Monitor live AI patient interactions and handle clinical escalations.</p>
          </div>
        </header>

        {/* Stats Quick View */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Active Streams', count: '2 Live', icon: Bot, color: 'blue' },
            { label: 'Clinical Escalations', count: '1 Urgent', icon: AlertCircle, color: 'red' },
            { label: 'System Support', count: '1 Ready', icon: User, color: 'purple' }
          ].map((s, i) => {
            const colors = getStatColorClasses(s.color);
            return (
              <div 
                key={i} 
                className="clinical-card p-6 flex items-center justify-between bg-white shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100/80" 
                onClick={() => setActiveTab(s.label.split(' ')[0].toLowerCase() === 'active' ? 'active' : s.label.split(' ')[0].toLowerCase() === 'clinical' ? 'escalated' : 'support')}
              >
                <div>
                  <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">{s.label}</div>
                  <div className="text-3xl font-black text-[#0a2540]">{s.count}</div>
                </div>
                <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center border transition-transform`}>
                  <s.icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="clinical-card min-h-[500px] flex flex-col overflow-hidden bg-white shadow-sm border border-gray-100/80">
          {/* Tab Header */}
          <div className="flex border-b border-gray-100">
            {['active', 'escalated', 'support'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-10 py-6 text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === tab 
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30' 
                    : 'text-gray-500 hover:text-[#0a2540]'
                }`}
              >
                {tab === 'active' ? 'Live AI Stream' : tab === 'escalated' ? 'Clinical Escalations' : 'Dentist Support'}
              </button>
            ))}
          </div>

          {/* Query List */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {filteredQueries.length > 0 ? (
              filteredQueries.map((q) => (
                <motion.div 
                  key={q.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white p-8 rounded-3xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all group"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-50 text-[#0a2540] rounded-full flex items-center justify-center text-xs font-black border border-gray-100">
                        {(q.patient || q.dentist).split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-bold text-[#0a2540] uppercase tracking-tight">{q.patient || q.dentist}</div>
                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3" /> {q.time}
                        </div>
                      </div>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      q.type === 'escalated' ? 'border-rose-200 text-rose-600 bg-rose-50' : 
                      q.type === 'active' ? 'border-blue-200 text-blue-600 bg-blue-50' : 'border-purple-200 text-purple-600 bg-purple-50'
                    }`}>
                      {q.status}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100/80 mb-6 text-gray-600 font-medium italic">
                    "{q.query}"
                  </div>

                  <div className="flex gap-4">
                    <button className="flex-1 py-3 bg-[#0a2540] hover:bg-[#11385f] text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                      {q.type === 'active' ? 'VIEW CONVERSATION' : 'TAKE OVER CHAT'}
                    </button>
                    <button className="px-6 py-3 border border-gray-200 hover:bg-gray-50 rounded-xl text-[10px] text-[#0a2540] font-black uppercase tracking-widest transition-all">
                      RESOLVE
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 pt-20">
                <MessageSquare className="w-12 h-12 opacity-20 animate-pulse" />
                <div className="text-xs font-black uppercase tracking-widest opacity-60">No queries in this queue</div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default QueriesPage;
