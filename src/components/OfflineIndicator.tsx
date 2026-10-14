import React, { useState } from 'react';
import { WifiOff, CheckCircle2, X } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [dismissed, setDismissed] = useState(false);

  if (isOnline || dismissed) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-4 right-4 sm:right-auto sm:left-4 z-50 flex items-center justify-between gap-3 rounded-2xl bg-slate-900/95 backdrop-blur-xl px-4 py-2.5 text-xs font-semibold text-white shadow-2xl border border-amber-500/50 animate-in slide-in-from-bottom-2 duration-300 max-w-sm">
      <div className="flex items-center gap-2.5 text-right">
        <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
          <WifiOff className="w-4 h-4 animate-pulse" />
        </div>
        <div>
          <span className="block font-bold text-amber-300">وضع عدم الاتصال (Offline)</span>
          <span className="text-[11px] text-slate-300">البرنامج يعمل بالكامل ويحفظ البيانات محلياً.</span>
        </div>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        title="إغلاق التنبيه"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
