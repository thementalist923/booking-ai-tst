
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (email === 'admin@nezam.com') {
      const user: User = { id: '1', role: 'admin', name: 'مدير النظام', email: 'admin@nezam.com' };
      onLogin(user);
      navigate('/admin');
    } else {
      const providers = JSON.parse(localStorage.getItem('nezam_providers') || '[]');
      const provider = providers.find((p: any) => p.email === email && p.password === password);
      
      if (provider) {
        const user: User = { 
          id: provider.id, 
          role: 'provider', 
          providerId: provider.id, 
          name: provider.name,
          email: provider.email
        };
        onLogin(user);
        navigate('/dashboard');
      } else {
        alert('بيانات الدخول غير صحيحة. يرجى التأكد من البريد وكلمة المرور.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-['Cairo']">
      <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl p-12 border border-gray-100">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-indigo-600 rounded-[28px] flex items-center justify-center text-white font-black text-4xl mx-auto mb-6 shadow-xl shadow-indigo-100">N</div>
          <h2 className="text-3xl font-black text-gray-900">تسجيل الدخول</h2>
          <p className="text-gray-500 mt-2 font-bold">مرحباً بك في نظام الإدارة الذكي</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-black text-gray-700 mb-2 mr-1">البريد الإلكتروني</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-[20px] focus:ring-0 focus:border-indigo-500 focus:bg-white text-gray-900 font-bold transition-all outline-none"
              placeholder="name@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-black text-gray-700 mb-2 mr-1">كلمة المرور</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-[20px] focus:ring-0 focus:border-indigo-500 focus:bg-white text-gray-900 font-bold transition-all outline-none"
              placeholder="••••••••"
              required
            />
          </div>
          <button 
            type="submit"
            className="w-full py-5 bg-indigo-600 text-white rounded-[20px] font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-[0.98]"
          >
            دخول للنظام
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-gray-100 text-center">
          <p className="text-sm font-bold text-gray-400 mb-2">للتجربة كمدير عام:</p>
          <code className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-xs font-black">admin@nezam.com</code>
        </div>
      </div>
    </div>
  );
};
