import React, { useState } from 'react';
import { 
  CalendarClock, 
  PlusCircle, 
  Search, 
  Filter, 
  FileSpreadsheet, 
  Printer, 
  Trash2, 
  Edit, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  X, 
  FileText,
  User,
  ArrowUpDown,
  Sliders,
  Sun,
  Palmtree,
  MessageSquare
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OvertimeRecord, OvertimeStatus, OvertimeType } from '../types';
import { 
  calculateHoursBetween, 
  calculateEmployeeHourlyRate, 
  calculateOvertimeRate, 
  calculateOvertimeTotal, 
  formatMoney 
} from '../utils/calculations';
import { exportOvertimeToExcel } from '../utils/exportHelpers';
import { ConfirmModal } from './ConfirmModal';
import { ZeroSoftLogo } from './ZeroSoftLogo';

interface OvertimeViewProps {
  initialOpenAdd?: boolean;
  onPrintReport: () => void;
  onPrintSingleVoucher: (record: OvertimeRecord) => void;
  onOpenPayrollExport?: () => void;
  onNavigateToOvertimeSettings?: () => void;
}

export const OvertimeView: React.FC<OvertimeViewProps> = ({
  initialOpenAdd = false,
  onPrintReport,
  onPrintSingleVoucher,
  onOpenPayrollExport,
  onNavigateToOvertimeSettings,
}) => {
  const { employees, overtimeRecords, addOvertime, updateOvertime, deleteOvertime, settings, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [employeeFilter, setEmployeeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(initialOpenAdd);
  const [editingRecord, setEditingRecord] = useState<OvertimeRecord | null>(null);

  // Form Fields
  const [employeeId, setEmployeeId] = useState<string>(employees[0]?.id || '');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState<string>('16:00');
  const [endTime, setEndTime] = useState<string>('19:00');
  const [manualHours, setManualHours] = useState<number>(3);
  const [isAutoTime, setIsAutoTime] = useState<boolean>(true);
  const [overtimeType, setOvertimeType] = useState<OvertimeType>('regular');
  const [multiplier, setMultiplier] = useState<number>(settings.defaultMultiplier || 1.5);
  const [reason, setReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [status, setStatus] = useState<OvertimeStatus>('معتمد');

  // Delete Confirm Modal State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<OvertimeRecord | null>(null);

  // Selected Employee object
  const selectedEmp = employees.find((e) => e.id === employeeId);

  // Live calculation of rates
  const currentBaseRate = selectedEmp
    ? calculateEmployeeHourlyRate(selectedEmp.monthlySalary, selectedEmp.monthlyWorkingDays, selectedEmp.dailyWorkHours)
    : 3.5;

  const calculatedHours = isAutoTime
    ? calculateHoursBetween(startTime, endTime)
    : manualHours;

  const currentOtRate = calculateOvertimeRate(currentBaseRate, multiplier);
  const currentTotalAmount = calculateOvertimeTotal(calculatedHours, currentBaseRate, multiplier);

  const openAddModal = () => {
    if (employees.length === 0) {
      showToast('يرجى إضافة موظف أولاً من صفحة إدارة الموظفين قبل تسجيل الإضافي', 'error');
      return;
    }
    setEditingRecord(null);
    setEmployeeId(employees[0]?.id || '');
    setDate(new Date().toISOString().slice(0, 10));
    setStartTime('16:00');
    setEndTime('19:00');
    setManualHours(3);
    setIsAutoTime(true);
    setOvertimeType('regular');
    setMultiplier(settings.defaultMultiplier || 1.5);
    setReason('');
    setNotes('');
    setStatus('معتمد');
    setIsModalOpen(true);
  };

  const openEditModal = (rec: OvertimeRecord) => {
    setEditingRecord(rec);
    setEmployeeId(rec.employeeId);
    setDate(rec.date);
    setStartTime(rec.startTime || '16:00');
    setEndTime(rec.endTime || '19:00');
    setManualHours(rec.hours);
    setIsAutoTime(false);
    const recType = rec.overtimeType || (rec.multiplier >= 2.0 ? 'holiday' : 'regular');
    setOvertimeType(recType);
    setMultiplier(rec.multiplier || (recType === 'holiday' ? (settings.holidayMultiplier || 2.0) : (settings.defaultMultiplier || 1.5)));
    setReason(rec.reason || '');
    setNotes(rec.notes || '');
    setStatus(rec.status);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) {
      showToast('يرجى اختيار موظف مسجل في النظام', 'error');
      return;
    }
    if (calculatedHours <= 0) {
      showToast('يجب أن تكون الساعات الإضافية أكبر من صفر', 'error');
      return;
    }

    if (editingRecord) {
      updateOvertime({
        ...editingRecord,
        employeeId: selectedEmp.id,
        employeeName: selectedEmp.name,
        jobTitle: selectedEmp.jobTitle,
        department: selectedEmp.department,
        date,
        startTime,
        endTime,
        hours: calculatedHours,
        overtimeType,
        multiplier,
        baseHourlyRate: currentBaseRate,
        overtimeHourlyRate: currentOtRate,
        totalAmount: currentTotalAmount,
        reason: reason.trim() || 'عمل إضافي معتمد',
        notes: notes.trim() || undefined,
        status,
      });
    } else {
      addOvertime({
        employeeId: selectedEmp.id,
        employeeName: selectedEmp.name,
        jobTitle: selectedEmp.jobTitle,
        department: selectedEmp.department,
        date,
        startTime,
        endTime,
        hours: calculatedHours,
        overtimeType,
        multiplier,
        reason: reason.trim() || 'عمل إضافي معتمد',
        notes: notes.trim() || undefined,
        status,
        approvedBy: 'admin',
      });
    }

    setIsModalOpen(false);
  };

  const handleDeletePrompt = (rec: OvertimeRecord) => {
    setRecordToDelete(rec);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (recordToDelete) {
      deleteOvertime(recordToDelete.id);
    }
    setDeleteConfirmOpen(false);
    setRecordToDelete(null);
  };

  // Filter records
  const filteredRecords = overtimeRecords.filter((rec) => {
    const matchesSearch =
      rec.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rec.reason && rec.reason.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (rec.notes && rec.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || rec.status === statusFilter;
    const matchesEmp = employeeFilter === 'all' || rec.employeeId === employeeFilter;
    const matchesDate = !dateFilter || rec.date.startsWith(dateFilter);

    return matchesSearch && matchesStatus && matchesEmp && matchesDate;
  });

  const totalFilteredHours = filteredRecords.reduce((sum, r) => sum + r.hours, 0);
  const totalFilteredAmount = filteredRecords.reduce((sum, r) => sum + r.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <ZeroSoftLogo size="sm" showText={false} />
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <CalendarClock className="w-6 h-6 text-cyan-400" />
              <span>تسجيل واحتساب الساعات الإضافية ({settings.defaultMultiplier || 1.5}× / {settings.holidayMultiplier || 2.0}×)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              إدخال الساعات الإضافية للموظفين، وتطبيق معدل العمل العادي أو يوم الإجازة وتصدير كشوفات PDF وإكسل
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {onNavigateToOvertimeSettings && (
            <button
              onClick={onNavigateToOvertimeSettings}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition cursor-pointer"
              title="تعديل وضبط معايير الساعات الإضافية والإجازات لكامل البرنامج"
            >
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>تعديل معايير الإضافي</span>
            </button>
          )}

          {onOpenPayrollExport && (
            <button
              onClick={onOpenPayrollExport}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition cursor-pointer"
              title="تصدير كشف مسير الرواتب الشهري التفصيلي مرتباً حسب التاريخ (CSV)"
            >
              <FileSpreadsheet className="w-4 h-4 text-white" />
              <span>مسير الرواتب (CSV)</span>
            </button>
          )}

          <button
            onClick={() => exportOvertimeToExcel(filteredRecords, settings.currency)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition cursor-pointer"
            title="تصدير السجلات المحددة إلى Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>تصدير Excel</span>
          </button>

          <button
            onClick={onPrintReport}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition cursor-pointer"
            title="طباعة كشف ومسير الإضافي بصيغة PDF"
          >
            <Printer className="w-4 h-4 text-blue-400" />
            <span>طباعة PDF</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-cyan-500/20 active:scale-95 transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>تسجيل إضافي جديد</span>
          </button>
        </div>
      </div>

      {/* Summary Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
          <span className="text-[11px] text-slate-400 block font-medium">عدد السجلات المطابقة</span>
          <span className="font-mono text-xl font-black text-white">{filteredRecords.length} سجل</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
          <span className="text-[11px] text-slate-400 block font-medium">مجموع الساعات الإضافية</span>
          <span className="font-mono text-xl font-black text-cyan-400">{totalFilteredHours.toFixed(1)} س</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
          <span className="text-[11px] text-slate-400 block font-medium">إجمالي المستحق</span>
          <span className="font-mono text-xl font-black text-emerald-400">{formatMoney(totalFilteredAmount, settings.currency)}</span>
        </div>
        <div 
          onClick={onNavigateToOvertimeSettings}
          className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 transition cursor-pointer group"
          title="انقر لتعديل معايير الساعات الإضافية والإجازات"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 block font-medium">معاملات الاحتساب الحالية</span>
            <Sliders className="w-3.5 h-3.5 text-indigo-400 group-hover:rotate-45 transition" />
          </div>
          <div className="text-xs font-bold text-white mt-1 flex items-center gap-2">
            <span className="text-cyan-300">عادي {settings.defaultMultiplier || 1.5}×</span>
            <span className="text-slate-500">|</span>
            <span className="text-amber-300">عطل {settings.holidayMultiplier || 2.0}×</span>
          </div>
        </div>
      </div>

      {/* Search & Multi-Filter Bar */}
      <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Text search */}
          <div className="sm:col-span-5 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث بالاسم، المسمى الوظيفي أو سبب الإضافي..."
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 pr-10 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-500"
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Search className="w-4 h-4" />
            </div>
          </div>

          {/* Employee Filter */}
          <div className="sm:col-span-3">
            <select
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2.5 text-xs text-white outline-none focus:border-cyan-500"
            >
              <option value="all">جميع الموظفين ({employees.length})</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2.5 text-xs text-white outline-none focus:border-cyan-500"
            >
              <option value="all">جميع الحالات</option>
              <option value="معتمد">معتمد</option>
              <option value="معلق">معلق</option>
              <option value="مصروف">مصروف</option>
            </select>
          </div>

          {/* Date / Month Filter */}
          <div className="sm:col-span-2">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Overtime Records Table */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">الموظف والقسم</th>
                <th className="py-3.5 px-4">التاريخ والوقت</th>
                <th className="py-3.5 px-4 text-center">الساعات</th>
                <th className="py-3.5 px-4">أجر الساعة</th>
                <th className="py-3.5 px-4">المعامل</th>
                <th className="py-3.5 px-4">إجمالي المستحق</th>
                <th className="py-3.5 px-4">السبب والملاحظات</th>
                <th className="py-3.5 px-4 text-center">الحالة</th>
                <th className="py-3.5 px-4 text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRecords.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-white text-sm block">{r.employeeName}</span>
                    <span className="text-[11px] text-slate-400">
                      {r.jobTitle} • {r.department}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono">
                    <span className="text-white block font-medium">{r.date}</span>
                    <span className="text-[11px] text-slate-500">
                      {r.startTime} ➔ {r.endTime}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className="font-mono font-bold text-cyan-400 text-sm bg-cyan-950/60 border border-cyan-800/40 px-2.5 py-1 rounded-xl">
                      {r.hours} س
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    <div>{formatMoney(r.baseHourlyRate, settings.currency)}</div>
                    <span className="text-[10px] text-slate-500">للساعة العادية</span>
                  </td>

                  <td className="py-3.5 px-4 font-mono">
                    {r.overtimeType === 'holiday' || (r.multiplier >= 2.0 && r.overtimeType !== 'regular') ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-xs" title="ساعات عمل في يوم إجازة / عطلة رسمية">
                        <span>🏖️</span>
                        <span>{r.multiplier}× عطلة</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold text-xs" title="ساعات إضافية في يوم عمل عادي">
                        <span>☀️</span>
                        <span>{r.multiplier}× عادي</span>
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 font-mono">
                    <span className="font-black text-emerald-400 text-sm block">
                      {formatMoney(r.totalAmount, settings.currency)}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      ({formatMoney(r.overtimeHourlyRate, settings.currency)}/س)
                    </span>
                  </td>

                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="text-slate-200 text-xs font-medium truncate" title={r.reason}>
                      {r.reason || 'عمل إضافي معتمد'}
                    </div>
                    {r.notes && (
                      <div 
                        className="mt-1 inline-flex items-center gap-1.5 text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-lg max-w-full"
                        title={`ملاحظات إدارية: ${r.notes}`}
                      >
                        <MessageSquare className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="truncate">{r.notes}</span>
                      </div>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        r.status === 'معتمد'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : r.status === 'مصروف'
                          ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-left">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onPrintSingleVoucher(r)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                        title="طباعة سند صرف مفرد"
                      >
                        <FileText className="w-4 h-4 text-cyan-400" />
                      </button>
                      <button
                        onClick={() => openEditModal(r)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition cursor-pointer"
                        title="تعديل السجل"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePrompt(r)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                        title="حذف السجل (مع تأكيد)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRecords.length === 0 && (
          <div className="text-center py-12 p-6 space-y-2">
            <CalendarClock className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-white">لا توجد سجلات ساعات إضافية مطابقة</p>
            <p className="text-xs text-slate-400">يمكنك تسجيل ساعات إضافية جديدة بالضغط على الزر أعلاه</p>
          </div>
        )}
      </div>

      {/* Add / Edit Overtime Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div 
            className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-700 p-6 sm:p-7 shadow-2xl text-right max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CalendarClock className="w-5 h-5 text-cyan-400" />
                <span>{editingRecord ? 'تعديل سجل الساعات الإضافية' : 'تسجيل ساعات عمل إضافية للموظف'}</span>
              </h3>
            </div>

            <form onSubmit={handleSave} className="mt-5 space-y-4">
              {/* Employee Selection */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  اختر الموظف <span className="text-rose-400">*</span>
                </label>
                <select
                  required
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 focus:border-cyan-500 px-3.5 py-2.5 text-sm text-white outline-none"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} — {emp.jobTitle} (الراتب: {emp.monthlySalary} {settings.currency})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  تاريخ العمل الإضافي <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 focus:border-cyan-500 px-3.5 py-2.5 text-sm text-white font-mono outline-none"
                />
              </div>

              {/* Time inputs / Manual hours toggle */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300">ساعات وتوقيت العمل الإضافي</span>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setIsAutoTime(true)}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                        isAutoTime ? 'bg-cyan-500 text-white' : 'text-slate-400'
                      }`}
                    >
                      توقيت (من - إلى)
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAutoTime(false)}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                        !isAutoTime ? 'bg-cyan-500 text-white' : 'text-slate-400'
                      }`}
                    >
                      إدخال عدد الساعات مباشرة
                    </button>
                  </div>
                </div>

                {isAutoTime ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-400">من الساعة</label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white font-mono outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-400">إلى الساعة</label>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white font-mono outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400">عدد الساعات الإضافية</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={manualHours}
                      onChange={(e) => setManualHours(Number(e.target.value))}
                      className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white font-mono font-bold text-center outline-none"
                    />
                  </div>
                )}

                {/* Overtime Type & Multiplier Selection */}
                <div className="space-y-3 pt-2">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-300">
                        نوع العمل الإضافي والمعامل <span className="text-rose-400">*</span>
                      </label>
                      <span className="text-[11px] text-cyan-400 font-mono font-bold">
                        المعامل المعتمد: {multiplier}×
                      </span>
                    </div>

                    {/* Day Category Tabs */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          setOvertimeType('regular');
                          setMultiplier(settings.defaultMultiplier || 1.5);
                        }}
                        className={`py-2 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                          overtimeType === 'regular'
                            ? 'bg-cyan-500 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>☀️</span>
                        <span>يوم عمل عادي ({settings.defaultMultiplier || 1.5}×)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setOvertimeType('holiday');
                          setMultiplier(settings.holidayMultiplier || 2.0);
                        }}
                        className={`py-2 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                          overtimeType === 'holiday'
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>🏖️</span>
                        <span>يوم إجازة / عطلة ({settings.holidayMultiplier || 2.0}×)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setOvertimeType('custom')}
                        className={`py-2 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                          overtimeType === 'custom'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>⚙️</span>
                        <span>معامل اختياري / مخصص</span>
                      </button>
                    </div>
                  </div>

                  {/* Multiplier Quick Buttons: 1x, 1.25x, 1.5x, 2x */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 block">
                      اختيار قيمة الساعة الإضافية (ساعة عمل، ساعة ونص، ساعتين...):
                    </span>
                    <div className="grid grid-cols-4 gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
                      {[
                        { label: 'ساعة بساعة (1×)', value: 1.0 },
                        { label: 'ساعة وربع (1.25×)', value: 1.25 },
                        { label: 'ساعة ونصف (1.5×)', value: 1.5 },
                        { label: 'ساعتان (2.0×)', value: 2.0 },
                      ].map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => {
                            setMultiplier(item.value);
                            if (item.value >= 2.0 && overtimeType !== 'custom') {
                              setOvertimeType('holiday');
                            } else if (item.value < 2.0 && overtimeType !== 'custom') {
                              setOvertimeType('regular');
                            }
                          }}
                          className={`py-1.5 text-xs font-bold rounded-lg transition ${
                            multiplier === item.value
                              ? 'bg-cyan-500 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white bg-slate-800/60'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom manual multiplier input & Status */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-400">قيمة المعامل المباشر (×)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.5"
                        max="5"
                        value={multiplier}
                        onChange={(e) => setMultiplier(Math.max(0.1, Number(e.target.value)))}
                        className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs font-mono font-bold text-center text-cyan-400 outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-400">حالة الاعتماد</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as OvertimeStatus)}
                        className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white outline-none"
                      >
                        <option value="معتمد">معتمد (جاهز للصرف)</option>
                        <option value="معلق">معلق (بانتظار الموافقة)</option>
                        <option value="مصروف">مصروف (تم الصرف)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Real-time Math Summary Card */}
                <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400 block">
                      سعر الساعة: {formatMoney(currentBaseRate, settings.currency)} × {multiplier} =
                    </span>
                    <span className="text-cyan-300 font-bold font-mono">
                      {formatMoney(currentOtRate, settings.currency)} / ساعة إضافية
                    </span>
                  </div>
                  <div className="text-left">
                    <span className="text-[11px] text-slate-400 block">إجمالي المستحق ({calculatedHours} س):</span>
                    <span className="text-base font-black text-emerald-400 font-mono">
                      {formatMoney(currentTotalAmount, settings.currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Reason Field */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  سبب العمل الإضافي
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="مثال: تسليم المشروع، مناوبة طارئة، صيانة خوادم..."
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 focus:border-cyan-500 px-3.5 py-2 text-xs text-white outline-none"
                />
              </div>

              {/* Manager Notes (Optional) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                    <span>ملاحظات إدارية للمدراء</span>
                    <span className="text-[10px] text-slate-400 bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded font-normal">اختياري</span>
                  </label>
                  <span className="text-[10px] text-slate-400">أي تفاصيل أو اعتمادات إدارية إضافية</span>
                </div>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أضف تعليقاتك حول سبب الإضافة أو أي تفاصيل إدارية أخرى (مثال: تمت الموافقة شفهياً، مرفق أمر تكليف، تعويض طارئ)..."
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 focus:border-cyan-500 px-3.5 py-2 text-xs text-white outline-none resize-none placeholder:text-slate-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 active:scale-95 transition cursor-pointer"
                >
                  {editingRecord ? 'حفظ التعديلات' : 'تسجيل وحساب الإضافي الآن'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal Before Delete (التاكيد قبل الحذف) */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        title="تأكيد حذف سجل الساعات الإضافية"
        message="هل أنت متأكد من رغبتك في حذف هذا السجل الإضافي بشكل نهائي؟"
        itemName={recordToDelete ? `${recordToDelete.employeeName} - ${recordToDelete.hours} ساعة بتاريخ ${recordToDelete.date}` : ''}
        confirmLabel="نعم، حذف السجل"
        cancelLabel="تراجع"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setRecordToDelete(null);
        }}
      />
    </div>
  );
};
