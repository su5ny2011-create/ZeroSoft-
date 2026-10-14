import React, { useState, useRef, useEffect } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  ShieldCheck, 
  FileJson, 
  Users, 
  CalendarClock, 
  Settings, 
  CheckCircle2, 
  AlertTriangle,
  Save,
  Phone,
  Lock,
  MessageSquare,
  ImageIcon,
  Smartphone,
  Sparkles,
  UploadCloud,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BackupData } from '../types';
import { downloadBackupFile } from '../utils/exportHelpers';
import { ConfirmModal } from './ConfirmModal';
import { ZeroSoftLogo } from './ZeroSoftLogo';

export const BackupView: React.FC = () => {
  const { 
    employees, 
    overtimeRecords, 
    users, 
    settings, 
    updateSettings, 
    resetToDefaultData, 
    importBackupData,
    showToast 
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedBackup, setParsedBackup] = useState<BackupData | null>(null);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('replace');
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [importConfirmOpen, setImportConfirmOpen] = useState(false);

  // Settings form state
  const [companyName, setCompanyName] = useState(settings.companyName);
  const [currency, setCurrency] = useState(settings.currency);
  const [defaultDailyHours, setDefaultDailyHours] = useState(settings.defaultDailyHours);
  const [defaultMonthlyDays, setDefaultMonthlyDays] = useState(settings.defaultMonthlyDays);
  const [supportPhone, setSupportPhone] = useState(settings.supportPhone);
  const [defaultMultiplier, setDefaultMultiplier] = useState(settings.defaultMultiplier || 1.5);
  const [holidayMultiplier, setHolidayMultiplier] = useState(settings.holidayMultiplier || 2.0);
  const [customLogo, setCustomLogo] = useState<string>(settings.customLogo || '');
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCompanyName(settings.companyName);
    setCurrency(settings.currency);
    setDefaultDailyHours(settings.defaultDailyHours);
    setDefaultMonthlyDays(settings.defaultMonthlyDays);
    setSupportPhone(settings.supportPhone);
    setDefaultMultiplier(settings.defaultMultiplier || 1.5);
    setHolidayMultiplier(settings.holidayMultiplier || 2.0);
    setCustomLogo(settings.customLogo || '');
  }, [settings]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('حجم ملف الصورة يجب أن يكون أقل من 2 ميغابايت', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      setCustomLogo(dataUrl);
      updateSettings({ customLogo: dataUrl });
      showToast('تم اعتماد وتحديث شعار البرنامج بنجاح', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleResetLogo = () => {
    setCustomLogo('');
    updateSettings({ customLogo: undefined });
    showToast('تمت استعادة الشعار الرسمي الافتراضي لمنظومة ZeroSoft', 'success');
  };

  const handleExportBackup = () => {
    const backup: BackupData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      settings,
      users,
      employees,
      overtimeRecords,
    };
    downloadBackupFile(backup);
    showToast('تم تحميل ملف النسخة الاحتياطية بنجاح', 'success');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const json = JSON.parse(text);

        if (!json.employees || !json.overtimeRecords) {
          showToast('الملف المختار ليس ملف نسخة احتياطية صالح لـ ZeroSoft', 'error');
          return;
        }

        setParsedBackup(json as BackupData);
      } catch {
        showToast('فشل في قراءة ملف النسخة الاحتياطية (تأكد أنه ملف JSON صالح)', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleTriggerImport = () => {
    if (!parsedBackup) return;
    setImportConfirmOpen(true);
  };

  const executeImport = () => {
    if (parsedBackup) {
      importBackupData(parsedBackup, importMode);
      setParsedBackup(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
    setImportConfirmOpen(false);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      companyName: 'ZeroSoft',
      currency: currency.trim(),
      defaultDailyHours,
      defaultMonthlyDays,
      supportPhone: '00962790797342',
      defaultMultiplier,
      holidayMultiplier,
      customLogo: customLogo || undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Database className="w-6 h-6 text-cyan-400" />
            <span>سحب واستيراد النسخ الاحتياطية وإعدادات النظام</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            حفظ واستعادة كافة بيانات الموظفين وسجلات الإضافي والمستخدمين بأمان بضغطة زر
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Export & Import Cards */}
        <div className="lg:col-span-7 space-y-6">
          {/* Export Card */}
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Download className="w-5 h-5" />
              </div>
              <div className="text-right">
                <h3 className="text-base font-bold text-white">سحب نسخة احتياطية كاملة (Backup)</h3>
                <p className="text-xs text-slate-400">تنزيل ملف JSON آمن يحتوي على كافة بيانات النظام الحالية</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-center text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">الموظفون</span>
                <span className="font-mono font-bold text-white text-sm">{employees.length}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">سجلات الإضافي</span>
                <span className="font-mono font-bold text-cyan-400 text-sm">{overtimeRecords.length}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">المستخدمون</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">{users.length}</span>
              </div>
            </div>

            <button
              onClick={handleExportBackup}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 active:scale-95 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>تحميل وتنزيل النسخة الاحتياطية الآن</span>
            </button>
          </div>

          {/* Import Card */}
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <div className="text-right">
                <h3 className="text-base font-bold text-white">استيراد نسخة احتياطية سابقة</h3>
                <p className="text-xs text-slate-400">رفع واستعادة البيانات من ملف نسخة احتياطية (.json)</p>
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />

            {!parsedBackup ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-8 border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-2xl bg-slate-950/50 hover:bg-slate-950/80 flex flex-col items-center justify-center gap-2 transition cursor-pointer"
              >
                <FileJson className="w-8 h-8 text-cyan-400" />
                <span className="text-xs font-bold text-white">اضغط لاختيار ملف النسخة الاحتياطية (.json)</span>
                <span className="text-[11px] text-slate-500">سيتم فحص الملف ومعاينته قبل تأكيد الاسترجاع</span>
              </button>
            ) : (
              <div className="space-y-3 p-4 rounded-2xl bg-slate-950 border border-cyan-500/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تم فحص الملف بنجاح</span>
                  </div>
                  <button
                    onClick={() => setParsedBackup(null)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    إلغاء الملف
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-slate-900">
                    <span className="text-slate-400 block text-[10px]">الموظفون</span>
                    <span className="font-mono font-bold text-white">{parsedBackup.employees?.length || 0}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900">
                    <span className="text-slate-400 block text-[10px]">سجلات الإضافي</span>
                    <span className="font-mono font-bold text-cyan-400">{parsedBackup.overtimeRecords?.length || 0}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900">
                    <span className="text-slate-400 block text-[10px]">تاريخ النسخة</span>
                    <span className="font-mono text-emerald-400 text-[10px]">{parsedBackup.exportedAt?.slice(0, 10) || 'غير محدد'}</span>
                  </div>
                </div>

                {/* Import Mode Radio */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <span className="text-xs font-semibold text-slate-300 block">طريقة الاستعادة:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setImportMode('replace')}
                      className={`p-2.5 rounded-xl text-xs font-bold transition text-right ${
                        importMode === 'replace'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      <span>استبدال شامل (مسح الحالي)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImportMode('merge')}
                      className={`p-2.5 rounded-xl text-xs font-bold transition text-right ${
                        importMode === 'merge'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      <span>دمج مع البيانات الحالية</span>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleTriggerImport}
                  className="w-full mt-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition cursor-pointer"
                >
                  تأكيد استيراد واستعادة البيانات
                </button>
              </div>
            )}
          </div>

          {/* Reset Demo Data Card */}
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl flex items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-amber-400" />
                <span>إعادة ضبط البيانات التجريبية الافتراضية</span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                استعادة الموظفين وسجلات الإضافي النموذجية مع بقاء حساب admin
              </p>
            </div>
            <button
              onClick={() => setResetConfirmOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition cursor-pointer"
            >
              استعادة الافتراضي
            </button>
          </div>
        </div>

        {/* Right Column: System Settings */}
        <div className="lg:col-span-5">
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Settings className="w-5 h-5" />
              </div>
              <div className="text-right">
                <h3 className="text-base font-bold text-white">إعدادات النظام والشركة</h3>
                <p className="text-xs text-slate-400">تخصيص اسم الشركة، العملة، ورقم الدعم</p>
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              {/* Program Name & Logo - Fixed & Protected */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>إسم وشعار البرنامج (ZeroSoft)</span>
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                    هوية المنظومة المعتمدة
                  </span>
                </div>

                {/* Logo and Name Visual Card */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-700/80">
                  <div className="flex items-center gap-3">
                    <ZeroSoftLogo size="md" showText={true} />
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="file" 
                      ref={logoFileInputRef}
                      onChange={handleLogoUpload}
                      accept="image/*"
                      className="hidden" 
                    />
                    <button
                      type="button"
                      onClick={() => logoFileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition cursor-pointer"
                      title="رفع شعار مخصص للبرنامج"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>تغيير الشعار</span>
                    </button>
                    {customLogo && (
                      <button
                        type="button"
                        onClick={handleResetLogo}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                        title="استعادة الشعار الرسمي الافتراضي"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* PWA Shortcut Indicator Badge */}
                <div className="flex items-start gap-2 p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-300">
                  <Smartphone className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-relaxed text-slate-300">
                    <span className="font-bold text-cyan-300">أيقونة اختصار التطبيق (PWA Shortcut):</span> هذا الشعار يظهر كأيقونة رئيسية للتطبيق عند التثبيت على الهاتف أو شاشة سطح المكتب عبر <span className="font-mono text-cyan-300 font-bold">Add to Home Screen / PWA</span>.
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value="ZeroSoft"
                    readOnly
                    disabled
                    className="w-full rounded-xl bg-slate-950/90 border border-slate-800 px-3.5 py-2 text-sm text-cyan-300 font-extrabold cursor-not-allowed select-none shadow-inner"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-slate-400">
                    <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">اسم النظام ثابت</span>
                    <Lock className="w-4 h-4 text-amber-400/90" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">العملة الرسمية للنظام</label>
                  <input
                    type="text"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    placeholder="دينار أردني"
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3.5 py-2.5 text-sm text-white focus:border-cyan-500 outline-none"
                  />
                  <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setCurrency('JD')}
                      className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold font-mono transition cursor-pointer ${
                        currency === 'JD'
                          ? 'bg-cyan-500 text-white shadow-sm'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      JD (افتراضي)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrency('دينار أردني')}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                        currency === 'دينار أردني'
                          ? 'bg-cyan-500 text-white shadow-sm'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      دينار أردني
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrency('د.أ')}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                        currency === 'د.أ'
                          ? 'bg-cyan-500 text-white shadow-sm'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      د.أ
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">أيام الدوام الشهري</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={defaultMonthlyDays}
                    onChange={(e) => setDefaultMonthlyDays(Number(e.target.value))}
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3.5 py-2.5 text-sm text-white font-mono focus:border-cyan-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">ساعات الدوام اليومي الافتراضية</label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={defaultDailyHours}
                  onChange={(e) => setDefaultDailyHours(Number(e.target.value))}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3.5 py-2.5 text-sm text-white font-mono focus:border-cyan-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">معامل الساعة الإضافية (عادي)</label>
                  <input
                    type="number"
                    step="0.25"
                    min="0.5"
                    max="5"
                    value={defaultMultiplier}
                    onChange={(e) => setDefaultMultiplier(Number(e.target.value))}
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3.5 py-2.5 text-sm text-white font-mono font-bold text-center text-cyan-400 focus:border-cyan-500 outline-none"
                  />
                  <span className="text-[10px] text-slate-500 block">1.0× أو 1.5× أو 2.0×</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">معامل يوم الإجازة والعطل</label>
                  <input
                    type="number"
                    step="0.25"
                    min="1"
                    max="6"
                    value={holidayMultiplier}
                    onChange={(e) => setHolidayMultiplier(Number(e.target.value))}
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3.5 py-2.5 text-sm text-white font-mono font-bold text-center text-amber-400 focus:border-cyan-500 outline-none"
                  />
                  <span className="text-[10px] text-slate-500 block">2.0× أو 1.5× أو 2.5×</span>
                </div>
              </div>

              {/* Contact Phone Number - Fixed & Locked for Communication */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-cyan-400" />
                    <span>رقم الهاتف للتواصل والدعم الفني (رقم ثابت)</span>
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    رقم تواصل ثابت
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value="00962790797342"
                    readOnly
                    disabled
                    className="w-full rounded-xl bg-slate-950/90 border border-slate-700/90 px-3.5 py-2.5 pl-10 text-sm text-white font-mono font-bold cursor-not-allowed select-none dir-ltr text-right shadow-inner"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-slate-400">
                    <Lock className="w-4 h-4 text-amber-400/90" />
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <a
                    href="tel:00962790797342"
                    className="px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Phone className="w-3.5 h-3.5 text-cyan-400" />
                    <span>اتصال هاتفي</span>
                  </a>
                  <a
                    href="https://wa.me/00962790797342"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>مراسلة واتساب</span>
                  </a>
                  <span className="text-[11px] text-slate-400 mr-1">
                    رقم الهاتف ثابت ومخصص للتواصل المباشر مع الدعم وإدارة المنظومة.
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 active:scale-95 transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>حفظ التعديلات في النظام</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Reset Default */}
      <ConfirmModal
        isOpen={resetConfirmOpen}
        title="تأكيد استعادة البيانات الافتراضية"
        message="هل أنت متأكد من استعادة البيانات النموذجية الافتراضية للنظام؟"
        confirmLabel="نعم، استعادة الافتراضي"
        cancelLabel="تراجع"
        isDestructive={false}
        onConfirm={() => {
          resetToDefaultData();
          setResetConfirmOpen(false);
        }}
        onCancel={() => setResetConfirmOpen(false)}
      />

      {/* Confirmation Modal for Import Backup */}
      <ConfirmModal
        isOpen={importConfirmOpen}
        title="تأكيد استعادة النسخة الاحتياطية"
        message={
          importMode === 'replace'
            ? 'تنبيه: سيتم استبدال البيانات الحالية بالكامل بالبيانات الموجودة في ملف النسخة الاحتياطية. هل تود المتابعة؟'
            : 'سيتم دمج بيانات ملف النسخة الاحتياطية مع البيانات الحالية في النظام. هل تود المتابعة؟'
        }
        confirmLabel="نعم، بدء الاستعادة"
        cancelLabel="إلغاء"
        isDestructive={importMode === 'replace'}
        onConfirm={executeImport}
        onCancel={() => setImportConfirmOpen(false)}
      />
    </div>
  );
};
