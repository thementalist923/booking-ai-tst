
import React, { useState } from 'react';
import { Provider } from '../types';
import { Plus, User, Search, Calendar, CheckCircle, XCircle, AlertCircle, Clock, ExternalLink, Mail } from 'lucide-react';

interface MasterAdminDashboardProps {
  providers: Provider[];
  setProviders: React.Dispatch<React.SetStateAction<Provider[]>>;
}

export const MasterAdminDashboard: React.FC<MasterAdminDashboardProps> = ({ providers, setProviders }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newProvider, setNewProvider] = useState({
    name: '',
    businessName: '',
    email: '',
    slug: '',
    trialDays: 30
  });

  const handleAddProvider = (e: React.FormEvent) => {
    e.preventDefault();
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + newProvider.trialDays);

    const provider: Provider = {
      id: Math.random().toString(36).substr(2, 9),
      name: newProvider.name,
      businessName: newProvider.businessName,
      email: newProvider.email,
      slug: newProvider.slug || newProvider.name.toLowerCase().replace(/\s+/g, '-'),
      trialEndDate: trialEndDate.toISOString(),
      isActive: true
    };

    setProviders([...providers, provider]);
    setShowAddModal(false);
    setNewProvider({ name: '', businessName: '', email: '', slug: '', trialDays: 30 });
  };

  const getDaysLeft = (date: string) => {
    const diff = new Date(date).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  const expiringSoon = providers.filter(p => {
    const daysLeft = getDaysLeft(p.trialEndDate);
    return daysLeft >= 0 && daysLeft <= 7;
  });

  const expired = providers.filter(p => getDaysLeft(p.trialEndDate) < 0);

  const filteredProviders = providers.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">إدارة المشتركين</h1>
          <p className="text-gray-500 mt-1">مرحباً بك، هنا يمكنك إدارة كافة أصحاب الأعمال المشتركين في المنصة</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
        >
          <Plus size={20} />
          <span>إضافة مشترك جديد</span>
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">إجمالي المشتركين</p>
          <p className="text-4xl font-black text-gray-900 mt-2">{providers.length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm border-r-4 border-r-green-500">
          <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">مشتركين نشطين</p>
          <p className="text-4xl font-black text-green-600 mt-2">{providers.filter(p => p.isActive).length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm border-r-4 border-r-orange-500">
          <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">فترات تجريبية تنتهي قريباً</p>
          <p className="text-4xl font-black text-orange-600 mt-2">
            {expiringSoon.length}
          </p>
        </div>
      </div>

      {/* Trial Alerts Section - Dedicated Highlight */}
      {expiringSoon.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <AlertCircle className="text-orange-500" size={20} />
            <h3 className="text-lg font-bold text-gray-800">تنبيهات انتهاء الفترة التجريبية (خلال 7 أيام)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {expiringSoon.map(p => {
              const days = getDaysLeft(p.trialEndDate);
              return (
                <div key={p.id} className="bg-orange-50/50 border border-orange-100 p-5 rounded-3xl flex items-start gap-4 hover:bg-orange-50 transition-colors group">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-orange-600 font-bold border border-orange-100">
                    {p.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{p.businessName}</h4>
                    <p className="text-sm text-gray-500">{p.name}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs font-black text-orange-700 bg-orange-100 px-2.5 py-1 rounded-full">
                        ينتهي خلال {days} {days === 1 ? 'يوم' : 'أيام'}
                      </span>
                      <button className="text-orange-600 hover:text-orange-800 p-1 rounded-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100">
                        <Mail size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Providers Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-2xl text-gray-900">قائمة المشتركين</h2>
            <p className="text-sm text-gray-400 mt-1">تتبع كافة المشتركين وفتراتهم التجريبية</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="ابحث باسم المشترك أو البريد..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-12 pl-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 text-gray-400 text-xs font-black uppercase tracking-wider">
              <tr>
                <th className="p-6">المشترك / النشاط</th>
                <th className="p-6">البريد الإلكتروني</th>
                <th className="p-6">رابط الصفحة</th>
                <th className="p-6">الفترة التجريبية</th>
                <th className="p-6">الحالة</th>
                <th className="p-6">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProviders.length > 0 ? filteredProviders.map((p) => {
                const daysLeft = getDaysLeft(p.trialEndDate);
                const isExpiringSoon = daysLeft >= 0 && daysLeft <= 7;
                const isExpired = daysLeft < 0;

                return (
                  <tr key={p.id} className={`hover:bg-gray-50/80 transition-colors group ${isExpiringSoon ? 'bg-orange-50/20' : ''}`}>
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-lg">
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{p.name}</p>
                          <p className="text-xs text-gray-400 font-bold">{p.businessName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-sm text-gray-600 font-medium">{p.email}</td>
                    <td className="p-6">
                      <a 
                        href={`#/p/${p.slug}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm font-black text-indigo-500 hover:text-indigo-700"
                      >
                        <ExternalLink size={14} />
                        <span>/p/{p.slug}</span>
                      </a>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock size={14} className="text-gray-400" />
                          <span className="text-sm font-bold">{new Date(p.trialEndDate).toLocaleDateString('ar-EG')}</span>
                        </div>
                        <span className={`text-[10px] w-fit font-black px-2.5 py-1 rounded-full uppercase tracking-tighter ${
                          isExpired ? 'bg-red-100 text-red-600 border border-red-200' : 
                          isExpiringSoon ? 'bg-orange-100 text-orange-600 border border-orange-200 animate-pulse' : 
                          'bg-blue-100 text-blue-600 border border-blue-200'
                        }`}>
                          {isExpired ? 'منتهية' : isExpiringSoon ? `ينتهي خلال ${daysLeft} يوم` : `باقي ${daysLeft} يوم`}
                        </span>
                      </div>
                    </td>
                    <td className="p-6">
                      {p.isActive ? (
                        <span className="inline-flex items-center gap-1.5 text-green-600 text-sm font-black bg-green-50 px-3 py-1.5 rounded-xl border border-green-100">
                          <CheckCircle size={16} /> نشط
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-red-600 text-sm font-black bg-red-50 px-3 py-1.5 rounded-xl border border-red-100">
                          <XCircle size={16} /> معطل
                        </span>
                      )}
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <button className="text-gray-400 hover:text-indigo-600 font-bold text-sm bg-gray-50 px-4 py-2 rounded-xl border border-transparent hover:border-indigo-100 hover:bg-white transition-all">تعديل</button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <div className="max-w-xs mx-auto">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User size={32} className="text-gray-300" />
                      </div>
                      <h3 className="text-gray-900 font-bold">لم يتم العثور على نتائج</h3>
                      <p className="text-gray-500 text-sm mt-1">حاول استخدام معايير بحث مختلفة أو إضافة مشترك جديد</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Provider Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-3xl font-black text-gray-900">إضافة مشترك جديد</h3>
              <p className="text-gray-500 mt-2">قم بإعداد ملف تعريف المشترك الجديد لبدء فترته التجريبية</p>
            </div>
            <form onSubmit={handleAddProvider} className="p-10 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-black text-gray-700">اسم صاحب العمل</label>
                  <input 
                    type="text" 
                    required
                    value={newProvider.name}
                    onChange={(e) => setNewProvider({...newProvider, name: e.target.value})}
                    placeholder="مثال: أحمد علي"
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:ring-0 focus:border-indigo-500 focus:bg-white transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-black text-gray-700">اسم النشاط</label>
                  <input 
                    type="text" 
                    required
                    value={newProvider.businessName}
                    onChange={(e) => setNewProvider({...newProvider, businessName: e.target.value})}
                    placeholder="مثال: عيادة الأمل"
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:ring-0 focus:border-indigo-500 focus:bg-white transition-all outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-black text-gray-700">البريد الإلكتروني</label>
                <input 
                  type="email" 
                  required
                  value={newProvider.email}
                  onChange={(e) => setNewProvider({...newProvider, email: e.target.value})}
                  placeholder="name@business.com"
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:ring-0 focus:border-indigo-500 focus:bg-white transition-all outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-black text-gray-700">اسم الرابط (slug)</label>
                  <input 
                    type="text" 
                    placeholder="dr-ahmed"
                    value={newProvider.slug}
                    onChange={(e) => setNewProvider({...newProvider, slug: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:ring-0 focus:border-indigo-500 focus:bg-white transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-black text-gray-700">مدة التجربة (أيام)</label>
                  <input 
                    type="number" 
                    value={newProvider.trialDays}
                    onChange={(e) => setNewProvider({...newProvider, trialDays: parseInt(e.target.value)})}
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:ring-0 focus:border-indigo-500 focus:bg-white transition-all outline-none"
                  />
                </div>
              </div>
              <div className="pt-8 flex gap-4">
                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">إنشاء الملف والبدء</button>
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black hover:bg-gray-200 transition-all"
                >
                  إلغاء العملية
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
