
import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Provider, Appointment, AppointmentStatus, RecurringSlot } from '../types';
import { Calendar, Clock, CheckCircle2, Search, Phone, AlertTriangle, Home, ChevronRight } from 'lucide-react';

interface PublicBookingPageProps {
  providers: Provider[];
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
}

export const PublicBookingPage: React.FC<PublicBookingPageProps> = ({ providers, appointments, setAppointments }) => {
  const { slug } = useParams<{ slug: string }>();
  
  // بحث ذكي وغير حساس لحالة الأحرف عن مقدم الخدمة
  const provider = useMemo(() => {
    return providers.find(p => p.slug.toLowerCase() === slug?.toLowerCase());
  }, [providers, slug]);

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

  if (!provider) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-10 text-center font-['Cairo']">
        <div className="w-32 h-32 bg-indigo-50 rounded-[40px] flex items-center justify-center mb-8">
          <AlertTriangle size={64} className="text-indigo-600" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-4">الصفحة غير موجودة</h1>
        <p className="text-gray-500 font-bold mb-10 max-w-sm">عذراً، الرابط الذي تحاول الوصول إليه غير صحيح أو تم تعديله بواسطة الإدارة.</p>
        <Link to="/" className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black flex items-center gap-3">
          <Home size={20} /> العودة للرئيسية
        </Link>
      </div>
    );
  }

  const isSlotBooked = (date: string, time: string) => {
    return appointments.some(a => 
      a.providerId === provider.id && 
      a.date === date && 
      a.time === time && 
      a.status !== AppointmentStatus.REJECTED
    );
  };

  const availableTimeSlots = useMemo(() => {
    if (!formData.date) return [];
    const selectedDateObj = new Date(formData.date);
    const dayOfWeek = selectedDateObj.getDay(); 
    
    const daySlots = provider.recurringSlots?.filter(s => s.dayOfWeek === dayOfWeek) || [];
    if (daySlots.length === 0) return [];

    const generatedSlots: string[] = [];
    daySlots.forEach(slot => {
      const startHour = parseInt(slot.startTime.split(':')[0]);
      const endHour = parseInt(slot.endTime.split(':')[0]);
      
      for (let h = startHour; h < endHour; h++) {
        generatedSlots.push(`${h.toString().padStart(2, '0')}:00`);
        generatedSlots.push(`${h.toString().padStart(2, '0')}:30`);
      }
      if (slot.endTime.endsWith(':30')) {
        generatedSlots.push(`${endHour.toString().padStart(2, '0')}:00`);
      }
    });
    
    return Array.from(new Set(generatedSlots)).sort();
  }, [formData.date, provider.recurringSlots]);

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSlotBooked(formData.date, formData.time)) {
      setAvailabilityMessage('عذراً، هذا الموعد تم حجزه للتو. يرجى اختيار موعد آخر.');
      setBookingStep(1);
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
    setSearchResult(results);
  };

  const primaryColor = provider.headerColor || '#4f46e5';

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10 font-['Cairo']">
      <div className="max-w-2xl mx-auto space-y-6">
        
        <div className="bg-white rounded-[40px] shadow-xl border border-gray-100 text-center relative overflow-hidden">
          <div style={{ backgroundColor: primaryColor }} className="h-40 w-full relative">
             <div className="absolute inset-0 bg-black/10"></div>
          </div>
          <div className="-mt-16 relative z-10 px-8 pb-10">
            <div className="w-32 h-32 bg-white rounded-[32px] p-1.5 shadow-2xl mx-auto mb-6 border-4 border-white flex items-center justify-center font-black text-4xl overflow-hidden" style={{ color: primaryColor }}>
              {provider.logoUrl ? <img src={provider.logoUrl} className="w-full h-full object-cover rounded-[26px]" /> : provider.businessName.charAt(0)}
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">{provider.businessName}</h1>
            <p className="text-gray-600 font-bold mt-1">{provider.name}</p>
          </div>
        </div>

        <div className="bg-gray-200 p-1.5 rounded-[24px] flex gap-1">
          <button onClick={() => setActiveTab('book')} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[20px] font-black transition-all ${activeTab === 'book' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}>
            <Calendar size={20} /> حجز موعد
          </button>
          <button onClick={() => setActiveTab('status')} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[20px] font-black transition-all ${activeTab === 'status' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}>
            <Search size={20} /> تتبع موعدك
          </button>
        </div>

        <div className="bg-white rounded-[40px] p-10 shadow-2xl shadow-indigo-100/50 border border-gray-100 min-h-[400px]">
          {activeTab === 'book' && (
            <div className="animate-in fade-in">
              {bookingStep === 1 && (
                <div className="space-y-8">
                  <div className="text-center">
                    <h2 className="text-2xl font-black text-gray-900">اختر التاريخ والوقت</h2>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-black text-gray-700 mb-3">حدد التاريخ</label>
                      <input type="date" min={new Date().toISOString().split('T')[0]} value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value, time: ''})} className="w-full p-5 bg-gray-50 border-2 border-transparent rounded-[24px] focus:border-indigo-500 font-black text-gray-900 outline-none" />
                    </div>
                    
                    {formData.date && (
                      <div className="space-y-4">
                        <label className="block text-sm font-black text-gray-700 mb-3">المواعيد المتاحة</label>
                        {availableTimeSlots.length > 0 ? (
                          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                            {availableTimeSlots.map(time => {
                              const booked = isSlotBooked(formData.date, time);
                              const active = formData.time === time;
                              return (
                                <button
                                  key={time}
                                  disabled={booked}
                                  onClick={() => setFormData({...formData, time})}
                                  className={`py-4 rounded-[20px] text-sm font-black border-2 transition-all flex flex-col items-center justify-center gap-1 ${booked ? 'bg-gray-100 text-gray-300 border-transparent cursor-not-allowed' : active ? 'text-white border-transparent shadow-lg' : 'bg-white border-gray-100 text-gray-700 hover:border-indigo-300'}`}
                                  style={{ backgroundColor: active ? primaryColor : undefined }}
                                >
                                  {time}
                                  {booked && <span className="text-[10px]">محجوز</span>}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="p-10 bg-red-50 text-red-700 rounded-[32px] text-center font-black flex flex-col gap-2 border border-red-100">
                             <AlertTriangle className="mx-auto" size={32} />
                             اليوم المختار خارج أوقات العمل الرسمية
                          </div>
                        )}
                      </div>
                    )}

                    {availabilityMessage && <div className="p-4 bg-orange-100 text-orange-700 rounded-2xl text-sm font-bold flex items-center gap-2"><AlertTriangle size={18} /> {availabilityMessage}</div>}

                    <button disabled={!formData.date || !formData.time} onClick={() => setBookingStep(2)} className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black text-lg disabled:bg-gray-200 transition-all shadow-xl shadow-indigo-100" style={{ backgroundColor: (formData.date && formData.time) ? primaryColor : undefined }}>الخطوة التالية</button>
                  </div>
                </div>
              )}

              {bookingStep === 2 && (
                <form onSubmit={handleBookingSubmit} className="space-y-8 animate-in slide-in-from-right-10">
                  <div className="flex items-center gap-4 mb-4">
                    <button type="button" onClick={() => setBookingStep(1)} className="p-3 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all"><ChevronRight size={20} /></button>
                    <div>
                      <h2 className="text-2xl font-black text-gray-900">تأكيد البيانات</h2>
                      <p className="text-gray-500 font-bold">موعدك في {formData.date} - {formData.time}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-black text-gray-700">الاسم بالكامل</label>
                      <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="أدخل اسمك" className="w-full p-5 bg-gray-50 rounded-[24px] border-2 border-transparent focus:border-indigo-500 font-bold text-gray-900 outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-black text-gray-700">رقم الجوال</label>
                      <input type="tel" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="05XXXXXXXX" className="w-full p-5 bg-gray-50 rounded-[24px] border-2 border-transparent focus:border-indigo-500 font-bold text-gray-900 outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-black text-gray-700">ملاحظات</label>
                      <textarea value={formData.note} onChange={(e) => setFormData({...formData, note: e.target.value})} placeholder="أي تفاصيل أخرى تود إضافتها؟" className="w-full p-5 bg-gray-50 rounded-[24px] border-2 border-transparent focus:border-indigo-500 font-bold text-gray-900 outline-none" rows={3}></textarea>
                    </div>
                  </div>

                  <button type="submit" className="w-full py-5 text-white rounded-[24px] font-black text-lg shadow-2xl transition-all" style={{ backgroundColor: primaryColor }}>إتمام طلب الحجز</button>
                </form>
              )}

              {bookingStep === 3 && (
                <div className="text-center py-16 animate-in zoom-in-95">
                  <div className="w-24 h-24 bg-green-100 text-green-600 rounded-[32px] flex items-center justify-center mx-auto mb-8">
                    <CheckCircle2 size={56} />
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 mb-3">شكراً لك!</h2>
                  <p className="text-gray-600 font-bold mb-10 max-w-sm mx-auto">تم إرسال طلب الحجز بنجاح، سيقوم النشاط بمراجعة طلبك وتأكيده قريباً.</p>
                  <button onClick={() => { setBookingStep(1); setActiveTab('status'); setSearchPhone(formData.phone); }} className="px-12 py-5 bg-gray-900 text-white rounded-[24px] font-black text-lg transition-all">متابعة حالة الطلب</button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'status' && (
            <div className="space-y-8 animate-in fade-in">
              <div className="text-center">
                <h2 className="text-2xl font-black text-gray-900">تتبع حالة حجزك</h2>
              </div>
              <form onSubmit={handleSearchStatus} className="flex flex-col md:flex-row gap-3">
                <input type="tel" value={searchPhone} onChange={(e) => setSearchPhone(e.target.value)} placeholder="رقم الجوال المستخدم في الحجز" className="flex-1 p-5 bg-gray-50 rounded-[24px] border-2 border-transparent focus:border-indigo-500 font-black text-gray-900 outline-none" />
                <button className="px-10 py-5 bg-gray-900 text-white rounded-[24px] font-black">بحث</button>
              </form>

              {searchResult && (
                <div className="space-y-4 pt-4">
                  {searchResult.length > 0 ? (
                    searchResult.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(a => (
                      <div key={a.id} className="p-6 bg-white border-2 border-gray-100 rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="text-center md:text-right">
                          <div className="flex items-center justify-center md:justify-start gap-4 font-black text-gray-900 mb-1">
                            <span className="flex items-center gap-1.5"><Calendar size={16} className="text-indigo-600" /> {a.date}</span>
                            <span className="flex items-center gap-1.5"><Clock size={16} className="text-indigo-600" /> {a.time}</span>
                          </div>
                        </div>
                        <span className={`px-6 py-2.5 rounded-2xl text-xs font-black ${a.status === AppointmentStatus.CONFIRMED ? 'bg-green-100 text-green-700' : a.status === AppointmentStatus.REJECTED ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                          {a.status === AppointmentStatus.CONFIRMED ? 'تم التأكيد' : a.status === AppointmentStatus.REJECTED ? 'مرفوض' : 'قيد المراجعة'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-16 text-center bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200 text-gray-400 font-black">لا توجد حجوزات مرتبطة بهذا الرقم</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
