import React, { useState, useEffect } from 'react';
import { Calculator, X, Sparkles, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateEmployeeHourlyRate, calculateOvertimeRate, calculateOvertimeTotal, formatMoney } from '../utils/calculations';
import { ZeroSoftLogo } from './ZeroSoftLogo';

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAndRecord?: (empId: string, hours: number) => void;
}

export const CalculatorModal: React.FC<CalculatorModalProps> = ({ isOpen, onClose, onSelectAndRecord }) => {
  const { employees, settings } = useApp();

  const [mode, setMode] = useState<'employee' | 'custom'>('employee');
  const [selectedEmpId, setSelectedEmpId] = useState<string>(employees[0]?.id || '');
  
  // Custom inputs
  const [customSalary, setCustomSalary] = useState<number>(600);
  const [customDays, setCustomDays] = useState<number>(26);
  const [customDailyHours, setCustomDailyHours] = useState<number>(8);
  
  // Overtime inputs
  const [hours, setHours] = useState<number>(3);
  const [multiplier, setMultiplier] = useState<number>(1.5); // 1.5 default

  useEffect(() => {
    if (employees.length > 0 && (!selectedEmpId || !employees.some((e) => e.id === selectedEmpId))) {
      setSelectedEmpId(employees[0].id);
    }
  }, [employees, selectedEmpId]);

  const selectedEmployee = employees.find((e) => e.id === selectedEmpId);

  // Computed rates
  let baseHourlyRate = 0;
  let employeeName = '';

  if (mode === 'employee' && selectedEmployee) {
    baseHourlyRate = calculateEmployeeHourlyRate(
      selectedEmployee.monthlySalary,
      selectedEmployee.monthlyWorkingDays,
      selectedEmployee.dailyWorkHours
    );
    employeeName = selectedEmployee.name;
  } else {
    baseHourlyRate = calculateEmployeeHourlyRate(customSalary, customDays, customDailyHours);
    employeeName = 'حساب مخصص';
  }

  const overtimeHourlyRate = calculateOvertimeRate(baseHourlyRate, multiplier);
  const totalOvertimeAmount = calculateOvertimeTotal(hours, baseHourlyRate, multiplier);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-700 p-6 sm:p-7 shadow-2xl text-right max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <ZeroSoftLogo size="sm" showText={false} />
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
                <Calculator className="w-5 h-5 text-cyan-400" />
                <span>حاسبة الساعات الإضافية التفاعلية</span>
              </h3>
              <p className="text-xs text-cyan-400/90 font-medium">معادلة الاحتساب: ساعة ونص (1.5×) من أصل أجر الساعة</p>
            </div>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="mt-5 grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setMode('employee')}
            className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              mode === 'employee'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            اختيار موظف مسجل
          </button>
          <button
            type="button"
            onClick={() => setMode('custom')}
            className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              mode === 'custom'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            إدخال راتب وساعات حرة
          </button>
        </div>

        {/* Dynamic Inputs */}
        <div className="mt-5 space-y-4">
          {mode === 'employee' ? (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                اختر الموظف
              </label>
              <select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-sm text-white focus:border-cyan-500 outline-none"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} — {emp.jobTitle} (الراتب: {emp.monthlySalary} {settings.currency})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">الراتب الشهري ({settings.currency})</label>
                <input
                  type="number"
                  min="1"
                  value={customSalary}
                  onChange={(e) => setCustomSalary(Number(e.target.value))}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">أيام العمل بالشهـر</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={customDays}
                  onChange={(e) => setCustomDays(Number(e.target.value))}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">ساعات الدوام اليومي</label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={customDailyHours}
                  onChange={(e) => setCustomDailyHours(Number(e.target.value))}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none font-mono"
                />
              </div>
            </div>
          )}

          {/* Overtime Hours & Multiplier */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                عدد الساعات الإضافية
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={hours}
                onChange={(e) => setHours(Math.max(0.1, Number(e.target.value)))}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2 text-sm text-white focus:border-cyan-500 outline-none font-mono text-center text-lg font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300">
                  معامل الاحتساب
                </label>
                <span className="text-[11px] font-mono text-cyan-400 font-bold">
                  {multiplier}×
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
                <button
                  type="button"
                  onClick={() => setMultiplier(1.0)}
                  className={`py-1.5 rounded-lg text-xs font-bold transition ${
                    multiplier === 1.0 ? 'bg-cyan-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  1.0× (ساعة)
                </button>
                <button
                  type="button"
                  onClick={() => setMultiplier(settings.defaultMultiplier || 1.5)}
                  className={`py-1.5 rounded-lg text-xs font-bold transition ${
                    multiplier === (settings.defaultMultiplier || 1.5) ? 'bg-cyan-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {settings.defaultMultiplier || 1.5}× (عادي)
                </button>
                <button
                  type="button"
                  onClick={() => setMultiplier(settings.holidayMultiplier || 2.0)}
                  className={`py-1.5 rounded-lg text-xs font-bold transition ${
                    multiplier === (settings.holidayMultiplier || 2.0) ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {settings.holidayMultiplier || 2.0}× (عطلة)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mathematical Breakdown Visual Card */}
        <div className="mt-6 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-cyan-500/30 p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-300 pb-2 border-b border-slate-800">
            <span>سعر الساعة العادية (الأساسية):</span>
            <span className="font-mono font-bold text-slate-200">
              {formatMoney(baseHourlyRate, settings.currency)} / ساعة
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-cyan-300 pb-2 border-b border-slate-800">
            <span className="flex items-center gap-1 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>سعر الساعة الإضافية ({multiplier}×):</span>
            </span>
            <span className="font-mono font-bold text-cyan-400 text-sm">
              {formatMoney(overtimeHourlyRate, settings.currency)} / ساعة
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div>
              <span className="text-xs text-slate-400 block">إجمالي المستحق ({hours} ساعة × {multiplier}×):</span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight">
                {formatMoney(totalOvertimeAmount, settings.currency)}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-black font-mono text-base shadow-inner tracking-wider">
              JD
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 flex items-center justify-end gap-3">
          {mode === 'employee' && onSelectAndRecord && selectedEmployee && (
            <button
              type="button"
              onClick={() => {
                onSelectAndRecord(selectedEmpId, hours);
                onClose();
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 active:scale-95 transition cursor-pointer"
            >
              <span>تسجيل الساعات الإضافية مباشرة في الكشف</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-sm transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
