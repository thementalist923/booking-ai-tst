
import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, CalendarCheck, Zap, UserPlus } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">N</div>
          <span className="text-2xl font-bold text-gray-900">نظام</span>
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="px-5 py-2 text-gray-600 hover:text-indigo-600 font-medium">دخول</Link>
          <button className="px-5 py-2 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-colors">ابدأ الآن</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
          نظم مواعيدك <br /> <span className="text-indigo-600">بكل سهولة واحترافية</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          المنصة المتكاملة لإدارة الحجوزات، العملاء، والعمليات التجارية. ابدأ فترة تجربتك المجانية اليوم.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link to="/login" className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-lg font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
            سجل كصاحب عمل
          </Link>
          <button className="px-8 py-4 bg-white border-2 border-gray-100 text-gray-800 rounded-2xl text-lg font-bold hover:border-indigo-100 transition-all">
            تواصل معنا
          </button>
        </div>
        <div className="mt-16 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10"></div>
          <img src="https://picsum.photos/1200/600" alt="Dashboard Preview" className="rounded-3xl shadow-2xl border border-gray-100 mx-auto" />
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <CalendarCheck size={28} />
              </div>
              <h3 className="text-xl font-bold mb-4">تنظيم المواعيد</h3>
              <p className="text-gray-600 leading-relaxed">إدارة شاملة لجدولك اليومي مع إمكانية تأكيد أو رفض الحجوزات بضغطة زر.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-xl font-bold mb-4">ملفات العملاء</h3>
              <p className="text-gray-600 leading-relaxed">قاعدة بيانات متكاملة لكل عميل تشمل الاسم، الهاتف، وملاحظات الزيارات السابقة.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
                <Zap size={28} />
              </div>
              <h3 className="text-xl font-bold mb-4">صفحة حجز عامة</h3>
              <p className="text-gray-600 leading-relaxed">رابط خاص لكل مشترك يمكن لعملائه من خلاله طلب المواعيد ومعرفة حالة حجزهم.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
