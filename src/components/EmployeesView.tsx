import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit, 
  Trash2, 
  Clock, 
  Briefcase, 
  Phone, 
  CheckCircle, 
  XCircle, 
  FileSpreadsheet, 
  X, 
  Sparkles,
  Calculator
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Employee } from '../types';
import { 
  calculateHoursBetween, 
  calculateEmployeeHourlyRate, 
  calculateOvertimeRate, 
  formatMoney 
} from '../utils/calculations';
import { exportEmployeesToExcel } from '../utils/exportHelpers';
import { ConfirmModal } from './ConfirmModal';
import { ZeroSoftLogo } from './ZeroSoftLogo';

export const EmployeesView: React.FC<{ initialOpenAdd?: boolean }> = ({ initialOpenAdd = false }) => {
  const { employees, addEmployee, updateEmployee, deleteEmployee, settings } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(initialOpenAdd);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [monthlySalary, setMonthlySalary] = useState<number>(600);
  const [workStartTime, setWorkStartTime] = useState('08:00');
  const [workEndTime, setWorkEndTime] = useState('16:00');
  const [monthlyWorkingDays, setMonthlyWorkingDays] = useState<number>(26);
  const [phone, setPhone] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [notes, setNotes] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [customMaxOvertimeHours, setCustomMaxOvertimeHours] = useState<number | undefined>(undefined);

  // Delete Confirm Modal state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [empToDelete, setEmpToDelete] = useState<Employee | null>(null);

  // Departments list for filter
  const departments = Array.from(new Set(employees.map((e) => e.department).filter(Boolean)));

  // Calculate live daily hours from workStartTime and workEndTime
  const currentDailyHours = calculateHoursBetween(workStartTime, workEndTime);
  const currentBaseHourly = calculateEmployeeHourlyRate(monthlySalary, monthlyWorkingDays, currentDailyHours);
  const currentOvertimeHourly = calculateOvertimeRate(currentBaseHourly, settings.defaultMultiplier || 1.5);

  const openAddModal = () => {
    setEditingEmp(null);
    setName('');
    setJobTitle('');
    setDepartment('تكنولوجيا المعلومات');
    setMonthlySalary(650);
    setWorkStartTime('08:00');
    setWorkEndTime('16:00');
    setMonthlyWorkingDays(26);
    setPhone('');
    setNationalId('');
    setNotes('');
    setIsActive(true);
    setCustomMaxOvertimeHours(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmp(emp);
    setName(emp.name);
    setJobTitle(emp.jobTitle);
    setDepartment(emp.department);
    setMonthlySalary(emp.monthlySalary);
    setWorkStartTime(emp.workStartTime || '08:00');
    setWorkEndTime(emp.workEndTime || '16:00');
    setMonthlyWorkingDays(emp.monthlyWorkingDays || 26);
    setPhone(emp.phone || '');
    setNationalId(emp.nationalId || '');
    setNotes(emp.notes || '');
    setIsActive(emp.isActive);
    setCustomMaxOvertimeHours(emp.customMaxOvertimeHours);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !jobTitle.trim() || monthlySalary <= 0) return;

    const dailyHours = calculateHoursBetween(workStartTime, workEndTime);

    if (editingEmp) {
      updateEmployee({
        ...editingEmp,
        name: name.trim(),
        jobTitle: jobTitle.trim(),
        department: department.trim() || 'عام',
        monthlySalary,
        workStartTime,
        workEndTime,
        dailyWorkHours: dailyHours,
        monthlyWorkingDays,
        phone: phone.trim(),
        nationalId: nationalId.trim(),
        notes: notes.trim(),
        isActive,
        customMaxOvertimeHours: customMaxOvertimeHours && customMaxOvertimeHours > 0 ? customMaxOvertimeHours : undefined,
      });
    } else {
      addEmployee({
        name: name.trim(),
        jobTitle: jobTitle.trim(),
        department: department.trim() || 'عام',
        monthlySalary,
        workStartTime,
        workEndTime,
        dailyWorkHours: dailyHours,
        monthlyWorkingDays,
        phone: phone.trim(),
        nationalId: nationalId.trim(),
        notes: notes.trim(),
        isActive,
        customMaxOvertimeHours: customMaxOvertimeHours && customMaxOvertimeHours > 0 ? customMaxOvertimeHours : undefined,
      });
    }

    setIsModalOpen(false);
  };

  const handleDeletePrompt = (emp: Employee) => {
    setEmpToDelete(emp);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (empToDelete) {
      deleteEmployee(empToDelete.id);
    }
    setDeleteConfirmOpen(false);
    setEmpToDelete(null);
  };

  // Filter employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (emp.phone && emp.phone.includes(searchQuery)) ||
      (emp.department && emp.department.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDept = filterDepartment === 'all' || emp.department === filterDepartment;

    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <ZeroSoftLogo size="sm" showText={false} />
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-cyan-400" />
              <span>إدارة الموظفين والرواتب وساعات الدوام</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              إضافة وتعديل بيانات الموظفين، تحديد مواعيد الدوام وحساب سعر الساعة وسعر الإضافي ({settings.defaultMultiplier || 1.5}×)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => exportEmployeesToExcel(employees, settings.currency)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition cursor-pointer"
            title="تصدير قائمة الموظفين إلى ملف إكسل"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>تصدير Excel</span>
          </button>
          <button
            onClick={openAddModal}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-cyan-500/20 active:scale-95 transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>إضافة موظف جديد</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم، المسمى الوظيفي، الهاتف أو القسم..."
            className="w-full rounded-2xl bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 px-4 py-2.5 pr-10 text-sm text-white placeholder-slate-500 transition outline-none"
          />
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </div>
        </div>

        <select
          value={filterDepartment}
          onChange={(e) => setFilterDepartment(e.target.value)}
          className="w-full sm:w-48 rounded-2xl bg-slate-900 border border-slate-800 focus:border-cyan-500 px-3 py-2.5 text-xs sm:text-sm text-slate-300 outline-none"
        >
          <option value="all">جميع الأقسام ({employees.length})</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.map((emp) => {
          const hourlyRate = calculateEmployeeHourlyRate(
            emp.monthlySalary,
            emp.monthlyWorkingDays,
            emp.dailyWorkHours
          );
          const overtimeRate = calculateOvertimeRate(hourlyRate, settings.defaultMultiplier || 1.5);

          return (
            <div
              key={emp.id}
              className="rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 p-5 shadow-lg flex flex-col justify-between transition group relative"
            >
              <div>
                {/* Employee Card Header */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold text-base shrink-0">
                      {emp.name.slice(0, 1)}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition">
                        {emp.name}
                      </h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Briefcase className="w-3 h-3 text-cyan-400" />
                        <span>{emp.jobTitle}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-400">{emp.department}</span>
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      emp.isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {emp.isActive ? 'على رأس عمله' : 'متوقف'}
                  </span>
                </div>

                {/* Working Hours & Shift from Hour to Hour */}
                <div className="mt-4 p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>ساعات الدوام الرسمي:</span>
                    </span>
                    <span className="font-mono font-bold text-white dir-ltr">
                      {emp.workStartTime || '08:00'} — {emp.workEndTime || '16:00'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                    <span>معدل الدوام اليومي:</span>
                    <span className="font-mono text-cyan-300 font-bold">
                      {emp.dailyWorkHours || 8} ساعات ({emp.monthlyWorkingDays || 26} يوم/شهر)
                    </span>
                  </div>
                </div>

                {/* Salary & Hourly Rates calculation (The Core Feature) */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 block">الراتب الأساسي</span>
                    <span className="font-mono font-bold text-white text-sm">
                      {formatMoney(emp.monthlySalary, settings.currency)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 block">سعر الساعة العادية</span>
                    <span className="font-mono font-bold text-cyan-300 text-sm">
                      {formatMoney(hourlyRate, settings.currency)}
                    </span>
                  </div>
                </div>

                {/* Overtime Rate Highlight Badge (1.5x) */}
                <div className="mt-2 p-2.5 rounded-xl bg-gradient-to-r from-cyan-950/40 via-blue-950/40 to-slate-900 border border-cyan-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-cyan-300 font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>سعر الساعة الإضافية ({settings.defaultMultiplier || 1.5}×):</span>
                  </div>
                  <span className="font-mono font-black text-emerald-400 text-sm">
                    {formatMoney(overtimeRate, settings.currency)}
                  </span>
                </div>

                {/* Monthly Overtime Cap Badge */}
                <div className="mt-2 flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400">سقف الساعات الإضافية:</span>
                  <span className="font-mono font-bold text-cyan-300">
                    {emp.customMaxOvertimeHours ? `${emp.customMaxOvertimeHours} س (مخصص)` : `${settings.maxMonthlyOvertimeHours || 30} س (افتراضي)`}
                  </span>
                </div>

                {emp.phone && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                    <Phone className="w-3 h-3 text-slate-500" />
                    <span className="font-mono dir-ltr">{emp.phone}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons: Edit and Delete with confirmation */}
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(emp)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold transition cursor-pointer"
                  title="تعديل بيانات الموظف والراتب ومواعيد الدوام"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>تعديل</span>
                </button>
                <button
                  onClick={() => handleDeletePrompt(emp)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition cursor-pointer"
                  title="حذف الموظف (يتطلب تأكيد)"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="text-center py-12 rounded-3xl bg-slate-900/60 border border-slate-800 p-8 space-y-3">
          <Users className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">لم يتم العثور على موظفين مطابقين للبحث</h3>
          <p className="text-xs text-slate-400">قم بتغيير كلمات البحث أو اضغط على إضافة موظف جديد</p>
        </div>
      )}

      {/* Add / Edit Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div 
            className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-700 p-6 sm:p-7 shadow-2xl text-right max-h-[92vh] overflow-y-auto"
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
                <Users className="w-5 h-5 text-cyan-400" />
                <span>{editingEmp ? 'تعديل بيانات الموظف والدوام' : 'إضافة موظف جديد إلى المنظومة'}</span>
              </h3>
            </div>

            <form onSubmit={handleSave} className="mt-5 space-y-4">
              {/* Row 1: Name and Job Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    اسم الموظف الكامل <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: أحمد محمود العبادي"
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 focus:border-cyan-500 px-3.5 py-2.5 text-sm text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    المسمى الوظيفي <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="مثال: مهندس برمجيات / محاسب"
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 focus:border-cyan-500 px-3.5 py-2.5 text-sm text-white outline-none"
                  />
                </div>
              </div>

              {/* Row 2: Department and Monthly Salary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">القسم أو الإدارة</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="مثال: تكنولوجيا المعلومات، المالية، الدعم"
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 focus:border-cyan-500 px-3.5 py-2.5 text-sm text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    راتب الموظف الشهري ({settings.currency}) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="10"
                    required
                    value={monthlySalary}
                    onChange={(e) => setMonthlySalary(Number(e.target.value))}
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 focus:border-cyan-500 px-3.5 py-2.5 text-sm text-white font-mono font-bold outline-none"
                  />
                </div>
              </div>

              {/* Row 3: Working hours from ... to ... (ساعات الدوام من ساعة الي ساعة) */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span>ساعات الدوام الرسمي (من ساعة إلى ساعة)</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    المدة: <strong className="text-white font-mono">{currentDailyHours} ساعات</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400">من الساعة</label>
                    <input
                      type="time"
                      value={workStartTime}
                      onChange={(e) => setWorkStartTime(e.target.value)}
                      className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white font-mono outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400">إلى الساعة</label>
                    <input
                      type="time"
                      value={workEndTime}
                      onChange={(e) => setWorkEndTime(e.target.value)}
                      className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white font-mono outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400">أيام العمل بالشهـر</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={monthlyWorkingDays}
                      onChange={(e) => setMonthlyWorkingDays(Number(e.target.value))}
                      className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white font-mono outline-none"
                    />
                  </div>
                </div>

                {/* Real-time Calculation Preview Card */}
                <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[11px] text-slate-400 block">سعر الساعة الأساسية:</span>
                    <span className="font-mono font-bold text-white">
                      {formatMoney(currentBaseHourly, settings.currency)}
                    </span>
                  </div>
                  <div className="space-y-0.5 text-left">
                    <span className="text-[11px] text-cyan-300 font-semibold block">سعر الساعة الإضافية ({settings.defaultMultiplier || 1.5}×):</span>
                    <span className="font-mono font-black text-emerald-400 text-sm">
                      {formatMoney(currentOvertimeHourly, settings.currency)} / س
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 4: Phone and Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">رقم الهاتف</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="مثال: 0791234567"
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 focus:border-cyan-500 px-3.5 py-2.5 text-sm text-white font-mono outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">حالة الموظف</label>
                  <select
                    value={isActive ? 'active' : 'inactive'}
                    onChange={(e) => setIsActive(e.target.value === 'active')}
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 focus:border-cyan-500 px-3.5 py-2.5 text-sm text-white outline-none"
                  >
                    <option value="active">على رأس عمله (نشط)</option>
                    <option value="inactive">متوقف / إجازة</option>
                  </select>
                </div>
              </div>

              {/* Monthly Overtime Cap (Custom Threshold) */}
              <div className="space-y-1 p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>سقف الساعات الإضافية الشهري للموظف</span>
                  </label>
                  <span className="text-[10px] text-cyan-400 font-bold">
                    الافتراضي العام: {settings.maxMonthlyOvertimeHours || 30} ساعة/شهر
                  </span>
                </div>
                <input
                  type="number"
                  min="1"
                  max="300"
                  value={customMaxOvertimeHours ?? ''}
                  onChange={(e) => setCustomMaxOvertimeHours(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder={`اتركه فارغاً لاعتماد السقف العام (${settings.maxMonthlyOvertimeHours || 30} س)`}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 focus:border-cyan-500 px-3.5 py-2 text-sm text-white font-mono outline-none"
                />
                <span className="text-[10px] text-slate-400 block">
                  سيقوم النظام بإطلاق تنبيه تحذيري عند تسجيل ساعات إضافية لهذا الموظف تتجاوز هذا السقف خلال أي شهر لمنع أخطاء الرواتب.
                </span>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">ملاحظات إضافية</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أي تفاصيل أو ملاحظات خاصة بالموظف..."
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 focus:border-cyan-500 px-3.5 py-2 text-xs text-white outline-none resize-none"
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
                  {editingEmp ? 'حفظ التعديلات' : 'إضافة الموظف الآن'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal Before Delete (التاكيد قبل الحذف) */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        title="تأكيد حذف الموظف"
        message="هل أنت متأكد من رغبتك في حذف بيانات الموظف نهائياً من النظام؟"
        itemName={empToDelete?.name}
        confirmLabel="نعم، حذف الموظف"
        cancelLabel="تراجع"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setEmpToDelete(null);
        }}
      />
    </div>
  );
};
