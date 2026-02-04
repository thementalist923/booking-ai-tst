
import React, { useState } from 'react';
import { Provider, BusinessType } from '../types';
import { 
  Plus, User, Search, CheckCircle, XCircle, 
  ExternalLink, Copy, Check, Lock, Eye, EyeOff, Edit3, Save 
} from 'lucide-react';

interface MasterAdminDashboardProps {
  providers: Provider[];
  setProviders: React.Dispatch<React.SetStateAction<Provider[]>>;
}

export const MasterAdminDashboard: React.FC<MasterAdminDashboardProps> = ({ providers, setProviders }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProviderId, setEditingProviderId] = useState<string | null>(null);
  const [tempSlug, setTempSlug] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [newProvider, setNewProvider] = useState({
    name: '',
    businessName: '',
    businessType: BusinessType.OTHER,
    email: '',
    password: '',
    slug: '',
    trialDays: 30
  });

  const getFullBookingUrl = (slug: string) => {
    const origin = window.location.origin;
    const path = window.location.pathname;
    const cleanPath = path.endsWith('/') ? path : path + '/';
    return `${origin}${cleanPath}#/p/${slug}`;
  };

  const handleAddProvider = (e: React.FormEvent) => {
    e.preventDefault();
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + newProvider.trialDays);

    const slugToUse = (newProvider.slug || newProvider.businessName)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-');

    const provider: any = {
      id: Math.random().toString(36).substr(2, 9),
      name: newProvider.name,
      businessName: newProvider.businessName,
      businessType: newProvider.businessType,
      email: newProvider.email,
      slug: slugToUse,
      password: newProvider.password,
      trialEndDate: trialEndDate.toISOString(),
      isActive: true,
      recurringSlots: []
    };

    setProviders([...providers, provider]);
    setShowAddModal(false);
    setNewProvider({ name: '', businessName: '', businessType: BusinessType.OTHER, email: '', password: '', slug: '', trialDays: 30 });
  };

  const startEditingSlug = (p: Provider) => {
    setEditingProviderId(p.id);
    setTempSlug(p.slug);
  };

  const saveSlug = (id: string) => {
    const cleanSlug = tempSlug.trim().toLowerCase().replace(/\s+/g, '-');
    setProviders(prev => prev.map(p => p.id === id ? { ...p, slug: cleanSlug } : p));
    setEditingProviderId(null);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredProviders = providers.filter(p => 
    p.businessName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20 font-['Cairo']">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">إدارة المنصة المركزية</h1>
          <p className="text-gray-600 mt-1 font-bold">تحكم كامل في روابط الصفحات وبيانات المشتركين</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200"
        >
          <Plus size={20} />
          <span>إضافة نشاط تجاري جديد</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="ابحث عن اسم النشاط أو الرابط..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-12 pl-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl text-sm font-bold focus:border-indigo-500 outline-none"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 text-gray-600 text-xs font-black uppercase tracking-wider">
              <tr>
                <th className="p-6">النشاط التجاري</th>
                <th className="p-6">رابط الصفحة (Slug)</th>
                <th className="p-6">الحالة</th>
                <th className="p-6 text-center">الرابط المباشر</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProviders.map((p: any) => {
                const fullUrl = getFullBookingUrl(p.slug);
                const isEditing = editingProviderId === p.id;

                return (
                  <tr key={p.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center font-black">
                          {p.businessName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-gray-900">{p.businessName}</p>
                          <p className="text-[10px] text-gray-400 font-bold">{p.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input 
                            type="text" 
                            value={tempSlug}
                            onChange={(e) => setTempSlug(e.target.value)}
                            className="p-2 border-2 border-indigo-200 rounded-lg text-xs font-black w-40 outline-none focus:border-indigo-600"
                          />
                          <button onClick={() => saveSlug(p.id)} className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                            <Save size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg">
                            /{p.slug}
                          </span>
                          <button onClick={() => startEditingSlug(p)} className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors">
                            <Edit3 size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {p.isActive ? 'نشط' : 'معطل'}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center justify-center gap-3">
                        <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="p-2.5 text-gray-400 hover:text-indigo-600" title="معاينة الصفحة">
                          <ExternalLink size={20} />
                        </a>
                        <button onClick={() => copyToClipboard(fullUrl, p.id)} className="p-2.5 text-gray-400 hover:text-indigo-600" title="نسخ رابط الحجز">
                          {copiedId === p.id ? <Check size={20} className="text-green-600" /> : <Copy size={20} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-2xl font-black text-gray-900">إضافة شريك جديد</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full">
                <XCircle size={24} />
              </button>
            </div>
            <form onSubmit={handleAddProvider} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-500 mr-1">اسم النشاط التجاري</label>
                  <input type="text" required value={newProvider.businessName} onChange={(e) => setNewProvider({...newProvider, businessName: e.target.value})} className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-indigo-500 outline-none font-bold" placeholder="مثال: عيادة النخبة" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-500 mr-1">رابط الصفحة المخصص (Slug)</label>
                  <input type="text" value={newProvider.slug} onChange={(e) => setNewProvider({...newProvider, slug: e.target.value})} className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-indigo-500 outline-none font-bold" placeholder="elite-clinic" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-gray-500 mr-1">البريد الإلكتروني</label>
                    <input type="email" required value={newProvider.email} onChange={(e) => setNewProvider({...newProvider, email: e.target.value})} className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-indigo-500 outline-none font-bold" placeholder="admin@example.com" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-gray-500 mr-1">كلمة المرور</label>
                    <input type="text" required value={newProvider.password} onChange={(e) => setNewProvider({...newProvider, password: e.target.value})} className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-indigo-500 outline-none font-bold" placeholder="123456" />
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[20px] font-black text-lg shadow-xl shadow-indigo-100">إنشاء الحساب وتفعيل الرابط</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
