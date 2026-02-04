
import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Provider, Appointment, AppointmentStatus, RecurringSlot } from '../types.ts';
import { Calendar, Clock, CheckCircle2, Search, Phone, AlertTriangle, Home, ChevronRight } from 'lucide-react';

interface PublicBookingPageProps {
  providers: Provider[];
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
}

export const PublicBookingPage: React.FC<PublicBookingPageProps> = ({ providers, appointments, setAppointments }) => {
  const { slug } = useParams<{ slug: string }>();
  
  const provider = useMemo(() => {
    if (!slug) return null;
    return providers.find(p => p.slug.toLowerCase().trim() === slug.toLowerCase().trim());
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
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle size={48} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">رابط غير صحيح</h1>
        <p className="text-gray-500 font-bold mb-8">عذراً، لم نتمكن من العثور على الصفحة المطلوبة.</p>
        <Link to="/" className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold">العودة للرئيسية</Link>
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
      const [startH, startM] = slot.startTime.split(':').map(Number);
      const [endH, endM] = slot.endTime.split(':').map(Number);
      
      let currentH = startH;
      let currentM = startM;

      while (currentH < endH || (currentH === endH && currentM < endM)) {
        generatedSlots.push(`${currentH.toString().padStart(2, '0')}:${currentM.toString().padStart(2, '0')}`);
        currentM += 30;
        if (currentM >= 60) {
          currentH += 1;
          currentM = 0;
        }
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

    setAppointments(prev => [...prev, newAppointment]);
    setBookingStep(3);
  };

  const handleSearchStatus = (e: React.FormEvent) => {
    e.preventDefault();
    const results = appointments.filter(a => a.providerId === provider.id && a.clientPhone === searchPhone);
    setSearchResult(results);
  };

  const primaryColor = provider.headerColor || '#4f46e5';

  return (
    <div className="min-h-screen bg-gray-50 font-['Cairo'] pb-20">
      <div className="max-w-xl mx-auto">
        <div className="bg-white shadow-xl overflow-hidden md:rounded-b-[40px]">
          <div style={{ backgroundColor: primaryColor }} className="h-32 w-full"></div>
          <div className="px-6 pb-8 text-center -mt-12">
            <div className="w-24 h-24 bg-white rounded-3xl p-1 shadow-xl mx-auto mb-4 flex items-center justify-center font-black text-3xl border-4 border-white overflow-hidden" style={{ color: primaryColor }}>
              {provider.logoUrl ? <img src={provider.logoUrl} className="w-full h-full object-cover rounded-2xl" /> : provider.businessName.charAt(0)}
            </div>
            <h1 className="text-2xl font-black text-gray-900">{provider.businessName}</h1>
            <p className="text-gray-500 font-bold">{provider.name}</p>
          </div>
        </div>

        <div className="px-4 mt-6">
          <div className="bg-white p-2 rounded-2xl shadow-sm flex gap-1 mb-6">
            <button onClick={() => setActiveTab('book')} className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${activeTab === 'book' ? 'bg-indigo-600 text-white' : 'text-gray-500'}`}>حجز موعد</button>
            <button onClick={() => setActiveTab('status')} className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${activeTab === 'status' ? 'bg-indigo-600 text-white' : 'text-gray-500'}`}>تتبع حجز</button>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            {activeTab === 'book' && (
              <>
                {bookingStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-black text-gray-700 mb-2">اختر التاريخ</label>
                      <input type="date" min={new Date().toISOString().split('T')[0]} value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value, time: ''})} className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-xl focus:border-indigo-500 font-bold outline-none" />
                    </div>
                    {formData.date && (
                      <div>
                        <label className="block text-sm font-black text-gray-700 mb-3">المواعيد المتاحة</label>
                        {availableTimeSlots.length > 0 ? (
                          <div className="grid grid-cols-3 gap-2">
                            {availableTimeSlots.map(time => {
                              const booked = isSlotBooked(formData.date, time);
                              const active = formData.time === time;
                              return (
                                <button
                                  key={time}
                                  disabled={booked}
                                  onClick={() => setFormData({...formData, time})}
                                  className={`py-3 rounded-xl text-xs font-black border-2 transition-all ${booked ? 'bg-gray-100 text-gray-300 border-transparent cursor-not-allowed' : active ? 'bg-indigo-600 text-white border-transparent' : 'bg-white border-gray-100 text-gray-700 hover:border-indigo-300'}`}
                                >
                                  {time}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="p-6 bg-red-50 text-red-700 rounded-xl text-center text-sm font-bold">عذراً، النشاط مغلق في هذا اليوم</div>
                        )}
                      </div>
                    )}
                    <button disabled={!formData.date || !formData.time} onClick={() => setBookingStep(2)} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black disabled:bg-gray-200">التالي</button>
                  </div>
                )}
                {bookingStep === 2 && (
                  <form onSubmit={handleBookingSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="الاسم بالكامل" className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-indigo-500 font-bold outline-none" />
                      <input type="tel" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="رقم الجوال" className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-indigo-500 font-bold outline-none" />
                      <textarea value={formData.note} onChange={(e) => setFormData({...formData, note: e.target.value})} placeholder="ملاحظات (اختياري)" className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-indigo-500 font-bold outline-none" rows={3}></textarea>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setBookingStep(1)} className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-xl font-black">رجوع</button>
                      <button type="submit" className="flex-[2] py-4 bg-indigo-600 text-white rounded-xl font-black">تأكيد الحجز</button>
                    </div>
                  </form>
                )}
                {bookingStep === 3 && (
                  <div className="text-center py-8">
                    <CheckCircle2 size={64} className="text-green-500 mx-auto mb-4" />
                    <h2 className="text-xl font-black mb-2">تم استلام طلبك!</h2>
                    <p className="text-gray-500 font-bold text-sm mb-6">سيتم مراجعة الموعد وتأكيده من قبل الإدارة.</p>
                    <button onClick={() => { setBookingStep(1); setActiveTab('status'); setSearchPhone(formData.phone); }} className="w-full py-4 bg-gray-900 text-white rounded-xl font-black">متابعة حالة الحجز</button>
                  </div>
                )}
              </>
            )}
            {activeTab === 'status' && (
              <div className="space-y-6">
                <form onSubmit={handleSearchStatus} className="flex gap-2">
                  <input type="tel" value={searchPhone} onChange={(e) => setSearchPhone(e.target.value)} placeholder="رقم الجوال" className="flex-1 p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-indigo-500 font-bold outline-none" />
                  <button className="px-6 bg-indigo-600 text-white rounded-xl font-black">بحث</button>
                </form>
                <div className="space-y-3">
                  {searchResult?.map(a => (
                    <div key={a.id} className="p-4 bg-gray-50 rounded-xl flex justify-between items-center border border-gray-100">
                      <div>
                        <div className="font-black text-sm text-gray-900">{a.date}</div>
                        <div className="text-xs text-gray-500">{a.time}</div>
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black ${a.status === AppointmentStatus.CONFIRMED ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {a.status === AppointmentStatus.CONFIRMED ? 'مؤكد' : 'قيد المراجعة'}
                      </span>
                    </div>
                  ))}
                  {searchResult?.length === 0 && <p className="text-center text-gray-400 font-bold py-4">لا توجد حجوزات سابقة</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
