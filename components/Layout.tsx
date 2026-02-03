
import React from 'react';
import { User } from '../types';
import { LogOut, Calendar, Users, LayoutDashboard, Settings } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-l border-gray-200 p-6 flex flex-col">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">N</div>
          <span className="text-xl font-bold text-gray-800 tracking-tight">نظام - Nezam</span>
        </div>

        <nav className="flex-1 space-y-2">
          {user.role === 'admin' ? (
            <>
              <Link to="/admin" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all">
                <LayoutDashboard size={20} />
                <span>لوحة التحكم</span>
              </Link>
              <Link to="/admin" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all">
                <Users size={20} />
                <span>المشتركين</span>
              </Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all">
                <LayoutDashboard size={20} />
                <span>الرئيسية</span>
              </Link>
              <Link to="/dashboard/appointments" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all">
                <Calendar size={20} />
                <span>المواعيد</span>
              </Link>
              <Link to="/dashboard/settings" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all">
                <Settings size={20} />
                <span>الإعدادات</span>
              </Link>
            </>
          )}
        </nav>

        <div className="pt-6 border-t border-gray-100 mt-auto">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600">
              {user.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{user.name}</p>
              <p className="text-xs text-gray-500">{user.role === 'admin' ? 'مدير النظام' : 'صاحب عمل'}</p>
            </div>
          </div>
          <button 
            onClick={handleLogoutClick}
            className="flex items-center gap-3 w-full p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut size={20} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};
