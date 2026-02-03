
import React, { useState, useEffect, useRef } from 'react';
import { Appointment, AppointmentStatus, Provider, ProviderNotifications, RecurringSlot } from '../types';
import { 
  Check, 
  X, 
  Phone, 
  MessageSquare, 
  Search, 
  User, 
  Calendar, 
  Clock, 
  FileText, 
  Filter,
  ChevronLeft,
  Send,
  Loader2,
  CheckCheck,
  Settings,
  Image as ImageIcon,
  Palette,
  Save,
  AlertTriangle,
  Bell,
  BellOff,
  ToggleLeft,
  ToggleRight,
  Info,
  Plus,
  Trash2,
  Sparkles,
  Volume2
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
  const [sendingReminderId, setSendingReminderId] = useState<string | null>(null);
  const lastAptCountRef = useRef(appointments.length);
  
  // Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    aptId: string | null;
    status: AppointmentStatus | null;
  }>({
    isOpen: false,
    aptId: null,
    status: null,
  });

  const provider = providers.find(p => p.id === providerId);
  const providerAppointments = appointments.filter(a => a.providerId === providerId);
  
  // Settings local state
  const [settingsForm, setSettingsForm] = useState({
    logoUrl: provider?.logoUrl || '',
    headerColor: provider?.headerColor || '#4f46e5',
    notifications: provider?.notifications || {
      pushEnabled: false,
      notifyOnNew: true,
      notifyOnStatusChange: true
    },
    recurringSlots: provider?.recurringSlots || [] as RecurringSlot[]
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  const [permRequestStatus, setPermRequestStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');

  // مراقبة الحجوزات الجديدة لإرسال إشعار فوري
  useEffect(() => {
    if (appointments.length > lastAptCountRef.current) {
      const newApts = appointments.slice(lastAptCountRef.current);
      const myNewApt = newApts.find(a => a.providerId === providerId);
      
      if (myNewApt && settingsForm.notifications.notifyOnNew) {
        playNotificationSound();
        showToastNotification(`حجز جديد وارد من: ${myNewApt.clientName}`, `الموعد: ${myNewApt.date} الساعة ${myNewApt.time}`);
      }
    }
    lastAptCountRef.current = appointments.length;
  }, [appointments, providerId, settingsForm.notifications.notifyOnNew]);

  const playNotificationSound = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play().catch(e => console.log('Audio play blocked'));
  };

  const showToastNotification = (title: string, body: string) => {
    if (!("Notification" in window)) {
      console.log("Browser does not support notifications");
    } else if (Notification.permission === "granted") {
      new Notification(title, { 
        body,
        icon: provider?.logoUrl || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
      });
    }
  };

  const daysOfWeek = [
    { id: 0, name: 'الأحد' },
    { id: 1, name: 'الاثنين' },
    { id: 2, name: 'الثلاثاء' },
    { id: 3, name: 'الأربعاء' },
    { id: 4, name: 'الخميس' },
    { id: 5, name: 'الجمعة' },
    { id: 6, name: 'السبت' },
  ];

  const actionSuggestions = [
    "طلب تفاصيل إضافية",
    "اقتراح موعد بديل",
    "تأكيد وحجز القاعة",
    "اعتذار لعدم التوفر"
  ];

  const filteredAppointments = providerAppointments.filter(a => {
    const matchesFilter = filter === 'all' || a.status === filter;
    const matchesSearch = a.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          a.clientPhone.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  const uniqueClients = Array.from(new Set(providerAppointments.map(a => a.clientPhone))).map(phone => {
    const clientAppointments = providerAppointments.filter(a => a.clientPhone === phone);
    const lastApt = clientAppointments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    return {
      name: lastApt.clientName,
      phone: phone,
      count: clientAppointments.length,
      lastDate: lastApt.date
    };
  });

  const openConfirmModal = (id: string, status: AppointmentStatus) => {
    setConfirmModal({ isOpen: true, aptId: id, status });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, aptId: null, status: null });
  };

  const handleConfirmAction = () => {
    if (confirmModal.aptId && confirmModal.status) {
      updateStatus(confirmModal.aptId, confirmModal.status);
      closeConfirmModal();
    }
  };

  const updateStatus = (id: string, status: AppointmentStatus) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    if (settingsForm.notifications.pushEnabled && settingsForm.notifications.notifyOnStatusChange) {
      const apt = appointments.find(a => a.id === id);
      if (apt) {
        showToastNotification(`تحديث الحالة`, `تم ${status === AppointmentStatus.CONFIRMED ? 'تأكيد' : 'رفض'} موعد ${apt.clientName}`);
      }
    }
  };

  const handleSendReminder = async (apt: Appointment) => {
    setSendingReminderId(apt.id);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setAppointments(prev => prev.map(a => a.id === apt.id ? { ...a, reminderSent: true } : a));
    setSendingReminderId(null);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    setTimeout(() => {
      setProviders(prev => prev.map(p => 
        p.id === providerId 
          ? { ...p, 
              logoUrl: settingsForm.logoUrl, 
              headerColor: settingsForm.headerColor, 
              notifications: settingsForm.notifications,
              recurringSlots: settingsForm.recurringSlots
            } 
          : p
      ));
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 1000);
  };

  const requestNotificationPermission = async () => {
    setPermRequestStatus('requesting');
    if (!("Notification" in window)) {
      setPermRequestStatus('denied');
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setPermRequestStatus('granted');
      setSettingsForm(prev => ({
        ...prev,
        notifications: { ...prev.notifications, pushEnabled: true }
      }));
    } else {
      setPermRequestStatus('denied');
    }
  };

  const addRecurringSlot = (dayId: number) => {
    const newSlot: RecurringSlot = {
      id: Math.random().toString(36).substr(2, 9),
      dayOfWeek: dayId,
      startTime: '09:00',
      endTime: '17:00'
    };
    setSettingsForm(prev => ({
      ...prev,
      recurringSlots: [...prev.recurringSlots, newSlot]
    }));
  };

  const removeRecurringSlot = (id: string) => {
    setSettingsForm(prev => ({
      ...prev,
      recurringSlots: prev.recurringSlots.filter(s => s.id !== id)
    }));
  };

  const updateRecurringSlot = (id: string, updates: Partial<RecurringSlot>) => {
    setSettingsForm(prev => ({
      ...prev,
      recurringSlots: prev.recurringSlots.map(s => s.id === id ? { ...s, ...updates } : s)
    }));
  };

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.PENDING: return 'bg-orange-100 text-orange-600 border-orange-200';
      case AppointmentStatus.CONFIRMED: return 'bg-green-100 text-green-600 border-green-200';
      case AppointmentStatus.REJECTED: return 'bg-red-100 text-red-600 border-red-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusLabel = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.PENDING: return 'بانتظار التأكيد';
      case AppointmentStatus.CONFIRMED: return 'موعد مؤكد';
      case AppointmentStatus.REJECTED: return 'موعد مرفوض';
      default: return status;
    }
  };

  if (selectedClientPhone) {
    const clientApts = providerAppointments.filter(a => a.clientPhone === selectedClientPhone);
    const clientName = clientApts[0]?.clientName;

    return (
      <div className="space-y-6">
        <button 
          onClick={() => setSelectedClientPhone(null)}
          className="flex items-center gap-2 text-indigo-600 font-bold hover:gap-3 transition-all"
        >
          <ChevronLeft size={20} /> العودة لقائمة العملاء
        </button>
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
              <User size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">ملف العميل: {clientName}</h2>
              <p className="text-gray-500 flex items-center gap-2 mt-1"><Phone size={14} /> {selectedClientPhone}</p>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-bold text-lg border-b pb-2">سجل المواعيد</h3>
            <div className="divide-y divide-gray-50">
              {clientApts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(apt => (
                <div key={apt.id} className="py-4 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-800">{apt.date}</span>
                      <span className="text-gray-400">|</span>
                      <span className="text-gray-600">{apt.time}</span>
                    </div>
                    {apt.note && <p className="text-sm text-gray-500 mt-1">ملاحظة: {apt.note}</p>}
                    {apt.reminderSent && (
                      <p className="text-xs text-green-600 font-bold mt-1 flex items-center gap-1">
                        <CheckCheck size={12} /> تم إرسال تذكير SMS
                      </p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(apt.status)}`}>
                    {getStatusLabel(apt.status)}
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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">لوحة إدارة الأعمال</h1>
          <p className="text-gray-500 mt-1">أهلاً بك، يمكنك إدارة المواعيد وملفات العملاء من هنا</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
          <button 
            onClick={() => setActiveTab('appointments')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'appointments' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            المواعيد
          </button>
          <button 
            onClick={() => setActiveTab('clients')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'clients' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            سجل العملاء
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            الإعدادات
          </button>
        </div>
      </div>

      {activeTab === 'appointments' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'إجمالي المواعيد', val: providerAppointments.length, color: 'text-gray-900', bg: 'bg-white' },
              { label: 'بانتظار الرد', val: providerAppointments.filter(a => a.status === AppointmentStatus.PENDING).length, color: 'text-orange-600', bg: 'bg-white' },
              { label: 'المؤكدة', val: providerAppointments.filter(a => a.status === AppointmentStatus.CONFIRMED).length, color: 'text-green-600', bg: 'bg-white' },
              { label: 'عملاء نشطين', val: uniqueClients.length, color: 'text-indigo-600', bg: 'bg-white' },
            ].map((stat, i) => (
              <div key={i} className={`${stat.bg} p-5 rounded-3xl border border-gray-100 shadow-sm`}>
                <p className="text-xs font-bold text-gray-400 mb-1">{stat.label}</p>
                <p className={`text-2xl font-black ${stat.color}`}>{stat.val}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="ابحث باسم العميل أو رقم الهاتف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-12 pl-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all shadow-sm"
              />
            </div>
            <div className="flex gap-2">
              {(['all', AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${filter === f ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}
                >
                  {f === 'all' ? 'الكل' : getStatusLabel(f)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((apt) => (
                <div key={apt.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-all group">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                      <User size={28} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="font-bold text-lg text-gray-900">{apt.clientName}</h4>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${getStatusColor(apt.status)}`}>
                          {getStatusLabel(apt.status)}
                        </span>
                        {apt.reminderSent && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                            <CheckCheck size={12} /> تم التذكير
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-6 gap-y-1 mt-1">
                        <span className="flex items-center gap-1.5 text-sm text-gray-500"><Phone size={14} className="text-gray-300" /> {apt.clientPhone}</span>
                        <span className="flex items-center gap-1.5 text-sm text-gray-500"><Calendar size={14} className="text-gray-300" /> {apt.date}</span>
                        <span className="flex items-center gap-1.5 text-sm text-gray-500"><Clock size={14} className="text-gray-300" /> {apt.time}</span>
                      </div>
                      
                      {apt.status === AppointmentStatus.PENDING && (
                        <div className="mt-4 animate-in slide-in-from-right duration-300">
                           <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-500 mb-2">
                             <Sparkles size={12} /> ردود مقترحة للعميل:
                           </div>
                           <div className="flex flex-wrap gap-2">
                             {actionSuggestions.map(suggestion => (
                               <button 
                                 key={suggestion} 
                                 className="px-3 py-1 bg-gray-50 hover:bg-indigo-50 text-[10px] text-gray-500 hover:text-indigo-600 rounded-full border border-gray-100 hover:border-indigo-100 transition-all"
                                 onClick={() => alert(`سيتم إرسال: ${suggestion} إلى ${apt.clientName}`)}
                               >
                                 {suggestion}
                               </button>
                             ))}
                           </div>
                        </div>
                      )}

                      {apt.note && (
                        <div className="mt-3 text-sm text-gray-500 bg-gray-50 p-3 rounded-xl border-r-4 border-indigo-100 flex items-start gap-2">
                          <FileText size={14} className="mt-0.5 text-indigo-300" />
                          <span>{apt.note}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {apt.status === AppointmentStatus.PENDING && (
                      <>
                        <button onClick={() => openConfirmModal(apt.id, AppointmentStatus.CONFIRMED)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-100 transition-all"><Check size={18} /> تأكيد</button>
                        <button onClick={() => openConfirmModal(apt.id, AppointmentStatus.REJECTED)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 transition-all"><X size={18} /> رفض</button>
                      </>
                    )}
                    {apt.status === AppointmentStatus.CONFIRMED && !apt.reminderSent && (
                       <button onClick={() => handleSendReminder(apt)} disabled={sendingReminderId === apt.id} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold hover:bg-indigo-100 transition-all disabled:opacity-50">
                        {sendingReminderId === apt.id ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                        <span>إرسال تذكير</span>
                      </button>
                    )}
                    {apt.status === AppointmentStatus.CONFIRMED && <button onClick={() => openConfirmModal(apt.id, AppointmentStatus.REJECTED)} className="px-4 py-2 text-gray-400 hover:text-red-600 text-sm font-bold transition-colors">إلغاء</button>}
                    <button onClick={() => setSelectedClientPhone(apt.clientPhone)} className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="عرض ملف العميل"><FileText size={20} /></button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white p-20 text-center rounded-3xl border border-gray-100 border-dashed">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4"><Calendar size={32} className="text-gray-300" /></div>
                <h3 className="text-lg font-bold text-gray-900">لا توجد مواعيد</h3>
              </div>
            )}
          </div>
        </>
      )}

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${confirmModal.status === AppointmentStatus.CONFIRMED ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {confirmModal.status === AppointmentStatus.CONFIRMED ? <Check size={32} /> : <AlertTriangle size={32} />}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">هل أنت متأكد؟</h3>
              <p className="text-gray-500">
                {confirmModal.status === AppointmentStatus.CONFIRMED 
                  ? 'سيتم تأكيد هذا الموعد وإخطار العميل.' 
                  : 'سيتم رفض هذا الموعد أو إلغاؤه.'}
              </p>
            </div>
            <div className="flex gap-4 p-8 pt-0">
              <button 
                onClick={handleConfirmAction}
                className={`flex-1 py-3 text-white rounded-xl font-bold transition-all shadow-lg ${confirmModal.status === AppointmentStatus.CONFIRMED ? 'bg-green-600 hover:bg-green-700 shadow-green-100' : 'bg-red-600 hover:bg-red-700 shadow-red-100'}`}
              >
                تأكيد العملية
              </button>
              <button 
                onClick={closeConfirmModal}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all"
              >
                تراجع
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'clients' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h2 className="font-bold text-xl">قاعدة بيانات العملاء</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-gray-50 text-gray-400 text-xs font-black uppercase tracking-wider">
                <tr>
                  <th className="p-6">العميل</th>
                  <th className="p-6">رقم الهاتف</th>
                  <th className="p-4 text-center">الحجوزات</th>
                  <th className="p-6">آخر زيارة</th>
                  <th className="p-6">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {uniqueClients.map((client, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="p-6"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold">{client.name.charAt(0)}</div><span className="font-bold text-gray-900">{client.name}</span></div></td>
                    <td className="p-6 text-gray-600">{client.phone}</td>
                    <td className="p-4 text-center"><span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold">{client.count} موعد</span></td>
                    <td className="p-6 text-gray-500 text-sm">{client.lastDate}</td>
                    <td className="p-6"><button onClick={() => setSelectedClientPhone(client.phone)} className="text-indigo-600 font-bold text-sm hover:underline">فتح الملف</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-8">
          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col h-fit">
              <div className="p-8 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900">تخصيص الهوية</h2>
                <p className="text-gray-500 mt-1">إعدادات الشعار والألوان لصفحة الحجز</p>
              </div>
              <form onSubmit={handleSaveSettings} className="p-8 space-y-8 flex-1">
                <div className="space-y-4">
                  <label className="flex items-center gap-2 font-bold text-gray-700">
                    <ImageIcon size={20} className="text-indigo-600" />
                    <span>رابط الشعار (Logo)</span>
                  </label>
                  <div className="flex gap-4 items-center">
                    <div className="w-20 h-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center overflow-hidden">
                      {settingsForm.logoUrl ? (
                        <img src={settingsForm.logoUrl} alt="Preview" className="w-full h-full object-contain" />
                      ) : (
                        <User size={32} className="text-gray-300" />
                      )}
                    </div>
                    <input 
                      type="url" 
                      placeholder="https://example.com/logo.png"
                      value={settingsForm.logoUrl}
                      onChange={(e) => setSettingsForm({...settingsForm, logoUrl: e.target.value})}
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-2 font-bold text-gray-700">
                    <Palette size={20} className="text-indigo-600" />
                    <span>لون الهيدر والسمة الأساسية</span>
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {['#4f46e5', '#059669', '#dc2626', '#d97706', '#2563eb', '#7c3aed'].map(color => (
                      <button 
                        key={color}
                        type="button"
                        onClick={() => setSettingsForm({...settingsForm, headerColor: color})}
                        className={`w-10 h-10 rounded-full border-4 transition-all ${settingsForm.headerColor === color ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    <input 
                      type="color" 
                      value={settingsForm.headerColor}
                      onChange={(e) => setSettingsForm({...settingsForm, headerColor: e.target.value})}
                      className="w-10 h-10 p-1 bg-white border border-gray-200 rounded-xl cursor-pointer"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={saveStatus !== 'idle'}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  {saveStatus === 'saving' ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  <span>{saveStatus === 'success' ? 'تم الحفظ!' : 'حفظ الهوية'}</span>
                </button>
              </form>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col h-fit">
              <div className="p-8 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900">تنبيهات النظام</h2>
                <p className="text-gray-500 mt-1">إدارة الإشعارات الفورية والمتابعة اللحظية</p>
              </div>
              <div className="p-8 space-y-8 flex-1">
                {!settingsForm.notifications.pushEnabled && (
                  <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                      <Bell size={32} />
                    </div>
                    <h4 className="font-bold text-indigo-900">تفعيل إشعارات المتصفح</h4>
                    <p className="text-sm text-indigo-600 mt-1 mb-6">احصل على تنبيهات فورية عند وصول حجز جديد</p>
                    <button 
                      onClick={requestNotificationPermission}
                      disabled={permRequestStatus === 'requesting'}
                      className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2"
                    >
                      {permRequestStatus === 'requesting' ? <Loader2 className="animate-spin" size={18} /> : <Bell size={18} />}
                      <span>تفعيل الآن</span>
                    </button>
                  </div>
                )}

                {settingsForm.notifications.pushEnabled && (
                  <div className="p-6 bg-green-50 rounded-3xl border border-green-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center"><Check size={24} /></div>
                    <div>
                      <h4 className="font-bold text-green-900">إشعارات المتصفح مفعلة</h4>
                      <p className="text-xs text-green-600">ستصلك التنبيهات مع صوت تنبيه خاص</p>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-50 rounded-lg"><Volume2 size={18} className="text-indigo-400" /></div>
                      <div>
                        <p className="font-bold text-gray-800">عند وصول حجز جديد</p>
                        <p className="text-[10px] text-gray-400 italic">إشعار فوري + تنبيه صوتي</p>
                      </div>
                    </div>
                    <button onClick={() => setSettingsForm(prev => ({ ...prev, notifications: { ...prev.notifications, notifyOnNew: !prev.notifications.notifyOnNew } }))} className="text-indigo-600">
                      {settingsForm.notifications.notifyOnNew ? <ToggleRight size={32} /> : <ToggleLeft size={32} className="text-gray-300" />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-50 rounded-lg"><Info size={18} className="text-gray-400" /></div>
                      <div>
                        <p className="font-bold text-gray-800">عند تغيير حالة الموعد</p>
                      </div>
                    </div>
                    <button onClick={() => setSettingsForm(prev => ({ ...prev, notifications: { ...prev.notifications, notifyOnStatusChange: !prev.notifications.notifyOnStatusChange } }))} className="text-indigo-600">
                      {settingsForm.notifications.notifyOnStatusChange ? <ToggleRight size={32} /> : <ToggleLeft size={32} className="text-gray-300" />}
                    </button>
                  </div>
                </div>

                <button 
                  onClick={handleSaveSettings}
                  className="w-full py-4 border-2 border-indigo-600 text-indigo-600 rounded-2xl font-bold hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                >
                  <span>حفظ التفضيلات</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm max-w-4xl mx-auto">
            <div className="p-8 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900">ساعات العمل الأسبوعية</h2>
              <p className="text-gray-500 mt-1">حدد فترات توفرك الأسبوعية لتظهر للعملاء في صفحة الحجز</p>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {daysOfWeek.map((day) => {
                  const daySlots = settingsForm.recurringSlots.filter(s => s.dayOfWeek === day.id);
                  return (
                    <div key={day.id} className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-gray-900">{day.name}</h4>
                        <button 
                          onClick={() => addRecurringSlot(day.id)}
                          className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors"
                          title="إضافة فترة"
                        >
                          <Plus size={18} />
                        </button>
                      </div>

                      <div className="space-y-3 flex-1">
                        {daySlots.length > 0 ? (
                          daySlots.map((slot) => (
                            <div key={slot.id} className="flex items-center gap-2 bg-white p-3 rounded-xl border border-gray-100 shadow-sm group">
                              <div className="flex flex-col flex-1">
                                <div className="flex items-center gap-2">
                                  <Clock size={12} className="text-gray-400" />
                                  <input 
                                    type="time" 
                                    value={slot.startTime}
                                    onChange={(e) => updateRecurringSlot(slot.id, { startTime: e.target.value })}
                                    className="text-xs font-bold border-none p-0 focus:ring-0 w-full"
                                  />
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="w-3" />
                                  <input 
                                    type="time" 
                                    value={slot.endTime}
                                    onChange={(e) => updateRecurringSlot(slot.id, { endTime: e.target.value })}
                                    className="text-xs font-bold text-gray-400 border-none p-0 focus:ring-0 w-full"
                                  />
                                </div>
                              </div>
                              <button 
                                onClick={() => removeRecurringSlot(slot.id)}
                                className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="flex-1 flex items-center justify-center text-xs text-gray-400 italic">
                            مغلق
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 flex justify-end">
                <button 
                  onClick={handleSaveSettings}
                  disabled={saveStatus !== 'idle'}
                  className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-bold shadow-lg hover:bg-black transition-all flex items-center gap-2"
                >
                  {saveStatus === 'saving' ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  <span>حفظ ساعات العمل</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
