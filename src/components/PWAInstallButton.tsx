import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle, Share2, PlusSquare, Monitor, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { ZeroSoftLogo } from './ZeroSoftLogo';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showDesktopGuide, setShowDesktopGuide] = useState(false);

  // If already running as an installed standalone PWA, hide or show verified badge
  if (isInstalled) {
    return (
      <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
        <CheckCircle className="w-3.5 h-3.5" />
        <span>تطبيق مثبت (PWA)</span>
      </div>
    );
  }

  // Chromium / Android / Desktop flow with native prompt available
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-3.5 py-1.5 text-xs sm:text-sm font-semibold shadow-lg shadow-cyan-500/20 active:scale-95 transition-all duration-200 cursor-pointer"
        title="تثبيت ZeroSoft كتطبيق على الهاتف أو الحاسوب"
      >
        <Download className="w-4 h-4 animate-bounce" />
        <span>تثبيت التطبيق (PWA)</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 px-3 py-1.5 text-xs font-semibold shadow-sm transition-all cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>تثبيت على آيفون (iOS)</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-right animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">تثبيت تطبيق ZeroSoft</h3>
                  <Smartphone className="w-5 h-5 text-cyan-400" />
                </div>
              </div>

              {/* App icon preview */}
              <div className="my-4 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
                <ZeroSoftLogo size="md" showText={false} />
                <div>
                  <h4 className="text-sm font-bold text-white">ZeroSoft</h4>
                  <p className="text-[11px] text-cyan-400">أيقونة الشاشة الرئيسية</p>
                </div>
              </div>

              <div className="space-y-2.5 text-sm text-slate-300">
                <div className="flex items-center gap-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <p className="text-xs">1. اضغط على زر <strong>المشاركة (Share)</strong> في أسفل متصفح Safari.</p>
                </div>
                <div className="flex items-center gap-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <p className="text-xs">2. مرر للأسفل واختر <strong>إضافة إلى الشاشة الرئيسية (Add to Home Screen)</strong>.</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 py-2.5 text-sm font-bold text-white hover:from-cyan-500 hover:to-blue-500 transition shadow-lg shadow-cyan-600/20 cursor-pointer"
              >
                فهمت، تم
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback desktop / standard browser button to show PWA shortcut modal
  return (
    <>
      <button
        onClick={() => setShowDesktopGuide(true)}
        className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-slate-800/80 hover:bg-slate-700 text-cyan-300 px-3 py-1.5 text-xs font-semibold shadow-sm transition cursor-pointer"
        title="تثبيت اختصار التطبيق (PWA Shortcut)"
      >
        <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
        <span>تثبيت كـ تطبيق (PWA)</span>
      </button>

      {showDesktopGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-right animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <button
                onClick={() => setShowDesktopGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">تثبيت اختصار تطبيق ZeroSoft</h3>
                <Monitor className="w-5 h-5 text-cyan-400" />
              </div>
            </div>

            {/* App icon preview */}
            <div className="my-4 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ZeroSoftLogo size="md" showText={true} subtitle="أيقونة الاختصار الرسمية المعتمدة" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span>جاهز للتحميل</span>
              </span>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  1
                </div>
                <div>
                  <strong className="text-white block mb-0.5">على متصفحات الحاسوب (Chrome / Edge):</strong>
                  ستجد أيقونة تثبيت صغيرة (شاشة مع سهم لأسفل) في شريط العنوان بالأعلى، أو اضغط على قائمة المتصفح (⋮) ثم اختر <span className="text-cyan-300 font-bold">"تثبيت ZeroSoft"</span>.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  2
                </div>
                <div>
                  <strong className="text-white block mb-0.5">على هواتف أندرويد وآيفون:</strong>
                  اضغط على خيارات المتصفح (⋮ أو زر المشاركة) ثم اختر <span className="text-emerald-300 font-bold">"إضافة إلى الشاشة الرئيسية (Add to Home screen)"</span>.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowDesktopGuide(false)}
              className="mt-5 w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 py-2.5 text-sm font-bold text-white hover:from-cyan-500 hover:to-blue-500 transition shadow-lg shadow-cyan-600/20 cursor-pointer"
            >
              حسناً، فهمت
            </button>
          </div>
        </div>
      )}
    </>
  );
};
