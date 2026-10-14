import React, { useState } from 'react';
import { LogIn, User, Eye, EyeOff, Phone, MessageSquare, Clock, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PWAInstallButton } from './PWAInstallButton';
import { ZeroSoftLogo } from './ZeroSoftLogo';

export const LoginPage: React.FC = () => {
  const { login } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supportPhone = '00962790797342';
  const cleanPhone = supportPhone.replace(/[^0-9]/g, '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    setIsSubmitting(true);
    setTimeout(() => {
      login(username, password);
      setIsSubmitting(false);
    }, 250);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col justify-between p-4 sm:p-6 lg:p-8 text-slate-100 relative overflow-hidden">
      {/* Background glowing ambient orbs */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      
      {/* Top Header Bar with PWA install */}
      <header className="relative z-10 max-w-5xl w-full mx-auto flex items-center justify-between pb-4 border-b border-slate-800/80">
        <ZeroSoftLogo size="md" subtitle="نظام الساعات الإضافية الذكي" />

        <div className="flex items-center gap-2">
          <PWAInstallButton />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-5xl w-full mx-auto my-auto py-8 grid lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: System Highlights & Features */}
        <div className="lg:col-span-6 space-y-6 text-right order-2 lg:order-1">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>الإصدار المتكامل للشركات والمؤسسات 2026</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
            حساب وتسجيل الساعات الإضافية بدقة <span className="text-cyan-400">ساعة ونصف (1.5×)</span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            منظومة ZeroSoft توفر إدارة متكاملة لمواعيد دوام الموظفين، تحديد أجر الساعة العادية تلقائياً من الراتب، واحتساب مستحقات العمل الإضافي بمعدل 1.5× بنقرة زر مع دعم استخراج التقارير وسحب النسخ الاحتياطية.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm mb-1">
                <Clock className="w-4 h-4" />
                <span>حساب فوري 1.5×</span>
              </div>
              <p className="text-xs text-slate-400">احتساب فوري للأجر الإضافي بناءً على ساعات الدوام وسعر الساعة.</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>تصدير Excel & PDF</span>
              </div>
              <p className="text-xs text-slate-400">تصدير كشوفات الرواتب والإضافي وسندات الصرف بسهولة تامة.</p>
            </div>
          </div>

          {/* Prominent Support Phone Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/70 border border-cyan-500/30 shadow-xl">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/${cleanPhone}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>واتساب</span>
                </a>
                <a
                  href={`tel:${supportPhone}`}
                  className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-600/30 transition"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>اتصال</span>
                </a>
              </div>
              <div className="text-right">
                <span className="text-xs text-cyan-300 font-medium block">الدعم الفني والمساعدة المباشرة</span>
                <span className="font-mono text-base sm:text-lg font-bold text-white tracking-wider dir-ltr inline-block">
                  {supportPhone}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="lg:col-span-6 order-1 lg:order-2">
          <div className="relative rounded-3xl bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 p-6 sm:p-8 shadow-2xl shadow-indigo-950/50">
            {/* Top Phone Badge explicitly placed on login form */}
            <div className="mb-6 p-3 rounded-2xl bg-gradient-to-r from-cyan-950/60 to-slate-800/80 border border-cyan-500/40 flex items-center justify-between text-right">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <span className="text-[11px] text-slate-300 block">رقم الدعم والتفعيل السريع</span>
                <a
                  href={`tel:${supportPhone}`}
                  className="font-mono text-base font-extrabold text-cyan-400 hover:underline tracking-wider dir-ltr"
                >
                  {supportPhone}
                </a>
              </div>
            </div>

            <div className="text-center mb-6">
              <div className="flex justify-center mb-3">
                <ZeroSoftLogo size="lg" showText={false} />
              </div>
              <h3 className="text-2xl font-black text-white">تسجيل الدخول للنظام</h3>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                أدخل اسم المستخدم وكلمة المرور للدخول إلى ZeroSoft
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Input */}
              <div className="space-y-1.5 text-right">
                <label className="block text-xs font-semibold text-slate-300">
                  اسم المستخدم <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="أدخل اسم المستخدم (مثال: admin)"
                    className="w-full rounded-xl bg-slate-800/90 border border-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 px-4 py-3 pl-11 text-sm text-white placeholder-slate-500 transition outline-none text-right"
                  />
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5 text-right">
                <label className="block text-xs font-semibold text-slate-300">
                  كلمة المرور <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور (مثال: 12345)"
                    className="w-full rounded-xl bg-slate-800/90 border border-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 px-4 py-3 pl-11 text-sm text-white placeholder-slate-500 transition outline-none text-right font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition p-0.5"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-cyan-600/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <LogIn className="w-5 h-5" />
                <span>{isSubmitting ? 'جاري التحقق...' : 'دخول إلى البرنامج'}</span>
              </button>

              {/* Security notice & support */}
              <div className="pt-3 border-t border-slate-800 text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>دخول آمن ومشفر للنظام</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  في حال فقدان بيانات الدخول، يرجى التواصل مع إدارة النظام عبر رقم الدعم
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-5xl w-full mx-auto pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>برنامج ZeroSoft محمي ويعمل بكفاءة على المتصفح وتطبيقات الهواتف الذكية (PWA)</span>
        </div>
        <div className="flex items-center gap-4">
          <span>هاتف الدعم: <strong className="text-cyan-400 dir-ltr font-mono">{supportPhone}</strong></span>
          <span>© 2026 ZeroSoft</span>
        </div>
      </footer>
    </div>
  );
};
