import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  X, 
  Download, 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle2, 
  ArrowUpDown, 
  Sparkles,
  Filter
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { exportMonthlyPayrollCSV } from '../utils/exportHelpers';
import { formatMoney } from '../utils/calculations';
import { ZeroSoftLogo } from './ZeroSoftLogo';

interface MonthlyPayrollExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MonthlyPayrollExportModal: React.FC<MonthlyPayrollExportModalProps> = ({ isOpen, onClose }) => {
  const { employees, overtimeRecords, settings, showToast } = useApp();

  // Selected Month: default current YYYY-MM e.g. 2026-10
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [sortField, setSortField] = useState<'hours' | 'amount' | 'net' | 'name'>('hours');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  if (!isOpen) return null;

  // Extract unique departments
  const departments = Array.from(new Set(employees.map((e) => e.department).filter(Boolean)));

  // Filter records for the month
  const filteredRecords = (selectedMonth === 'all'
    ? overtimeRecords
    : overtimeRecords.filter((r) => r.date && r.date.startsWith(selectedMonth))
  ).sort((a, b) => a.date.localeCompare(b.date)); // Chronologically sorted

  // Compute aggregated items per employee
  const payrollItems = employees
    .filter((emp) => selectedDept === 'all' || emp.department === selectedDept)
    .map((emp) => {
      const empRecords = filteredRecords
        .filter((r) => r.employeeId === emp.id)
        .sort((a, b) => a.date.localeCompare(b.date)); // Sorted by date

      const totalHours = empRecords.reduce((sum, r) => sum + r.hours, 0);
      const totalAmount = empRecords.reduce((sum, r) => sum + r.totalAmount, 0);
      const hourly = emp.monthlySalary / ((emp.monthlyWorkingDays || 26) * (emp.dailyWorkHours || 8));
      const otHourly = hourly * (settings.defaultMultiplier || 1.5);
      const net = emp.monthlySalary + totalAmount;
      const sortedDates = Array.from(new Set(empRecords.map((r) => r.date))).sort();

      return {
        id: emp.id,
        name: emp.name,
        jobTitle: emp.jobTitle,
        department: emp.department,
        monthlySalary: emp.monthlySalary,
        baseHourlyRate: hourly,
        overtimeHourlyRate: otHourly,
        totalHours: parseFloat(totalHours.toFixed(1)),
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        netSalary: parseFloat(net.toFixed(2)),
        count: empRecords.length,
        dates: sortedDates,
      };
    });

  // Sort payroll items
  payrollItems.sort((a, b) => {
    let diff = 0;
    if (sortField === 'hours') diff = b.totalHours - a.totalHours;
    else if (sortField === 'amount') diff = b.totalAmount - a.totalAmount;
    else if (sortField === 'net') diff = b.netSalary - a.netSalary;
    else if (sortField === 'name') return a.name.localeCompare(b.name, 'ar');
    return sortAsc ? -diff : diff;
  });

  // KPI Calculations
  const totalBase = payrollItems.reduce((acc, i) => acc + i.monthlySalary, 0);
  const totalOtHours = payrollItems.reduce((acc, i) => acc + i.totalHours, 0);
  const totalOtPayout = payrollItems.reduce((acc, i) => acc + i.totalAmount, 0);
  const grandNet = payrollItems.reduce((acc, i) => acc + i.netSalary, 0);

  const handleExportCSV = () => {
    exportMonthlyPayrollCSV({
      monthStr: selectedMonth,
      employees,
      overtimeRecords,
      currency: settings.currency,
      companyName: settings.companyName,
    });
    showToast(`تم تصدير كشف مسير الرواتب الشهري (${selectedMonth}) بصيغة CSV بنجاح`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-5 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-5xl rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ZeroSoftLogo size="sm" showText={false} />
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div className="text-right">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span>كشف مسير الرواتب الشهري وحساب مستحقات الإضافي (CSV)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Excel / CSV
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                تصدير تقرير تفصيلي مرتب حسب التاريخ يحسب إجمالي الساعات الإضافية ومستحقات ({settings.defaultMultiplier || 1.5}×) وصافي الراتب لكل موظف على حدة
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 sm:p-5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Month Picker */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300 font-semibold flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>الشهر المستهدف:</span>
              </span>
              <input
                type="month"
                value={selectedMonth === 'all' ? '' : selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value || 'all')}
                className="rounded-xl bg-slate-800 border border-slate-700 focus:border-cyan-500 px-3 py-1.5 text-xs text-white font-mono outline-none"
              />
              <button
                type="button"
                onClick={() => setSelectedMonth('all')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                  selectedMonth === 'all'
                    ? 'bg-cyan-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                كافة الأشهر
              </button>
            </div>

            {/* Department Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300 font-semibold flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-blue-400" />
                <span>القسم:</span>
              </span>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="rounded-xl bg-slate-800 border border-slate-700 focus:border-cyan-500 px-3 py-1.5 text-xs text-white outline-none"
              >
                <option value="all">جميع الأقسام</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Export Action Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/25 active:scale-95 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>تنزيل كشف الرواتب (CSV / Excel)</span>
          </button>
        </div>

        {/* Real-time KPI Summary Grid */}
        <div className="p-4 sm:p-5 bg-slate-950/60 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-right">
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-medium">إجمالي الرواتب الأساسية</span>
            <span className="font-mono text-lg sm:text-xl font-bold text-white">
              {formatMoney(totalBase, settings.currency)}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-medium">ساعات الإضافي المحسوبة</span>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-lg sm:text-xl font-bold text-cyan-400">
                {totalOtHours.toFixed(1)}
              </span>
              <span className="text-xs text-slate-400">ساعة</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-medium">مستحقات الإضافي ({settings.defaultMultiplier || 1.5}×)</span>
            <span className="font-mono text-lg sm:text-xl font-bold text-emerald-400">
              {formatMoney(totalOtPayout, settings.currency)}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/40">
            <span className="text-[11px] text-indigo-300 block font-medium">صافي الرواتب الشاملة</span>
            <span className="font-mono text-lg sm:text-xl font-black text-cyan-300">
              {formatMoney(grandNet, settings.currency)}
            </span>
          </div>
        </div>

        {/* Live Table Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              معاينة الكشف للموظفين ({payrollItems.length} موظف) مرتبة حسب الساعات وقيمة الاستحقاق:
            </span>
            <span className="text-[11px] text-cyan-400 font-mono">
              معامل الاحتساب المعتمد: {settings.defaultMultiplier || 1.5}× أجر الساعة
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 shadow-md">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
                  <th className="py-3 px-3">#</th>
                  <th className="py-3 px-3">اسم الموظف</th>
                  <th className="py-3 px-3">المسمى والقسم</th>
                  <th className="py-3 px-3">الراتب الأساسي</th>
                  <th className="py-3 px-3">أجر الساعة</th>
                  <th className="py-3 px-3 text-center">الساعات الإضافية</th>
                  <th className="py-3 px-3">استحقاق الإضافي ({settings.defaultMultiplier || 1.5}×)</th>
                  <th className="py-3 px-3 font-bold text-white">صافي الراتب المستحق</th>
                  <th className="py-3 px-3">تواريخ الإضافي (مرتبة زمنياً)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                {payrollItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-800/50 transition">
                    <td className="py-3 px-3 font-mono text-slate-500 text-center">{idx + 1}</td>
                    <td className="py-3 px-3 font-bold text-white">
                      <span>{item.name}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      <div>{item.jobTitle}</div>
                      <span className="text-[10px] text-slate-500">{item.department}</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300">
                      {formatMoney(item.monthlySalary, settings.currency)}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">
                      <div>{formatMoney(item.baseHourlyRate, settings.currency)}/س</div>
                      <span className="text-cyan-400 text-[10px]">
                        ({settings.defaultMultiplier || 1.5}×: {formatMoney(item.overtimeHourlyRate, settings.currency)})
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`font-mono font-bold px-2.5 py-1 rounded-xl text-xs ${
                          item.totalHours > 0
                            ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                            : 'text-slate-500 bg-slate-800/40'
                        }`}
                      >
                        {item.totalHours} س
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                      {formatMoney(item.totalAmount, settings.currency)}
                    </td>
                    <td className="py-3 px-3 font-mono font-black text-cyan-300 text-sm">
                      {formatMoney(item.netSalary, settings.currency)}
                    </td>
                    <td className="py-3 px-3 text-[11px] font-mono text-slate-400 max-w-xs">
                      {item.dates.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {item.dates.map((d) => (
                            <span key={d} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                              {d}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-600">لا يوجد إضافي هذا الشهر</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-950 font-black text-slate-200 border-t-2 border-slate-700">
                  <td colSpan={3} className="py-3 px-3 text-left">
                    المجموع الكلي:
                  </td>
                  <td className="py-3 px-3 font-mono text-white">
                    {formatMoney(totalBase, settings.currency)}
                  </td>
                  <td className="py-3 px-3"></td>
                  <td className="py-3 px-3 font-mono text-center text-cyan-400">
                    {totalOtHours.toFixed(1)} س
                  </td>
                  <td className="py-3 px-3 font-mono text-emerald-400">
                    {formatMoney(totalOtPayout, settings.currency)}
                  </td>
                  <td className="py-3 px-3 font-mono text-cyan-300 text-sm">
                    {formatMoney(grandNet, settings.currency)}
                  </td>
                  <td className="py-3 px-3 text-[10px] text-slate-400">
                    {filteredRecords.length} سجل إضافي معتمد
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>ملف CSV مدعوم بترميز UTF-8 BOM لفتح الحروف العربية بشكل سليم على جميع إصدارات Excel.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
            >
              إغلاق
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/25 active:scale-95 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>تصدير CSV الآن</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
