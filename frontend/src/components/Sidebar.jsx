import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, MessageSquare, Calendar, Bot, Settings, LogOut } from 'lucide-react';

const Sidebar = ({ handleLogout }) => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: Activity, path: '/dashboard' },
    { name: 'Queries', icon: MessageSquare, path: '/queries' }
  ];

  return (
    <aside className="w-72 border-r border-gray-100 p-8 hidden lg:block bg-gray-50/50 font-sans">
      <div className="space-y-12">
        <div className="space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-[#0a2540]/60">MANAGEMENT</h4>
          <nav className="space-y-2">
            {menuItems.map((item, i) => {
              const isActive = location.pathname === item.path;
              return (
                <Link 
                  key={i} 
                  to={item.path}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-bold ${
                    isActive 
                      ? 'bg-[#0a2540]/5 text-[#0a2540] border border-[#0a2540]/10 shadow-sm' 
                      : 'text-gray-500 hover:bg-gray-100/50 hover:text-[#0a2540]'
                  }`}
                >
                  <item.icon className="w-5 h-5 text-gray-500" />
                  <span className="text-sm tracking-tight">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-12 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-3 text-red-500 hover:bg-red-50 w-full rounded-xl transition-all font-black text-sm uppercase tracking-wider focus:outline-none"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="text-xs tracking-wider">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
