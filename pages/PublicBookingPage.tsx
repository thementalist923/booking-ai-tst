
import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Provider, Appointment, AppointmentStatus, RecurringSlot } from '../types';
import { Calendar, Clock, CheckCircle2, Search, User, Phone, Info, ChevronLeft, ChevronRight, Building2, Sparkles } from 'lucide-react';

interface PublicBookingPageProps {
  providers: Provider[];
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
}

export const PublicBookingPage: React.FC<PublicBookingPageProps> = ({ providers, appointments, setAppointments }) => {
  const { slug } = useParams<{ slug: string }>();
  const provider = providers.find(p => p.slug === slug);

  const [activeTab, setActiveTab] = useState<'book' | 'status'>('book');
  const [bookingStep, setBookingStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    time: '',
    note: ''
  });

  const [searchPhone, setSearchPhone] = useState('');
  const [searchResult, setSearchResult] = useState<Appointment[] | null>(null);
  const [availabilityMessage, setAvailabilityMessage] = useState<string | null>(null);

  // Quick note suggestions
  const noteSuggestions = [
    "استشارة سريعة",
    "متابعة دورية",
    "حالة طارئة",
    "استفسار عن التكلفة",
    "تعديل حجز سابق"
  ];

  if (!provider) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-center">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-gray-600">عذراً، هذا الملف غير موجود أو قد تم تعطيله.</p>
        </div>
      </div>
    );
  }

  // Generate slots for the selected date based on provider's recurring slots
  const availableTimeSlots = useMemo(() => {
    if (!formData.date) return [];
    
    const selectedDateObj = new Date(formData.date);
    const dayOfWeek = selectedDateObj.getDay();

    const providerSlots = provider.recurringSlots?.filter(s => s.dayOfWeek === dayOfWeek) || [];
    
    if (providerSlots.length === 0 && (!provider.recurringSlots || provider.recurringSlots.length === 0)) {
      return ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
    }

    const generatedSlots: string[] = [];
    providerSlots.forEach(slot => {
      const startHour = parseInt(slot.startTime.split(':')[0]);
      const endHour = parseInt(slot.endTime.split(':')[0]);
      
      for (let h = startHour; h < endHour; h++) {
        const timeStr = `${h.toString().padStart(2, '0')}:00`;
        generatedSlots.push(timeStr);
      }
    });

    return generatedSlots.sort();
  }, [formData.date, provider.recurringSlots]);

  const checkAvailability = (date: string, time: string) => {
    const exists = appointments.find(a => 
      a.providerId === provider.id && 
      a.date === date && 
      a.time === time && 
      a.status !== AppointmentStatus.REJECTED
    );
    return !exists;
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!checkAvailability(formData.date, formData.time)) {
      setAvailabilityMessage('عذراً، هذا الموعد محجوز مسبقاً، يرجى اختيار موعد آخر.');
      return;
    }

    const newAppointment: Appointment = {
      id: Math.random().toString(36).substr(2, 9),
      providerId: provider.id,
      clientName: formData.name,
      clientPhone: formData.phone,
      date: formData.date,
      time: formData.time,
      note: formData.note,
      status: AppointmentStatus.PENDING,
      createdAt: new Date().toISOString()
    };

    setAppointments([...appointments, newAppointment]);
    setBookingStep(3);
  };

  const handleSearchStatus = (e: React.FormEvent) => {
    e.preventDefault();
    const results = appointments.filter(a => a.providerId === provider.id && a.clientPhone === searchPhone);
    setSearchResult(results.length > 0 ? results : []);
  };

  const getStatusLabel = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.PENDING: return 'قيد المراجعة من الإدارة';
      case AppointmentStatus.CONFIRMED: return 'تم تأكيد الموعد بنجاح';
      case AppointmentStatus.REJECTED: return 'عذراً، تم رفض الموعد';
      default: return '';
    }
  };

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.PENDING: return 'text-orange-600 bg-orange-50';
      case AppointmentStatus.CONFIRMED: return 'text-green-600 bg-green-50';
      case AppointmentStatus.REJECTED: return 'text-red-600 bg-red-50';
      default: return '';
    }
  };

  const primaryColor = provider.headerColor || '#4f46e5';

  return (
    <div className="min-h-screen bg-[#F8F9FF] p-4 md:p-10 font-['Cairo']">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header Profile */}
        <div className="bg-white rounded-3xl shadow-sm border border-indigo-50 text-center relative overflow-hidden">
          <div style={{ backgroundColor: primaryColor }} className="h-32 w-full relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full"></div>
          </div>
          
          <div className="-mt-12 relative z-10 px-8 pb-8">
            <div className="w-24 h-24 bg-white rounded-3xl p-1 shadow-xl mx-auto mb-4 border-4 border-white overflow-hidden">
              {provider.logoUrl ? (
                <img src={provider.logoUrl} alt={provider.businessName} className="w-full h-full object-contain rounded-2xl" />
              ) : (
                <div style={{ backgroundColor: primaryColor }} className="w-full h-full rounded-2xl flex items-center justify-center text-white text-3xl font-bold">
                  {provider.businessName.charAt(0)}
                </div>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{provider.businessName}</h1>
            <p className="text-gray-500">{provider.name}</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="bg-gray-100 p-1.5 rounded-2xl flex gap-1">
          <button 
            onClick={() => setActiveTab('book')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${activeTab === 'book' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
            style={{ color: activeTab === 'book' ? primaryColor : undefined }}
          >
            <Calendar size={18} /> طلب حجز موعد
          </button>
          <button 
            onClick={() => setActiveTab('status')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${activeTab === 'status' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
            style={{ color: activeTab === 'status' ? primaryColor : undefined }}
          >
            <Search size={18} /> متابعة حجز
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-indigo-50/50 border border-indigo-50">
          
          {activeTab === 'book' && (
            <div>
              {bookingStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-xl font-bold text-gray-900">اختر الموعد المناسب</h2>
                    <p className="text-sm text-gray-500 mt-1">المواعيد المتاحة تظهر تلقائياً بناءً على جدول العمل</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">التاريخ</label>
                      <input 
                        type="date" 
                        min={new Date().toISOString().split('T')[0]}
                        value={formData.date}
                        onChange={(e) => {
                          setFormData({...formData, date: e.target.value, time: ''});
                          setAvailabilityMessage(null);
                        }}
                        className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:outline-none transition-all"
                        style={{ borderColor: formData.date ? primaryColor : 'transparent' }}
                      />
                    </div>
                    {formData.date && (
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">الوقت</label>
                        {availableTimeSlots.length > 0 ? (
                          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                            {availableTimeSlots.map(time => {
                              const available = checkAvailability(formData.date, time);
                              const isSelected = formData.time === time;
                              return (
                                <button
                                  key={time}
                                  type="button"
                                  disabled={!available}
                                  onClick={() => {
                                    setFormData({...formData, time});
                                    setAvailabilityMessage(null);
                                  }}
                                  className={`py-3 rounded-xl text-sm font-bold transition-all border-2`}
                                  style={{ 
                                    backgroundColor: isSelected ? primaryColor : (available ? 'white' : '#f9fafb'),
                                    borderColor: isSelected ? primaryColor : (available ? '#f3f4f6' : '#f3f4f6'),
                                    color: isSelected ? 'white' : (available ? '#374151' : '#d1d5db')
                                  }}
                                >
                                  {time}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="p-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-500">
                            عذراً، لا توجد مواعيد عمل متاحة في هذا اليوم.
                          </div>
                        )}
                      </div>
                    )}
                    {availabilityMessage && (
                      <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                        {availabilityMessage}
                      </div>
                    )}
                    <button 
                      disabled={!formData.date || !formData.time}
                      onClick={() => setBookingStep(2)}
                      className="w-full py-5 text-white rounded-2xl font-bold shadow-lg transition-all disabled:bg-gray-200 disabled:shadow-none"
                      style={{ 
                        backgroundColor: (!formData.date || !formData.time) ? undefined : primaryColor,
                        boxShadow: (!formData.date || !formData.time) ? undefined : `0 10px 15px -3px ${primaryColor}33`
                      }}
                    >
                      متابعة
                    </button>
                  </div>
                </div>
              )}

              {bookingStep === 2 && (
                <form onSubmit={handleBookingSubmit} className="space-y-6">
                  <div className="flex items-center gap-4 mb-8">
                    <button type="button" onClick={() => setBookingStep(1)} className="p-2 bg-gray-100 text-gray-600 rounded-lg"><ChevronRight size={20} /></button>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">بيانات الحجز</h2>
                      <p className="text-sm text-gray-500">من فضلك أدخل بياناتك للتواصل معك</p>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-2xl flex items-center justify-between border" style={{ backgroundColor: primaryColor + '08', borderColor: primaryColor + '20' }}>
                    <div className="flex items-center gap-3">
                      <Calendar size={20} style={{ color: primaryColor }} />
                      <span className="text-sm font-bold">{formData.date}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock size={20} style={{ color: primaryColor }} />
                      <span className="text-sm font-bold">{formData.time}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">الاسم الكامل</label>
                      <div className="relative">
                        <User className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full pr-12 pl-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:outline-none transition-all" placeholder="أدخل اسمك" style={{ borderColor: formData.name ? primaryColor : 'transparent' }} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">رقم الهاتف</label>
                      <div className="relative">
                        <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input type="tel" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full pr-12 pl-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:outline-none transition-all" placeholder="01xxxxxxxxx" style={{ borderColor: formData.phone ? primaryColor : 'transparent' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                         <label className="block text-sm font-bold text-gray-700">ملاحظات إضافية (اختياري)</label>
                         <div className="flex items-center gap-1 text-[10px] text-indigo-500 font-bold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                           <Sparkles size={10} /> اقتراحات ذكية
                         </div>
                      </div>
                      
                      {/* Note Suggestions Pills */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {noteSuggestions.map(suggestion => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => setFormData({...formData, note: suggestion})}
                            className="px-3 py-1.5 bg-gray-50 hover:bg-indigo-50 text-xs text-gray-600 hover:text-indigo-600 rounded-full border border-gray-100 hover:border-indigo-100 transition-all"
                          >
                            + {suggestion}
                          </button>
                        ))}
                      </div>

                      <textarea value={formData.note} onChange={(e) => setFormData({...formData, note: e.target.value})} rows={3} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:outline-none transition-all" placeholder="أي تفاصيل أخرى تود إخبارنا بها..." style={{ borderColor: formData.note ? primaryColor : 'transparent' }}></textarea>
                    </div>
                  </div>

                  <button type="submit" className="w-full py-5 text-white rounded-2xl font-bold shadow-lg transition-all" style={{ backgroundColor: primaryColor, boxShadow: `0 10px 15px -3px ${primaryColor}44` }}>تأكيد طلب الحجز</button>
                </form>
              )}

              {bookingStep === 3 && (
                <div className="text-center py-6 space-y-6">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={48} />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900">تم إرسال طلبك بنجاح!</h2>
                    <p className="text-gray-500">شكراً لك {formData.name}، لقد استلمنا طلب الحجز الخاص بك.</p>
                  </div>

                  <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-4 max-w-sm mx-auto">
                    <h3 className="font-bold text-gray-800 border-b border-gray-200 pb-3 flex items-center gap-2 justify-center">
                       <Building2 size={18} className="text-gray-400" />
                       <span>{provider.businessName}</span>
                    </h3>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 flex items-center gap-2"><Calendar size={14} /> التاريخ</span>
                        <span className="font-bold text-gray-900">{formData.date}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 flex items-center gap-2"><Clock size={14} /> الوقت</span>
                        <span className="font-bold text-gray-900">{formData.time}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm max-w-xs mx-auto leading-relaxed">
                    طلبك الآن قيد المراجعة، سنقوم بالتواصل معك على الرقم <span className="font-bold">{formData.phone}</span> لتأكيد الموعد نهائياً.
                  </p>

                  <button 
                    onClick={() => { 
                      setBookingStep(1); 
                      setFormData({name: '', phone: '', date: '', time: '', note: ''}); 
                      setActiveTab('status'); 
                    }} 
                    className="px-8 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all" 
                    style={{ backgroundColor: primaryColor + '15', color: primaryColor }}
                  >
                    متابعة حالة الحجز
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'status' && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900">متابعة موعدك</h2>
                <p className="text-sm text-gray-500 mt-1">أدخل رقم الهاتف الذي قمت بالحجز به</p>
              </div>

              <form onSubmit={handleSearchStatus} className="flex flex-col md:flex-row gap-3">
                <input type="tel" placeholder="أدخل رقم هاتفك..." required value={searchPhone} onChange={(e) => setSearchPhone(e.target.value)} className="flex-1 px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:outline-none transition-all" style={{ borderColor: searchPhone ? primaryColor : 'transparent' }} />
                <button type="submit" className="px-8 py-4 text-white rounded-2xl font-bold transition-all shadow-lg" style={{ backgroundColor: primaryColor, boxShadow: `0 10px 15px -3px ${primaryColor}44` }}>بحث</button>
              </form>

              {searchResult !== null && (
                <div className="space-y-4">
                  {searchResult.length > 0 ? (
                    searchResult.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(apt => (
                      <div key={apt.id} className="p-6 rounded-2xl border-2 border-gray-100 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusColor(apt.status)}`}>{getStatusLabel(apt.status)}</span>
                          <span className="text-xs text-gray-400">{new Date(apt.createdAt).toLocaleDateString('ar-EG')}</span>
                        </div>
                        <div className="flex items-center gap-4 text-gray-700">
                          <Calendar size={18} style={{ color: primaryColor }} /><span className="font-bold">{apt.date}</span>
                          <Clock size={18} style={{ color: primaryColor }} /><span className="font-bold">{apt.time}</span>
                        </div>
                        <div className="pt-2 flex items-center gap-2 text-sm text-gray-500"><Info size={16} /><span>يرجى الحضور قبل الموعد بـ 10 دقائق</span></div>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-500">لم يتم العثور على أي حجوزات لهذا الرقم</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="text-center text-gray-400 text-sm">
          <p>يعمل بواسطة نظام "Nezam" لإدارة المواعيد</p>
        </div>
      </div>
    </div>
  );
};
