import React, { useState } from 'react';
import { 
  Sliders, 
  Sparkles, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  RefreshCw, 
  Save, 
  AlertTriangle, 
  HelpCircle, 
  Calculator, 
  ArrowRight, 
  Layers,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatMoney, calculateEmployeeHourlyRate, calculateOvertimeRate, calculateOvertimeTotal } from '../utils/calculations';
import { ConfirmModal } from './ConfirmModal';
import { OvertimeType } from '../types';
import { ZeroSoftLogo } from './ZeroSoftLogo';

interface OvertimeSettingsViewProps {
  onNavigateToOvertime?: () => void;
}

export const OvertimeSettingsView: React.FC<OvertimeSettingsViewProps> = ({
  onNavigateToOvertime,
}) => {
  const { 
    settings, 
    updateOvertimeRates, 
    recalculateAllOvertime, 
    overtimeRecords, 
    employees, 
    batchUpdateOvertimeMultiplier,
    showToast 
  } = useApp();

  // Multipliers local state
  const [regularMultiplier, setRegularMultiplier] = useState<number>(settings.defaultMultiplier || 1.5);
  const [holidayMultiplier, setHolidayMultiplier] = useState<number>(settings.holidayMultiplier || 2.0);

  // Simulation Employee Selection
  const [simEmployeeId, setSimEmployeeId] = useState<string>(employees[0]?.id || '');
  const [simSalary, setSimSalary] = useState<number>(600);
  const [simHours, setSimHours] = useState<number>(3);
  const [simUseCustom, setSimUseCustom] = useState<boolean>(false);

  // Confirm Modal state for full program update
  const [recalcConfirmOpen, setRecalcConfirmOpen] = useState(false);

  // Batch selection for records table
  const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>([]);
  const [batchActionMult, setBatchActionMult] = useState<number>(1.5);
  const [batchActionType, setBatchActionType] = useState<OvertimeType>('regular');

  // Multiplier options presets
  const regularPresets = [
    { label: 'ساعة بساعة (1.0×)', value: 1.0, desc: 'تساوي ساعة عمل عادية 100%' },
    { label: 'ساعة وربع (1.25×)', value: 1.25, desc: 'زيادة 25% عن الأجر العادي' },
    { label: 'ساعة ونصف (1.5×)', value: 1.5, desc: 'المعيار الشائع في قانون العمل 150%' },
    { label: 'ساعة و3/4 (1.75×)', value: 1.75, desc: 'زيادة 75% عن الأجر العادي' },
    { label: 'ساعتان (2.0×)', value: 2.0, desc: 'ضعف أجر الساعة العادية 200%' },
  ];

  const holidayPresets = [
    { label: 'ساعة ونصف (1.5×)', value: 1.5, desc: '150% من أجر الساعة' },
    { label: 'ساعة و3/4 (1.75×)', value: 1.75, desc: '175% من أجر الساعة' },
    { label: 'ساعتان (2.0×)', value: 2.0, desc: 'ضعف الأجر (قانون العمل الأردني للعطل والأعياد)' },
    { label: 'ساعتان ونصف (2.5×)', value: 2.5, desc: '250% للأعياد الدينية والوطنية الكبرى' },
    { label: 'ثلاث ساعات (3.0×)', value: 3.0, desc: 'ثلاثة أضعاف الأجر' },
  ];

  // Current simulation calculation
  const simEmp = employees.find((e) => e.id === simEmployeeId);
  const activeBaseRate = simUseCustom || !simEmp
    ? calculateEmployeeHourlyRate(simSalary, settings.defaultMonthlyDays || 26, settings.defaultDailyHours || 8)
    : calculateEmployeeHourlyRate(simEmp.monthlySalary, simEmp.monthlyWorkingDays, simEmp.dailyWorkHours);

  const regOtRate = calculateOvertimeRate(activeBaseRate, regularMultiplier);
  const holOtRate = calculateOvertimeRate(activeBaseRate, holidayMultiplier);

  const regTotalSim = calculateOvertimeTotal(simHours, activeBaseRate, regularMultiplier);
  const holTotalSim = calculateOvertimeTotal(simHours, activeBaseRate, holidayMultiplier);

  // Total current overtime vs projected
  const currentTotalAmount = overtimeRecords.reduce((sum, r) => sum + (r.totalAmount || 0), 0);
  const projectedTotalAmount = overtimeRecords.reduce((sum, r) => {
    const isHoliday = r.overtimeType === 'holiday' || (r.multiplier >= 2.0 && r.overtimeType !== 'regular');
    const mult = isHoliday ? holidayMultiplier : regularMultiplier;
    const base = r.baseHourlyRate || 3.5;
    return sum + (r.hours * base * mult);
  }, 0);

  // Save for future new records only
  const handleSaveForNewOnly = () => {
    updateOvertimeRates({
      defaultMultiplier: regularMultiplier,
      holidayMultiplier: holidayMultiplier,
      recalculateAll: false,
    });
  };

  // Save and recalculate all existing records across the app
  const handleConfirmFullRecalculation = () => {
    updateOvertimeRates({
      defaultMultiplier: regularMultiplier,
      holidayMultiplier: holidayMultiplier,
      recalculateAll: true,
    });
    setRecalcConfirmOpen(false);
  };

  // Toggle selection for all records
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRecordIds(overtimeRecords.map((r) => r.id));
    } else {
      setSelectedRecordIds([]);
    }
  };

  const handleToggleRecord = (id: string) => {
    setSelectedRecordIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleApplyBatchUpdate = () => {
    if (selectedRecordIds.length === 0) {
      showToast('يرجى تحديد سجل واحد على الأقل للتعديل الجماعي', 'error');
      return;
    }
    batchUpdateOvertimeMultiplier(selectedRecordIds, batchActionMult, batchActionType);
    setSelectedRecordIds([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <ZeroSoftLogo size="sm" showText={false} />
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 text-cyan-400 border border-cyan-500/30">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                تعديل وضبط معايير الساعات الإضافية
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                تحديد قيمة الساعة الإضافية العادية ويوم الإجازة، وتطبيق التعديل على كامل البرنامج والسجلات
              </p>
            </div>
          </div>
        </div>

        {onNavigateToOvertime && (
          <button
            onClick={onNavigateToOvertime}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition cursor-pointer"
          >
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>العودة لجدول الساعات الإضافية</span>
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
          </button>
        )}
      </div>

      {/* Main Multipliers Settings Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CARD 1: Regular Overtime Multiplier */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-5">
          <div className="flex items-start justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>معامل الساعة الإضافية العادية</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                    {regularMultiplier}×
                  </span>
                </h3>
                <span className="text-xs text-slate-400">
                  ساعات العمل بعد انتهاء الدوام الرسمي في أيام العمل الاعتيادية
                </span>
              </div>
            </div>
          </div>

          {/* Quick Select Presets */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              اختر قيمة الساعة الإضافية (ساعة بساعة أو ساعة ونص أو ساعتين):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {regularPresets.map((p) => {
                const isSelected = regularMultiplier === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setRegularMultiplier(p.value)}
                    className={`p-3 rounded-2xl text-right transition cursor-pointer border ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-500/50 text-white shadow-lg shadow-cyan-500/10'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">{p.label}</span>
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg ${isSelected ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        {p.value}×
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-1 leading-tight">
                      {p.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Manual / Custom Input */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">أو أدخل معاملاً مخصصاً للساعة الإضافية:</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setRegularMultiplier((prev) => Math.max(0.5, parseFloat((prev - 0.25).toFixed(2))))}
                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center transition"
                  title="إنقاص ربع ساعة"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => setRegularMultiplier((prev) => Math.min(5, parseFloat((prev + 0.25).toFixed(2))))}
                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center transition"
                  title="زيادة ربع ساعة"
                >
                  +
                </button>
              </div>
            </div>

            <div className="relative">
              <input
                type="number"
                step="0.05"
                min="0.5"
                max="5.0"
                value={regularMultiplier}
                onChange={(e) => setRegularMultiplier(Math.max(0.5, parseFloat(Number(e.target.value).toFixed(2))))}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-base font-mono font-bold text-cyan-400 text-center outline-none focus:border-cyan-500"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold">
                معامل الضرب (×)
              </span>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
              <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>
                المعادلة: أجر الساعة الإضافية = أجر الساعة العادية × {regularMultiplier}
              </span>
            </div>
          </div>
        </div>

        {/* CARD 2: Weekend & Holiday Multiplier */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-5">
          <div className="flex items-start justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>معامل ساعات يوم الإجازة والعطل الرسمية</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono font-bold">
                    {holidayMultiplier}×
                  </span>
                </h3>
                <span className="text-xs text-slate-400">
                  ساعات العمل في أيام العطل الأسبوعية والأعياد والإجازات الرسمية
                </span>
              </div>
            </div>
          </div>

          {/* Quick Select Presets */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              اختر معامل ساعات يوم الإجازة (ساعة ونص أو ساعتان أو ساعتان ونصف):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {holidayPresets.map((p) => {
                const isSelected = holidayMultiplier === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setHolidayMultiplier(p.value)}
                    className={`p-3 rounded-2xl text-right transition cursor-pointer border ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/50 text-white shadow-lg shadow-amber-500/10'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">{p.label}</span>
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg ${isSelected ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        {p.value}×
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-1 leading-tight">
                      {p.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Manual / Custom Input */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">أو أدخل معاملاً مخصصاً ليوم الإجازة:</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setHolidayMultiplier((prev) => Math.max(1.0, parseFloat((prev - 0.25).toFixed(2))))}
                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center transition"
                  title="إنقاص ربع ساعة"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => setHolidayMultiplier((prev) => Math.min(6, parseFloat((prev + 0.25).toFixed(2))))}
                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center transition"
                  title="زيادة ربع ساعة"
                >
                  +
                </button>
              </div>
            </div>

            <div className="relative">
              <input
                type="number"
                step="0.05"
                min="1.0"
                max="6.0"
                value={holidayMultiplier}
                onChange={(e) => setHolidayMultiplier(Math.max(1.0, parseFloat(Number(e.target.value).toFixed(2))))}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-base font-mono font-bold text-amber-400 text-center outline-none focus:border-amber-500"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold">
                معامل الضرب (×)
              </span>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
              <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                المعادلة: أجر ساعة يوم الإجازة = أجر الساعة العادية × {holidayMultiplier}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Decision Bar: Save for New vs Recalculate Entire App */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 p-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                تطبيق المعايير الجديدة
              </span>
              <h3 className="text-lg font-black text-white">
                كيف ترغب في تطبيق هذه المعايير في البرنامج؟
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              يمكنك اعتماد هذه المعايير (العادي: <strong className="text-cyan-400 font-mono">{regularMultiplier}×</strong> | العطل: <strong className="text-amber-400 font-mono">{holidayMultiplier}×</strong>) وتعديلها وإعادة احتسابها فوراً على <span className="underline decoration-indigo-400 font-bold text-white">كامل البرنامج وكافة سجلات الإضافي السابقة ({overtimeRecords.length} سجل)</span> أو اعتمادها للسجلات الجديدة فقط.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            {/* Save for new only */}
            <button
              type="button"
              onClick={handleSaveForNewOnly}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Save className="w-4 h-4 text-slate-400" />
              <span>حفظ للسجلات الجديدة فقط</span>
            </button>

            {/* Recalculate full program */}
            <button
              type="button"
              onClick={() => setRecalcConfirmOpen(true)}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-black shadow-xl shadow-cyan-500/25 active:scale-95 transition flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 animate-spin-reverse" />
              <span>تعديل وتطبيق على كامل البرنامج</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Interactive Sandbox / Calculator Preview */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              محاكي حي ومباشر للمقارنة بالدينار الأردني
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            معاينة فورية لتأثير المعاملات على استحقاق الموظفين
          </span>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">طريقة الحساب</label>
              <button
                type="button"
                onClick={() => setSimUseCustom(!simUseCustom)}
                className="text-[11px] text-cyan-400 hover:underline"
              >
                {simUseCustom ? 'اختيار من قائمة الموظفين' : 'إدخال راتب حر'}
              </button>
            </div>
            {simUseCustom ? (
              <input
                type="number"
                min="100"
                step="50"
                value={simSalary}
                onChange={(e) => setSimSalary(Number(e.target.value))}
                placeholder="الراتب الشهري"
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white font-mono outline-none"
              />
            ) : (
              <select
                value={simEmployeeId}
                onChange={(e) => setSimEmployeeId(e.target.value)}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white outline-none"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} — {emp.jobTitle} ({emp.monthlySalary} {settings.currency})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">سعر الساعة الأساسية للموظف</label>
            <div className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs font-mono font-bold text-slate-200">
              {formatMoney(activeBaseRate, settings.currency)} / ساعة
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">عدد ساعات التجربة</label>
            <input
              type="number"
              min="1"
              max="24"
              value={simHours}
              onChange={(e) => setSimHours(Math.max(1, Number(e.target.value)))}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white font-mono font-bold text-center outline-none"
            />
          </div>
        </div>

        {/* Live Comparison Result Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Regular Day Simulation */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/30 space-y-2">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
              <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>يوم عمل عادي (بمعامل {regularMultiplier}×)</span>
              </span>
              <span className="font-mono text-cyan-400 font-bold">
                {formatMoney(regOtRate, settings.currency)} / س
              </span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-[11px] text-slate-400 block">إجمالي استحقاق {simHours} ساعات إضافية:</span>
                <span className="text-xl sm:text-2xl font-black text-cyan-400 font-mono">
                  {formatMoney(regTotalSim, settings.currency)}
                </span>
              </div>
              <span className="text-[11px] font-bold px-2 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                {regularMultiplier}× الأجر
              </span>
            </div>
          </div>

          {/* Holiday Simulation */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>يوم إجازة / عطلة رسمية (بمعامل {holidayMultiplier}×)</span>
              </span>
              <span className="font-mono text-amber-400 font-bold">
                {formatMoney(holOtRate, settings.currency)} / س
              </span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-[11px] text-slate-400 block">إجمالي استحقاق {simHours} ساعات عطلة:</span>
                <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                  {formatMoney(holTotalSim, settings.currency)}
                </span>
              </div>
              <span className="text-[11px] font-bold px-2 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20">
                {holidayMultiplier}× الأجر
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Table: View and Batch Edit Specific Overtime Records */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>استعراض وتعديل سجلات الإضافي الحالية في البرنامج</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              يمكنك تعديل نوع أو معامل أي سجل بشكل فردي، أو تحديد سجلات وتطبيق معامل جماعي
            </p>
          </div>

          {/* Batch action controls */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 p-1 rounded-xl text-xs">
              <span className="text-slate-400 px-2">تطبيق على المحددة ({selectedRecordIds.length}):</span>
              <button
                type="button"
                onClick={() => { setBatchActionMult(1.0); setBatchActionType('regular'); }}
                className={`px-2 py-1 rounded-lg font-bold transition ${batchActionMult === 1.0 ? 'bg-cyan-500 text-white' : 'text-slate-400'}`}
              >
                1.0×
              </button>
              <button
                type="button"
                onClick={() => { setBatchActionMult(1.5); setBatchActionType('regular'); }}
                className={`px-2 py-1 rounded-lg font-bold transition ${batchActionMult === 1.5 ? 'bg-cyan-500 text-white' : 'text-slate-400'}`}
              >
                1.5×
              </button>
              <button
                type="button"
                onClick={() => { setBatchActionMult(2.0); setBatchActionType('holiday'); }}
                className={`px-2 py-1 rounded-lg font-bold transition ${batchActionMult === 2.0 ? 'bg-amber-500 text-white' : 'text-slate-400'}`}
              >
                2.0× عطلة
              </button>
            </div>

            <button
              type="button"
              disabled={selectedRecordIds.length === 0}
              onClick={handleApplyBatchUpdate}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedRecordIds.length > 0
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-md'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              تطبيق التعديل
            </button>
          </div>
        </div>

        {/* Records Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-3 text-center w-10">
                  <input
                    type="checkbox"
                    checked={selectedRecordIds.length > 0 && selectedRecordIds.length === overtimeRecords.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3">الموظف</th>
                <th className="py-3 px-3">التاريخ</th>
                <th className="py-3 px-3 text-center">الساعات</th>
                <th className="py-3 px-3">نوع الإضافي</th>
                <th className="py-3 px-3 text-center">المعامل الحالي</th>
                <th className="py-3 px-3">سعر الساعة</th>
                <th className="py-3 px-3">المستحق الإجمالي</th>
                <th className="py-3 px-3 text-left">تعديل سريع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {overtimeRecords.slice(0, 15).map((r) => {
                const isSelected = selectedRecordIds.includes(r.id);
                const isHol = r.overtimeType === 'holiday' || r.multiplier >= 2.0;

                return (
                  <tr key={r.id} className={`hover:bg-slate-800/40 transition ${isSelected ? 'bg-cyan-500/5' : ''}`}>
                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleRecord(r.id)}
                        className="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-0 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-white text-xs block">{r.employeeName}</span>
                      <span className="text-[10px] text-slate-400">{r.jobTitle}</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300">
                      {r.date}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-cyan-400">
                      {r.hours} س
                    </td>
                    <td className="py-3 px-3">
                      {isHol ? (
                        <span className="px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-[11px] inline-flex items-center gap-1">
                          <span>🏖️</span>
                          <span>يوم إجازة</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold text-[11px] inline-flex items-center gap-1">
                          <span>☀️</span>
                          <span>ساعة عادية</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold">
                      <span className="px-2 py-0.5 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                        {r.multiplier}×
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300">
                      {formatMoney(r.baseHourlyRate, settings.currency)}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                      {formatMoney(r.totalAmount, settings.currency)}
                    </td>
                    <td className="py-3 px-3 text-left">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => batchUpdateOvertimeMultiplier([r.id], 1.0, 'regular')}
                          title="تعديل لساعة بساعة (1×)"
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[10px] font-bold"
                        >
                          1×
                        </button>
                        <button
                          type="button"
                          onClick={() => batchUpdateOvertimeMultiplier([r.id], 1.5, 'regular')}
                          title="تعديل لساعة ونصف (1.5×)"
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[10px] font-bold"
                        >
                          1.5×
                        </button>
                        <button
                          type="button"
                          onClick={() => batchUpdateOvertimeMultiplier([r.id], 2.0, 'holiday')}
                          title="تعديل لساعتين إجازة (2×)"
                          className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-mono text-[10px] font-bold"
                        >
                          2×
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {overtimeRecords.length > 15 && (
            <p className="text-center text-xs text-slate-500 py-3">
              يتم عرض أول 15 سجلاً من أصل {overtimeRecords.length} سجل. يتم تطبيق إعادة الاحتساب الشاملة على كافة السجلات.
            </p>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Full Program Overtime Recalculation */}
      <ConfirmModal
        isOpen={recalcConfirmOpen}
        title="تأكيد تعديل وإعادة احتساب كامل البرنامج"
        message={`هل أنت متأكد من رغبتك في تطبيق المعايير الجديدة (الساعة العادية: ${regularMultiplier}× | يوم الإجازة: ${holidayMultiplier}×) وتعديل كافة سجلات الساعات الإضافية في البرنامج (${overtimeRecords.length} سجل)؟ سيتم تحديث جميع المبالغ المستحقة بالدينار الأردني فوراً.`}
        confirmLabel="نعم، حدّث كامل البرنامج الآن"
        cancelLabel="إلغاء والتراجع"
        isDestructive={false}
        onConfirm={handleConfirmFullRecalculation}
        onCancel={() => setRecalcConfirmOpen(false)}
      />
    </div>
  );
};
