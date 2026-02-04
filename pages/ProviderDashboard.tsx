
import React, { useState } from 'react';
import { Appointment, AppointmentStatus, Provider, RecurringSlot, BusinessType } from '../types';
import { 
  Check, X, Phone, Search, User, Calendar, Clock, 
  ChevronLeft, Loader2, CheckCheck, Save, Plus, Trash2, 
  ExternalLink, Copy, Lock, Globe, Info
} from 'lucide-react';

interface ProviderDashboardProps {
  providerId: string;
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  providers: Provider[];
  setProviders: React.Dispatch<React.SetStateAction<Provider[]>>;
}

export const ProviderDashboard: React.FC<ProviderDashboardProps> = ({ 
  providerId, 
  appointments, 
  setAppointments,
  providers,
  setProviders
}) => {
  const [activeTab, setActiveTab] = useState<'appointments' | 'clients' | 'settings'>('appointments');
  const [filter, setFilter] = useState<'all' | AppointmentStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientPhone, setSelectedClientPhone] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const provider = providers.find(p => p.id === providerId);
  const providerAppointments = appointments.filter(a => a.providerId === providerId);
  
  const [settingsForm, setSettingsForm] = useState({
    name: provider?.name || '',
    businessName: provider?.businessName || '',
    businessType: provider?.businessType || BusinessType.OTHER,
    email: provider?.email || '',
    password: (provider as any)?.password || '',
    slug: provider?.slug || '',
    logoUrl: provider?.logoUrl || '',
    headerColor: provider?.headerColor || '#4f46e5',
    recurringSlots: provider?.recurringSlots || [] as RecurringSlot[]
  });

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const getPublicBookingUrl = () => {
    if (!provider?.slug) return '';
    let baseUrl = window.location.href.split('#')[0];
    if (!baseUrl.endsWith('/')) baseUrl += '/';
    return `${baseUrl}#/p/${provider.slug}`;
  };

  const copyUrl = () => {
    const url = getPublicBookingUrl();
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');

    setTimeout(() => {
      setProviders(prev => prev.map(p => p.id === providerId ? { 
        ...p, 
        name: settingsForm.name,
        businessName: settingsForm.businessName,
        email: settingsForm.email,
        password: settingsForm.password,
        recurringSlots: settingsForm.recurringSlots
      } : p));
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 800);
  };

  const addRecurringSlot = () => {
    const newSlot: RecurringSlot = {
      id: Math.random().toString(36).substr(2, 9),
      dayOfWeek: 0,
      startTime: '09:00',
      endTime: '17:00'
    };
    setSettingsForm({
      ...settingsForm,
      recurringSlots: [...settingsForm.recurringSlots, newSlot]
    });
  };

  const removeRecurringSlot = (id: string) => {
    setSettingsForm({
      ...settingsForm,
      recurringSlots: settingsForm.recurringSlots.filter(s => s.id !== id)
    });
  };

  const updateRecurringSlot = (id: string, field: keyof RecurringSlot, value: any) => {
    setSettingsForm({
      ...settingsForm,
      recurringSlots: settingsForm.recurringSlots.map(s => s.id === id ? { ...s, [field]: value } : s)
    });
  };

  const filteredAppointments = providerAppointments.filter(a => {
    const matchesFilter = filter === 'all' || a.status === filter;
    const matchesSearch = a.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || a.clientPhone.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  const updateStatus = (id: string, status: AppointmentStatus) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const daysLabels = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  if (selectedClientPhone) {
    const clientApts = providerAppointments.filter(a => a.clientPhone === selectedClientPhone);
    return (
      <div className="space-y-6 font-['Cairo']">
        <button onClick={() => setSelectedClientPhone(null)} className="flex items-center gap-2 text-indigo-700 font-black hover:gap-3 transition-all"><ChevronLeft size={20} /> العودة لسجل العملاء</button>
        <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-6 mb-10">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-700 rounded-3xl flex items-center justify-center font-black text-3xl">{clientApts[0]?.clientName.charAt(0)}</div>
            <div>
              <h2 className="text-3xl font-black text-gray-900">{clientApts[0]?.clientName}</h2>
              <p className="text-gray-600 font-bold flex items-center gap-2 mt-1"><Phone size={18} /> {selectedClientPhone}</p>
            </div>
          </div>
          <div className="space-y-6">
            <h3 className="font-black text-xl border-b pb-4">تاريخ المواعيد</h3>
            <div className="space-y-4">
              {clientApts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(apt => (
                <div key={apt.id} className="p-6 bg-gray-50 rounded-3xl flex justify-between items-center border border-transparent hover:border-indigo-100 transition-all">
                  <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2 font-black text-gray-900"><Calendar size={20} className="text-indigo-600" /> {apt.date}</div>
                    <div className="flex items-center gap-2 font-black text-gray-900"><Clock size={20} className="text-indigo-600" /> {apt.time}</div>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase ${apt.status === AppointmentStatus.CONFIRMED ? 'bg-green-100 text-green-700' : apt.status === AppointmentStatus.REJECTED ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                    {apt.status === AppointmentStatus.CONFIRMED ? 'مؤكد' : apt.status === AppointmentStatus.REJECTED ? 'مرفوض' : 'قيد المراجعة'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 font-['Cairo']">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">لوحة تحكم: {provider?.businessName}</h1>
          <p className="text-gray-600 font-bold mt-1">إدارة كاملة لمواعيد عملائك</p>
        </div>
        
        <div className="bg-white p-3 rounded-[28px] shadow-xl border border-gray-100 flex items-center max-w-full gap-4">
          <div className="hidden md:block">
            <p className="text-[10px] font-black text-gray-400 uppercase">رابط الحجز العام</p>
            <p className="text-xs font-bold text-indigo-600 truncate max-w-[200px]">{getPublicBookingUrl().split('#')[1] || '/'}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={copyUrl} className="p-3 bg-indigo-50 text-indigo-700 rounded-2xl hover:bg-indigo-100 transition-all flex items-center gap-2 font-black text-xs">
              {copied ? <CheckCheck size={18} className="text-green-600" /> : <Copy size={18} />}
              <span>{copied ? 'تم النسخ' : 'نسخ الرابط'}</span>
            </button>
            <a href={getPublicBookingUrl()} target="_blank" rel="noopener noreferrer" className="p-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">
              <ExternalLink size={18} />
            </a>
          </div>
        </div>
      </div>

      <div className="flex bg-white p-1.5 rounded-[24px] border border-gray-100 shadow-sm w-fit">
        {['appointments', 'clients', 'settings'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-8 py-3.5 rounded-[18px] font-black text-sm transition-all ${activeTab === tab ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-500 hover:text-gray-900'}`}
          >
            {tab === 'appointments' ? 'المواعيد' : tab === 'clients' ? 'العملاء' : 'إعدادات الحساب'}
          </button>
        ))}
      </div>

      {activeTab === 'appointments' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" placeholder="ابحث بالاسم أو رقم الهاتف..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pr-14 pl-6 py-4 bg-white border-2 border-transparent rounded-[24px] focus:border-indigo-500 outline-none transition-all shadow-sm font-bold text-gray-900" />
            </div>
            <div className="flex bg-gray-100 p-1.5 rounded-[24px]">
              {(['all', AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)} className={`px-6 py-2.5 rounded-[18px] text-xs font-black transition-all ${filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
                  {f === 'all' ? 'الكل' : f === AppointmentStatus.PENDING ? 'قيد المراجعة' : 'المؤكدة'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(apt => (
                <div key={apt.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-all">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-700 rounded-2xl flex items-center justify-center font-black text-xl">
                      {apt.clientName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-black text-lg text-gray-900">{apt.clientName}</h4>
                        <span className={`px-3 py-1 rounded-xl text-[10px] font-black border ${apt.status === AppointmentStatus.CONFIRMED ? 'bg-green-50 text-green-700 border-green-200' : apt.status === AppointmentStatus.REJECTED ? 'bg-red-50 text-red-700 border-red-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                          {apt.status === AppointmentStatus.CONFIRMED ? 'مؤكد' : apt.status === AppointmentStatus.REJECTED ? 'مرفوض' : 'قيد المراجعة'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 mt-2">
                        <span className="flex items-center gap-1.5 text-sm text-gray-600 font-bold"><Phone size={14} className="text-indigo-500" /> {apt.clientPhone}</span>
                        <span className="flex items-center gap-1.5 text-sm text-gray-600 font-bold"><Calendar size={14} className="text-indigo-500" /> {apt.date}</span>
                        <span className="flex items-center gap-1.5 text-sm text-gray-600 font-bold"><Clock size={14} className="text-indigo-500" /> {apt.time}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {apt.status === AppointmentStatus.PENDING && (
                      <>
                        <button onClick={() => updateStatus(apt.id, AppointmentStatus.CONFIRMED)} className="px-5 py-3 bg-green-600 text-white rounded-xl font-black hover:bg-green-700 transition-all flex items-center gap-2 text-sm"><Check size={16} /> تأكيد</button>
                        <button onClick={() => updateStatus(apt.id, AppointmentStatus.REJECTED)} className="px-5 py-3 bg-red-50 text-red-600 rounded-xl font-black hover:bg-red-100 transition-all border border-red-100 text-sm">رفض</button>
                      </>
                    )}
                    <button onClick={() => setSelectedClientPhone(apt.clientPhone)} className="p-3 text-gray-400 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl transition-all"><User size={20} /></button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white p-20 text-center rounded-[40px] border border-gray-100 border-dashed">
                <Calendar size={48} className="text-gray-200 mx-auto mb-4" />
                <h3 className="text-xl font-black text-gray-400">لا توجد حجوزات في هذه القائمة</h3>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
          <form onSubmit={handleSaveSettings} className="space-y-8">
            <div className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black flex items-center gap-3"><Globe className="text-indigo-600" /> رابط الصفحة الشخصية</h3>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-xl border border-orange-100">
                  <Info size={14} />
                  <span className="text-[10px] font-black tracking-tight">تعديل الرابط من خلال الأدمن العام فقط</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 group">
                  <label className="block text-sm font-black text-gray-700">رابط الصفحة (غير قابل للتعديل)</label>
                  <div className="flex items-center bg-gray-100 rounded-2xl border-2 border-gray-200 cursor-not-allowed overflow-hidden opacity-80">
                    <span className="px-4 text-gray-400 font-bold text-xs bg-gray-200 h-full flex items-center border-l">/p/</span>
                    <input type="text" value={provider?.slug} disabled className="flex-1 p-4 bg-transparent font-black text-gray-400 outline-none cursor-not-allowed" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-black text-gray-700">اسم النشاط التجاري</label>
                  <input type="text" value={settingsForm.businessName} onChange={(e) => setSettingsForm({...settingsForm, businessName: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 font-black text-gray-900 outline-none shadow-inner" required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-black text-gray-700">البريد الإلكتروني (لتسجيل الدخول)</label>
                  <input type="email" value={settingsForm.email} onChange={(e) => setSettingsForm({...settingsForm, email: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 font-black text-gray-900 outline-none shadow-inner" required />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-black text-gray-700">كلمة المرور</label>
                  <input type="text" value={settingsForm.password} onChange={(e) => setSettingsForm({...settingsForm, password: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 font-black text-gray-900 outline-none shadow-inner" required />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black flex items-center gap-3"><Clock className="text-indigo-600" /> تنظيم أوقات العمل والمواعيد</h3>
                <button type="button" onClick={addRecurringSlot} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-black text-xs hover:bg-indigo-100">
                  <Plus size={16} /> إضافة فترة
                </button>
              </div>

              <div className="space-y-4">
                {settingsForm.recurringSlots.map((slot) => (
                  <div key={slot.id} className="flex flex-col md:flex-row items-center gap-4 bg-gray-50 p-6 rounded-[28px] border border-transparent hover:border-indigo-100 transition-all">
                    <div className="flex-1 w-full">
                      <select 
                        value={slot.dayOfWeek}
                        onChange={(e) => updateRecurringSlot(slot.id, 'dayOfWeek', parseInt(e.target.value))}
                        className="w-full p-3 bg-white rounded-xl border border-gray-200 font-black text-gray-900 outline-none focus:border-indigo-500"
                      >
                        {daysLabels.map((day, i) => <option key={i} value={i}>{day}</option>)}
                      </select>
                    </div>
                    <div className="flex-1 w-full flex items-center gap-2">
                      <input type="time" value={slot.startTime} onChange={(e) => updateRecurringSlot(slot.id, 'startTime', e.target.value)} className="w-full p-3 bg-white rounded-xl border border-gray-200 font-black text-gray-900 outline-none" />
                      <span className="font-bold text-gray-400">إلى</span>
                      <input type="time" value={slot.endTime} onChange={(e) => updateRecurringSlot(slot.id, 'endTime', e.target.value)} className="w-full p-3 bg-white rounded-xl border border-gray-200 font-black text-gray-900 outline-none" />
                    </div>
                    <button type="button" onClick={() => removeRecurringSlot(slot.id)} className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="sticky bottom-6 flex justify-center">
              <button 
                type="submit" 
                disabled={saveStatus === 'saving'}
                className={`px-12 py-5 text-white rounded-[24px] font-black text-lg shadow-2xl transition-all flex items-center gap-4 ${saveStatus === 'success' ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
              >
                {saveStatus === 'saving' ? <Loader2 className="animate-spin" /> : saveStatus === 'success' ? <CheckCheck /> : <Save />}
                <span>{saveStatus === 'saving' ? 'جاري الحفظ...' : saveStatus === 'success' ? 'تم الحفظ بنجاح' : 'حفظ كافة التغييرات'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
