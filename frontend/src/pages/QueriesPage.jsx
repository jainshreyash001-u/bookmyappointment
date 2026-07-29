import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Bot, User, Send, Filter, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const QueriesPage = () => {
  const [activeTab, setActiveTab] = useState('active');

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

  return (
    <div className="flex-1 p-8 lg:p-12 overflow-y-auto bg-[#020617] pt-32">
      <header className="mb-12">
        <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Query <span className="text-gradient">Control Center</span></h1>
        <p className="text-gray-400 font-medium">Monitor live AI patient interactions and handle clinical escalations.</p>
      </header>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          { label: 'Active Streams', count: 'Live Fetch', icon: Bot, color: 'blue' },
          { label: 'Clinical Escalations', count: 'Audit', icon: AlertCircle, color: 'red' },
          { label: 'System Support', count: 'Ready', icon: User, color: 'purple' }
        ].map((s, i) => (
          <div key={i} className="cyber-card p-6 flex items-center justify-between group cursor-pointer" onClick={() => setActiveTab(s.label.split(' ')[0].toLowerCase())}>
            <div>
              <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">{s.label}</div>
              <div className="text-3xl font-black">{s.count}</div>
            </div>
            <div className={`w-12 h-12 bg-${s.color}-500/10 rounded-xl flex items-center justify-center border border-${s.color}-500/20 group-hover:scale-110 transition-transform`}>
              <s.icon className={`w-6 h-6 text-${s.color}-400`} />
            </div>
          </div>
        ))}
      </div>

      <div className="cyber-card min-h-[600px] flex flex-col overflow-hidden">
        {/* Tab Header */}
        <div className="flex border-b border-white/5">
          {['active', 'escalated', 'support'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-10 py-6 text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/5' : 'text-gray-500 hover:text-white'}`}
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
                className="glass p-8 rounded-3xl border border-white/5 hover:border-blue-500/20 transition-all group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-xs font-black">
                      {(q.patient || q.dentist).split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-bold text-white uppercase tracking-tight">{q.patient || q.dentist}</div>
                      <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3" /> {q.time}
                      </div>
                    </div>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    q.type === 'escalated' ? 'border-red-500/20 text-red-400 bg-red-500/5' : 
                    q.type === 'active' ? 'border-blue-500/20 text-blue-400 bg-blue-500/5' : 'border-purple-500/20 text-purple-400 bg-purple-500/5'
                  }`}>
                    {q.status}
                  </div>
                </div>
                
                <div className="bg-black/20 p-6 rounded-2xl border border-white/5 mb-6 text-gray-300 font-medium italic">
                  "{q.query}"
                </div>

                <div className="flex gap-4">
                  <button className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                    {q.type === 'active' ? 'VIEW CONVERSATION' : 'TAKE OVER CHAT'}
                  </button>
                  <button className="px-6 py-3 glass rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all border-white/10">
                    RESOLVE
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4 pt-20">
              <MessageSquare className="w-12 h-12 opacity-10" />
              <div className="text-xs font-black uppercase tracking-widest opacity-30">No queries in this queue</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QueriesPage;
