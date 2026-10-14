import React, { useState } from 'react';
import { 
  Users, 
  CalendarClock, 
  CheckCircle2, 
  Clock, 
  PlusCircle, 
  TrendingUp, 
  Sparkles, 
  FileSpreadsheet, 
  Printer, 
  Calculator,
  AlertCircle,
  BarChart3,
  Award,
  Trophy,
  Medal,
  Calendar,
  PieChart as PieIcon,
  Activity,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Sliders
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { useApp } from '../context/AppContext';
import { formatMoney, formatDateArabic } from '../utils/calculations';
import { exportOvertimeToExcel } from '../utils/exportHelpers';
import { ZeroSoftLogo } from './ZeroSoftLogo';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  onOpenAddOvertime: () => void;
  onOpenAddEmployee: () => void;
  onOpenCalculator: () => void;
  onPrintReport: () => void;
  onOpenPayrollExport: () => void;
}

const BAR_COLORS = [
  '#06b6d4', // cyan-500
  '#3b82f6', // blue-500
  '#6366f1', // indigo-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ec4899', // pink-500
  '#8b5cf6', // purple-500
];

const PIE_COLORS = ['#06b6d4', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenAddOvertime,
  onOpenAddEmployee,
  onOpenCalculator,
  onPrintReport,
  onOpenPayrollExport,
}) => {
  const { employees, overtimeRecords, settings } = useApp();

  // Chart filters: 'current' (هذا الشهر) or 'all' (كافة الشهور)
  const [chartMonthFilter, setChartMonthFilter] = useState<'current' | 'all'>('current');
  const [chartMetric, setChartMetric] = useState<'hours' | 'amount'>('hours');
  const [trendMetric, setTrendMetric] = useState<'both' | 'hours' | 'amount'>('both');

  // Determine current month string (YYYY-MM), e.g. 2026-10
  const currentMonthKey = new Date().toISOString().slice(0, 7);

  // Statistics calculation
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.isActive).length;

  const totalOvertimeHours = overtimeRecords.reduce((sum, r) => sum + r.hours, 0);
  const totalOvertimeAmount = overtimeRecords.reduce((sum, r) => sum + r.totalAmount, 0);

  const pendingRecords = overtimeRecords.filter((r) => r.status === 'معلق');
  const approvedRecords = overtimeRecords.filter((r) => r.status === 'معتمد');
  const paidRecords = overtimeRecords.filter((r) => r.status === 'مصروف');

  // Breakdown by Department
  const departmentStats = overtimeRecords.reduce((acc, r) => {
    const dept = r.department || 'أخرى';
    if (!acc[dept]) {
      acc[dept] = { hours: 0, amount: 0, count: 0 };
    }
    acc[dept].hours += r.hours;
    acc[dept].amount += r.totalAmount;
    acc[dept].count += 1;
    return acc;
  }, {} as Record<string, { hours: number; amount: number; count: number }>);

  // Filter records for Top Employees Chart based on month filter
  const targetRecordsForChart = chartMonthFilter === 'current'
    ? overtimeRecords.filter((r) => r.date && r.date.startsWith(currentMonthKey))
    : overtimeRecords;

  // Aggregate overtime by employee
  const employeeOvertimeMap: Record<
    string,
    {
      id: string;
      name: string;
      shortName: string;
      department: string;
      jobTitle: string;
      hours: number;
      amount: number;
      count: number;
      hourlyRate: number;
    }
  > = {};

  targetRecordsForChart.forEach((r) => {
    const empId = r.employeeId || r.employeeName;
    if (!employeeOvertimeMap[empId]) {
      // Short name for chart axis (first 2 words)
      const parts = r.employeeName.trim().split(/\s+/);
      const shortName = parts.slice(0, 2).join(' ');

      employeeOvertimeMap[empId] = {
        id: empId,
        name: r.employeeName,
        shortName,
        department: r.department || 'عام',
        jobTitle: r.jobTitle || 'موظف',
        hours: 0,
        amount: 0,
        count: 0,
        hourlyRate: r.baseHourlyRate || 0,
      };
    }
    employeeOvertimeMap[empId].hours = parseFloat((employeeOvertimeMap[empId].hours + r.hours).toFixed(1));
    employeeOvertimeMap[empId].amount = parseFloat((employeeOvertimeMap[empId].amount + r.totalAmount).toFixed(2));
    employeeOvertimeMap[empId].count += 1;
  });

  // Top employees sorted descending by hours or amount
  const sortedTopEmployees = Object.values(employeeOvertimeMap).sort((a, b) => {
    return chartMetric === 'hours' ? b.hours - a.hours : b.amount - a.amount;
  });

  // Top 7 for the Bar Chart
  const topEmployeesChartData = sortedTopEmployees.slice(0, 7);

  // Top 3 Podium
  const rank1 = sortedTopEmployees[0];
  const rank2 = sortedTopEmployees[1];
  const rank3 = sortedTopEmployees[2];

  // Pie chart data: Department distribution for current period
  const pieChartData = Object.entries(
    targetRecordsForChart.reduce((acc, r) => {
      const dept = r.department || 'أخرى';
      acc[dept] = (acc[dept] || 0) + r.hours;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(1)),
  }));

  // Recent 5 overtime entries
  const recentRecords = [...overtimeRecords].slice(0, 5);

  // Month Display Name in Arabic
  const currentMonthName = new Date().toLocaleDateString('ar-JO', { month: 'long', year: 'numeric' });

  // Custom Tooltip for Recharts in dark mode
  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-2xl bg-slate-900/95 border border-cyan-500/50 p-3.5 shadow-2xl text-right backdrop-blur-md min-w-[210px]">
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
            <span className="font-bold text-white text-sm">{data.name}</span>
            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-medium">
              {data.department}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mb-2">{data.jobTitle}</p>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex items-center justify-between text-cyan-400 font-bold">
              <span>الساعات الإضافية:</span>
              <span className="text-sm">{data.hours} ساعة</span>
            </div>
            <div className="flex items-center justify-between text-emerald-400 font-bold">
              <span>المبلغ المستحق (1.5×):</span>
              <span>{formatMoney(data.amount, settings.currency)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400 text-[11px] pt-1 border-t border-slate-800">
              <span>عدد مرات الإضافي:</span>
              <span>{data.count} تسجيلات</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Calculate 6-month overtime trends dynamically
  const past6MonthsData = React.useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const monthKey = `${year}-${month}`;
      const monthShort = d.toLocaleDateString('ar-JO', { month: 'short' });
      const fullMonthName = d.toLocaleDateString('ar-JO', { month: 'long', year: 'numeric' });

      const monthRecords = overtimeRecords.filter((r) => r.date && r.date.startsWith(monthKey));
      const hours = monthRecords.reduce((sum, r) => sum + r.hours, 0);
      const amount = monthRecords.reduce((sum, r) => sum + r.totalAmount, 0);
      const uniqueEmployees = new Set(monthRecords.map((r) => r.employeeId)).size;

      months.push({
        monthKey,
        monthShort,
        fullMonthName,
        monthName: fullMonthName,
        hours: parseFloat(hours.toFixed(1)),
        amount: parseFloat(amount.toFixed(2)),
        count: monthRecords.length,
        uniqueEmployees,
      });
    }
    return months;
  }, [overtimeRecords]);

  // Overall 6-month metrics
  const total6MonthsHours = past6MonthsData.reduce((acc, m) => acc + m.hours, 0);
  const total6MonthsAmount = past6MonthsData.reduce((acc, m) => acc + m.amount, 0);
  const avgMonthlyHours = (total6MonthsHours / 6).toFixed(1);
  const currentMonthTrend = past6MonthsData[5] || { hours: 0, amount: 0 };
  const prevMonthTrend = past6MonthsData[4] || { hours: 0, amount: 0 };
  const monthOverMonthChange = prevMonthTrend.hours > 0
    ? Math.round(((currentMonthTrend.hours - prevMonthTrend.hours) / prevMonthTrend.hours) * 100)
    : 0;

  // Custom Tooltip for Recharts Line Chart
  const CustomLineTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-2xl bg-slate-900/95 border border-cyan-500/50 p-3.5 shadow-2xl text-right backdrop-blur-md min-w-[220px]">
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
            <span className="font-bold text-white text-sm">{data.fullMonthName}</span>
            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-mono">
              {data.monthKey}
            </span>
          </div>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex items-center justify-between text-cyan-400 font-bold">
              <span className="font-sans">إجمالي الساعات:</span>
              <span className="text-sm">{data.hours} ساعة</span>
            </div>
            <div className="flex items-center justify-between text-emerald-400 font-bold">
              <span className="font-sans">المستحقات (1.5×):</span>
              <span>{formatMoney(data.amount, settings.currency)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300 text-[11px] pt-1 border-t border-slate-800 font-sans">
              <span>الموظفون المشاركون:</span>
              <span className="font-mono font-bold text-white">{data.uniqueEmployees} موظف</span>
            </div>
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-sans">
              <span>عدد الحركات المسجلة:</span>
              <span className="font-mono">{data.count} حركة</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-slate-700/80 p-6 sm:p-8 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-3 text-right">
            <div className="flex items-center gap-3">
              <ZeroSoftLogo size="md" showText={true} subtitle="" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              مرحباً بك في لوحة متابعة ساعات العمل الإضافي
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
              النظام يقوم آلياً باحتساب أجر الساعة من الراتب الشهري وساعات الدوام اليومية، ويمنح الموظف ساعة ونصف (1.5×) عن كل ساعة إضافية بدقة وشفافية متناهية.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => onNavigate('overtime-settings')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 text-xs sm:text-sm font-bold transition cursor-pointer shadow-md"
              title="صفحة تعديل معايير الساعات الإضافية ويوم الإجازة"
            >
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>تعديل الساعات الإضافية ({settings.defaultMultiplier || 1.5}×)</span>
            </button>
            <button
              onClick={onOpenAddOvertime}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-cyan-500/20 active:scale-95 transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>تسجيل إضافي</span>
            </button>
            <button
              onClick={onOpenCalculator}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs sm:text-sm font-semibold transition cursor-pointer"
            >
              <Calculator className="w-4 h-4 text-cyan-400" />
              <span>حاسبة الإضافي</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Overtime Amount */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg relative overflow-hidden group hover:border-cyan-500/40 transition">
          <div className="flex items-center justify-between pb-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center font-black font-mono text-base tracking-wider shadow-sm">
              JD
            </div>
            <span className="text-[11px] font-semibold text-cyan-300 bg-cyan-950/60 px-2.5 py-0.5 rounded-full border border-cyan-800/40">
              معامل {settings.defaultMultiplier || 1.5}×
            </span>
          </div>
          <span className="text-xs text-slate-400 block font-medium">إجمالي المستحقات الإضافية</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">
              {formatMoney(totalOvertimeAmount, settings.currency)}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            لجميع السجلات المعتمدة والمسجلة
          </p>
        </div>

        {/* Card 2: Total Overtime Hours */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg relative overflow-hidden group hover:border-blue-500/40 transition">
          <div className="flex items-center justify-between pb-3">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Clock className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-semibold text-blue-300 bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-800/40">
              ساعات مسجلة
            </span>
          </div>
          <span className="text-xs text-slate-400 block font-medium">إجمالي الساعات الإضافية</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">
              {totalOvertimeHours.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400 font-semibold">ساعة عمل</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            ما يعادل {(totalOvertimeHours * 1.5).toFixed(1)} ساعة احتساب عادي
          </p>
        </div>

        {/* Card 3: Employees count */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg relative overflow-hidden group hover:border-indigo-500/40 transition">
          <div className="flex items-center justify-between pb-3">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800/40">
              {activeEmployees} نشط
            </span>
          </div>
          <span className="text-xs text-slate-400 block font-medium">عدد الموظفين المسجلين</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">
              {totalEmployees}
            </span>
            <span className="text-xs text-slate-400 font-semibold">موظف</span>
          </div>
          <button 
            onClick={() => onNavigate('employees')}
            className="mt-2 text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
          >
            عرض سجلات الموظفين والرواتب ←
          </button>
        </div>

        {/* Card 4: Pending Approvals */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between pb-3">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertCircle className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-semibold text-amber-300 bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-800/40">
              بحاجة لمراجعة
            </span>
          </div>
          <span className="text-xs text-slate-400 block font-medium">سجلات معلقة للاعتماد</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">
              {pendingRecords.length}
            </span>
            <span className="text-xs text-slate-400 font-semibold">طلب</span>
          </div>
          <button
            onClick={() => onNavigate('overtime')}
            className="mt-2 text-[11px] text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
          >
            الانتقال للاعتماد والصرف ←
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* RECHARTS SECTION: الأكثر تسجيلاً للساعات الإضافية هذا الشهر      */}
      {/* ============================================================== */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-6">
        {/* Section Header with Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-white">
                أكثر الموظفين تسجيلاً للساعات الإضافية
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                {chartMonthFilter === 'current' ? `هذا الشهر (${currentMonthName})` : 'كافة السجلات'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              رسم بياني تفاعلي باستخدام Recharts يوضح ترتيب الموظفين حسب إجمالي ساعات العمل الإضافي والمستحقات
            </p>
          </div>

          {/* Filter & Metric Toggles */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Month Filter Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setChartMonthFilter('current')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  chartMonthFilter === 'current'
                    ? 'bg-cyan-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                هذا الشهر ({currentMonthName.split(' ')[0]})
              </button>
              <button
                type="button"
                onClick={() => setChartMonthFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  chartMonthFilter === 'all'
                    ? 'bg-cyan-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                الكل
              </button>
            </div>

            {/* Metric Toggle: Hours vs Amount */}
            <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setChartMetric('hours')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  chartMetric === 'hours'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                الساعات (س)
              </button>
              <button
                type="button"
                onClick={() => setChartMetric('amount')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  chartMetric === 'amount'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                المبلغ ({settings.currency})
              </button>
            </div>
          </div>
        </div>

        {/* Top 3 Podium Highlights */}
        {sortedTopEmployees.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Rank 1: First Place (Gold) */}
            {rank1 && (
              <div className="relative rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 border border-amber-500/40 p-4 shadow-lg overflow-hidden group">
                <div className="absolute top-2 left-2 text-amber-400">
                  <Trophy className="w-5 h-5 animate-pulse" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-black text-base shrink-0">
                    🥇 1
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition">
                      {rank1.name}
                    </h4>
                    <span className="text-[10px] text-slate-400">{rank1.jobTitle} • {rank1.department}</span>
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 font-sans">ساعات الإضافي:</span>
                  <span className="text-amber-400 font-black text-sm">{rank1.hours} ساعة</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 font-sans">المستحق (1.5×):</span>
                  <span className="text-emerald-400 font-bold">{formatMoney(rank1.amount, settings.currency)}</span>
                </div>
              </div>
            )}

            {/* Rank 2: Second Place (Silver / Cyan) */}
            {rank2 && (
              <div className="relative rounded-2xl bg-gradient-to-br from-cyan-500/10 via-slate-900 to-slate-950 border border-cyan-500/30 p-4 shadow-lg overflow-hidden group">
                <div className="absolute top-2 left-2 text-cyan-400">
                  <Medal className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-black text-base shrink-0">
                    🥈 2
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition">
                      {rank2.name}
                    </h4>
                    <span className="text-[10px] text-slate-400">{rank2.jobTitle} • {rank2.department}</span>
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 font-sans">ساعات الإضافي:</span>
                  <span className="text-cyan-400 font-black text-sm">{rank2.hours} ساعة</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 font-sans">المستحق (1.5×):</span>
                  <span className="text-emerald-400 font-bold">{formatMoney(rank2.amount, settings.currency)}</span>
                </div>
              </div>
            )}

            {/* Rank 3: Third Place (Bronze / Indigo) */}
            {rank3 && (
              <div className="relative rounded-2xl bg-gradient-to-br from-indigo-500/10 via-slate-900 to-slate-950 border border-indigo-500/30 p-4 shadow-lg overflow-hidden group">
                <div className="absolute top-2 left-2 text-indigo-400">
                  <Award className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 flex items-center justify-center font-black text-base shrink-0">
                    🥉 3
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition">
                      {rank3.name}
                    </h4>
                    <span className="text-[10px] text-slate-400">{rank3.jobTitle} • {rank3.department}</span>
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 font-sans">ساعات الإضافي:</span>
                  <span className="text-indigo-400 font-black text-sm">{rank3.hours} ساعة</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 font-sans">المستحق (1.5×):</span>
                  <span className="text-emerald-400 font-bold">{formatMoney(rank3.amount, settings.currency)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Charts Container: Bar Chart & Distribution */}
        {topEmployeesChartData.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Primary Recharts Bar Chart */}
            <div className="lg:col-span-8 bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  <span>
                    ترتيب الموظفين حسب {chartMetric === 'hours' ? 'ساعات الإضافي' : `المستحقات المالية (${settings.currency})`}
                  </span>
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  المعامل القانوني: 1.5×
                </span>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topEmployeesChartData}
                    margin={{ top: 15, right: 10, left: 0, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis
                      dataKey="shortName"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#334155' }}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#334155' }}
                      tickFormatter={(val) => (chartMetric === 'hours' ? `${val} س` : `${val}`)}
                    />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Bar
                      dataKey={chartMetric === 'hours' ? 'hours' : 'amount'}
                      name={chartMetric === 'hours' ? 'ساعات الإضافي' : 'المستحق'}
                      radius={[8, 8, 0, 0]}
                    >
                      {topEmployeesChartData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={BAR_COLORS[index % BAR_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Secondary Recharts Pie / Department Distribution */}
            <div className="lg:col-span-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-blue-400" />
                  <span>توزيع الساعات حسب القسم</span>
                </span>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={4}
                    >
                      {pieChartData.map((_, index) => (
                        <Cell key={`pie-cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => [`${value} ساعة`, 'ساعات الإضافي']}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        fontSize: '12px',
                        color: '#fff',
                        textAlign: 'right',
                        direction: 'rtl'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Legends */}
              <div className="mt-2 space-y-1.5 border-t border-slate-800 pt-2 text-xs">
                {pieChartData.map((item, idx) => (
                  <div key={item.name} className="flex items-center justify-between text-slate-300 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                      />
                      <span>{item.name}</span>
                    </div>
                    <span className="font-mono font-bold text-white">{item.value} س</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 bg-slate-950/50 rounded-2xl border border-dashed border-slate-800 p-6 space-y-2">
            <Clock className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-white">لا توجد ساعات إضافية مسجلة لهذا الشهر حتى الآن</p>
            <p className="text-xs text-slate-400">
              يمكنك الضغط على "تسجيل إضافي" بالأعلى لإضافة ساعات عمل إضافية للموظفين، أو التبديل لخيار "الكل" لعرض السجلات السابقة.
            </p>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* RECHARTS LINE CHART: اتجاهات الساعات الإضافية على مدار 6 أشهر   */}
      {/* ============================================================== */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-white">
                اتجاهات الساعات الإضافية المسجلة (الـ 6 أشهر الماضية)
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-300 border border-blue-500/30">
                مخطط بياني (Line Chart)
              </span>
            </div>
            <p className="text-xs text-slate-400">
              تحليل زمني تراكمي يوضح مسار نمو وتغير حجم الساعات الإضافية والمستحقات المالية شهرياً
            </p>
          </div>

          {/* Toggle Line Metric */}
          <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setTrendMetric('both')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                trendMetric === 'both' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              الساعات والمستحقات معاً
            </button>
            <button
              type="button"
              onClick={() => setTrendMetric('hours')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                trendMetric === 'hours' ? 'bg-cyan-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              الساعات فقط
            </button>
            <button
              type="button"
              onClick={() => setTrendMetric('amount')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                trendMetric === 'amount' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              المبالغ فقط
            </button>
          </div>
        </div>

        {/* 6-Month Analytics Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-right">
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-medium">مجموع ساعات الـ 6 أشهر</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-mono text-xl font-black text-cyan-400">{total6MonthsHours.toFixed(1)}</span>
              <span className="text-xs text-slate-400">ساعة</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-medium">إجمالي مستحقات الـ 6 أشهر</span>
            <span className="mt-1 font-mono text-lg font-black text-emerald-400 block">
              {formatMoney(total6MonthsAmount, settings.currency)}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-medium">المتوسط الشهري للساعات</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-mono text-xl font-bold text-white">{avgMonthlyHours}</span>
              <span className="text-xs text-slate-400">س/شهر</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-medium">معدل التغير عن الشهر السابق</span>
            <div className="mt-1 flex items-center gap-1.5 font-mono text-sm font-bold">
              {monthOverMonthChange >= 0 ? (
                <span className="text-emerald-400 flex items-center gap-0.5">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>+{monthOverMonthChange}%</span>
                </span>
              ) : (
                <span className="text-rose-400 flex items-center gap-0.5">
                  <ArrowDownRight className="w-4 h-4" />
                  <span>{monthOverMonthChange}%</span>
                </span>
              )}
              <span className="text-[11px] text-slate-500 font-sans font-normal">(مقارنة بـ {past6MonthsData[4]?.monthName})</span>
            </div>
          </div>
        </div>

        {/* The Recharts Line Chart Container */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 sm:p-6">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={past6MonthsData}
                margin={{ top: 20, right: 20, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="monthShort"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#38bdf8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  tickFormatter={(val) => `${val} س`}
                />
                {(trendMetric === 'both' || trendMetric === 'amount') && (
                  <YAxis
                    yAxisId={trendMetric === 'both' ? 'right' : 'left'}
                    orientation={trendMetric === 'both' ? 'right' : 'left'}
                    stroke="#34d399"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                    tickFormatter={(val) => `${val}`}
                  />
                )}
                <Tooltip content={<CustomLineTooltip />} />
                <Legend
                  verticalAlign="top"
                  height={40}
                  wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
                />
                {(trendMetric === 'both' || trendMetric === 'hours') && (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="hours"
                    name="إجمالي الساعات الإضافية (ساعة)"
                    stroke="#06b6d4"
                    strokeWidth={3.5}
                    dot={{ r: 5, fill: '#06b6d4', stroke: '#0f172a', strokeWidth: 2 }}
                    activeDot={{ r: 8, stroke: '#38bdf8', strokeWidth: 3 }}
                  />
                )}
                {(trendMetric === 'both' || trendMetric === 'amount') && (
                  <Line
                    yAxisId={trendMetric === 'both' ? 'right' : 'left'}
                    type="monotone"
                    dataKey="amount"
                    name={`المستحقات المالية (${settings.currency})`}
                    stroke="#10b981"
                    strokeWidth={3}
                    strokeDasharray={trendMetric === 'both' ? '5 3' : undefined}
                    dot={{ r: 5, fill: '#10b981', stroke: '#0f172a', strokeWidth: 2 }}
                    activeDot={{ r: 8, stroke: '#34d399', strokeWidth: 3 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Middle Section: Quick Actions & Department Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department Overtime Breakdown */}
        <div className="lg:col-span-7 rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              <span>توزيع الساعات والمستحقات حسب الأقسام</span>
            </h3>
            <span className="text-xs text-slate-400">تحليل فوري</span>
          </div>

          <div className="mt-4 space-y-4">
            {Object.keys(departmentStats).length === 0 ? (
              <p className="text-slate-400 text-xs text-center py-6">لا توجد بيانات ساعات إضافية بعد</p>
            ) : (
              Object.entries(departmentStats).map(([dept, data]) => {
                const percent = totalOvertimeAmount > 0 ? (data.amount / totalOvertimeAmount) * 100 : 0;
                return (
                  <div key={dept} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{dept}</span>
                      <div className="flex items-center gap-3 text-slate-300">
                        <span>{data.hours} ساعة</span>
                        <span className="font-mono font-bold text-cyan-400">
                          {formatMoney(data.amount, settings.currency)}
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(8, percent))}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Tools & Exports */}
        <div className="lg:col-span-5 rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white pb-3 border-b border-slate-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <span>إجراءات وتقارير سريعة</span>
          </h3>

          <div className="space-y-2.5">
            <button
              onClick={onOpenPayrollExport}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-800/90 hover:from-emerald-900/60 hover:to-slate-800 border border-emerald-500/40 hover:border-emerald-400 text-slate-200 transition cursor-pointer group shadow-lg shadow-emerald-950/40"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-white block flex items-center gap-1.5">
                    <span>كشف مسير الرواتب الشهري (CSV)</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-normal">جديد</span>
                  </span>
                  <span className="text-[11px] text-emerald-300/80">مرتب بالتاريخ مع حساب الإضافي والاستحقاق لكل موظف</span>
                </div>
              </div>
              <span className="text-xs text-emerald-400 font-semibold group-hover:translate-x-[-4px] transition">تصدير ←</span>
            </button>

            <button
              onClick={() => exportOvertimeToExcel(overtimeRecords, settings.currency)}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-cyan-500/40 text-slate-200 transition cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-105 transition">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-white block">تصدير سجلات الساعات الإضافية (Excel)</span>
                  <span className="text-[11px] text-slate-400">ملف CSV لكافة الحركات الإضافية</span>
                </div>
              </div>
              <span className="text-xs text-cyan-400 font-semibold group-hover:translate-x-[-4px] transition">تنزيل ←</span>
            </button>

            <button
              onClick={onPrintReport}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-blue-500/40 text-slate-200 transition cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-105 transition">
                  <Printer className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-white block">طباعة كشف ومسير الرواتب (PDF)</span>
                  <span className="text-[11px] text-slate-400">تنسيق رسمي معد للطباعة والحفظ بصيغة PDF</span>
                </div>
              </div>
              <span className="text-xs text-blue-400 font-semibold group-hover:translate-x-[-4px] transition">معاينة ←</span>
            </button>

            <button
              onClick={onOpenAddEmployee}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-cyan-500/40 text-slate-200 transition cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-105 transition">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-white block">إضافة موظف جديد وتحديد الدوام</span>
                  <span className="text-[11px] text-slate-400">اسم الموظف، المسمى، الراتب، وساعات الدوام</span>
                </div>
              </div>
              <span className="text-xs text-cyan-400 font-semibold group-hover:translate-x-[-4px] transition">إضافة ←</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Overtime Log Table */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-cyan-400" />
              <span>آخر الساعات الإضافية المسجلة</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">معدل الاحتساب: ساعة ونصف (1.5×) من أجر الساعة</p>
          </div>
          <button
            onClick={() => onNavigate('overtime')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer"
          >
            عرض الكل ({overtimeRecords.length}) ←
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                <th className="pb-3 px-3">الموظف</th>
                <th className="pb-3 px-3">المسمى والقسم</th>
                <th className="pb-3 px-3">التاريخ والوقت</th>
                <th className="pb-3 px-3">الساعات</th>
                <th className="pb-3 px-3">أجر الساعة</th>
                <th className="pb-3 px-3">المستحق (1.5×)</th>
                <th className="pb-3 px-3">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentRecords.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3 font-bold text-white">{r.employeeName}</td>
                  <td className="py-3 px-3 text-slate-300">
                    <div>{r.jobTitle}</div>
                    <span className="text-[10px] text-slate-500">{r.department}</span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-300">
                    <div>{r.date}</div>
                    <span className="text-[10px] text-slate-500">{r.startTime} - {r.endTime}</span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-cyan-400">
                    {r.hours} س
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-300">
                    {formatMoney(r.baseHourlyRate, settings.currency)}
                  </td>
                  <td className="py-3 px-3 font-mono font-black text-emerald-400 text-sm">
                    {formatMoney(r.totalAmount, settings.currency)}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.status === 'معتمد'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : r.status === 'مصروف'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
