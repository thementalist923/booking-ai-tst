
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
    
    // Logic for demo simulation
    if (email === 'admin@nezam.com') {
      const user: User = { id: '1', role: 'admin', name: 'مدير النظام' };
      onLogin(user);
      navigate('/admin');
    } else {
      // Find provider by email or mock it
      const providers = JSON.parse(localStorage.getItem('nezam_providers') || '[]');
      const provider = providers.find((p: any) => p.email === email);
      
      if (provider) {
        const user: User = { 
          id: provider.id, 
          role: 'provider', 
          providerId: provider.id, 
          name: provider.name 
        };
        onLogin(user);
        navigate('/dashboard');
      } else {
        // Mock new provider for testing if none exists
        alert('استخدم admin@nezam.com للدخول كمدير، أو أنشئ حساباً من لوحة المدير أولاً.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 border border-gray-100">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4">N</div>
          <h2 className="text-2xl font-bold text-gray-900">تسجيل الدخول</h2>
          <p className="text-gray-500 mt-2">مرحباً بك مجدداً في نظام</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">البريد الإلكتروني</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
              placeholder="name@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">كلمة المرور</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          <button 
            type="submit"
            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            دخول للنظام
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-gray-100 text-center text-sm text-gray-500">
          <p>للتجربة: البريد admin@nezam.com</p>
        </div>
      </div>
    </div>
  );
};
