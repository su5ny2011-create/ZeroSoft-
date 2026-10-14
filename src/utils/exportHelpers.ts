import { OvertimeRecord, Employee, BackupData } from '../types';
import { formatMoney } from './calculations';

/**
 * Exports data to CSV with UTF-8 BOM so Microsoft Excel opens Arabic text flawlessly.
 */
export function exportOvertimeToExcel(records: OvertimeRecord[], currency: string = 'JD') {
  const headers = [
    'رقم السجل',
    'اسم الموظف',
    'المسمى الوظيفي',
    'القسم',
    'التاريخ',
    'من الساعة',
    'إلى الساعة',
    'عدد الساعات',
    'معامل الإضافي',
    `أجر الساعة العادية (${currency})`,
    `أجر الساعة الإضافية (${currency})`,
    `إجمالي المبلغ المستحق (${currency})`,
    'العملة',
    'الحالة',
    'سبب العمل الإضافي',
    'ملاحظات إدارية للمدراء'
  ];

  const rows = records.map((r, idx) => [
    idx + 1,
    `"${(r.employeeName || '').replace(/"/g, '""')}"`,
    `"${(r.jobTitle || '').replace(/"/g, '""')}"`,
    `"${(r.department || '').replace(/"/g, '""')}"`,
    r.date,
    r.startTime,
    r.endTime,
    r.hours,
    `${r.multiplier}x`,
    r.baseHourlyRate.toFixed(2),
    r.overtimeHourlyRate.toFixed(2),
    r.totalAmount.toFixed(2),
    currency,
    `"${r.status}"`,
    `"${(r.reason || '').replace(/"/g, '""')}"`,
    `"${(r.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(row => row.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('download', `ZeroSoft_تقرير_الساعات_الاضافية_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports Employees list to Excel CSV.
 */
export function exportEmployeesToExcel(employees: Employee[], currency: string = 'JD') {
  const headers = [
    'رقم',
    'اسم الموظف',
    'المسمى الوظيفي',
    'القسم',
    `الراتب الشهري (${currency})`,
    'بداية الدوام',
    'نهاية الدوام',
    'ساعات العمل اليومية',
    'أيام العمل الشهرية',
    `سعر الساعة العادية (${currency})`,
    `سعر الساعة الإضافية (${currency})`,
    'رقم الهاتف',
    'الحالة'
  ];

  const rows = employees.map((e, idx) => {
    const hourly = e.monthlySalary / (e.monthlyWorkingDays * e.dailyWorkHours);
    const otHourly = hourly * 1.5;
    return [
      idx + 1,
      `"${(e.name || '').replace(/"/g, '""')}"`,
      `"${(e.jobTitle || '').replace(/"/g, '""')}"`,
      `"${(e.department || '').replace(/"/g, '""')}"`,
      e.monthlySalary,
      e.workStartTime,
      e.workEndTime,
      e.dailyWorkHours,
      e.monthlyWorkingDays,
      hourly.toFixed(2),
      otHourly.toFixed(2),
      `"${e.phone || ''}"`,
      e.isActive ? 'على رأس عمله' : 'متوقف'
    ];
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(row => row.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('download', `ZeroSoft_قائمة_الموظفين_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads full system backup as JSON.
 */
export function downloadBackupFile(data: BackupData) {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('download', `ZeroSoft_نسخة_احتياطية_${dateStr}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export interface EmployeePayrollItem {
  employeeId: string;
  name: string;
  jobTitle: string;
  department: string;
  monthlySalary: number;
  baseHourlyRate: number;
  overtimeHourlyRate: number;
  totalOvertimeHours: number;
  totalOvertimeAmount: number;
  netSalary: number;
  recordsCount: number;
  datesList: string[]; // Chronologically sorted dates
  records: OvertimeRecord[]; // Chronologically sorted records
}

/**
 * Exports comprehensive Monthly Payroll Statement in CSV format sorted by date,
 * calculating total overtime hours, financial entitlement (1.5x), and net salary for each employee individually.
 */
export function exportMonthlyPayrollCSV({
  monthStr,
  employees,
  overtimeRecords,
  currency = 'دينار أردني',
  companyName = 'ZeroSoft Solutions',
}: {
  monthStr: string; // e.g. "2026-10" or "all"
  employees: Employee[];
  overtimeRecords: OvertimeRecord[];
  currency?: string;
  companyName?: string;
}) {
  // 1. Filter overtime records for the target month (or all)
  const filteredRecords = (monthStr === 'all'
    ? overtimeRecords
    : overtimeRecords.filter((r) => r.date && r.date.startsWith(monthStr))
  ).sort((a, b) => a.date.localeCompare(b.date)); // Strictly sorted chronologically by date

  // 2. Aggregate per employee
  const employeeItems: EmployeePayrollItem[] = employees.map((emp) => {
    const empRecords = filteredRecords
      .filter((r) => r.employeeId === emp.id)
      .sort((a, b) => a.date.localeCompare(b.date)); // Sorted by date

    const totalHours = empRecords.reduce((sum, r) => sum + r.hours, 0);
    const totalAmount = empRecords.reduce((sum, r) => sum + r.totalAmount, 0);
    const hourly = emp.monthlySalary / ((emp.monthlyWorkingDays || 26) * (emp.dailyWorkHours || 8));
    const otHourly = hourly * 1.5;
    const net = emp.monthlySalary + totalAmount;
    const uniqueDates = Array.from(new Set(empRecords.map((r) => r.date))).sort();

    return {
      employeeId: emp.id,
      name: emp.name,
      jobTitle: emp.jobTitle,
      department: emp.department,
      monthlySalary: emp.monthlySalary,
      baseHourlyRate: hourly,
      overtimeHourlyRate: otHourly,
      totalOvertimeHours: parseFloat(totalHours.toFixed(1)),
      totalOvertimeAmount: parseFloat(totalAmount.toFixed(2)),
      netSalary: parseFloat(net.toFixed(2)),
      recordsCount: empRecords.length,
      datesList: uniqueDates,
      records: empRecords,
    };
  });

  // Sort employees: those with overtime first (by total overtime hours descending), then alphabetical
  employeeItems.sort((a, b) => {
    if (b.totalOvertimeHours !== a.totalOvertimeHours) {
      return b.totalOvertimeHours - a.totalOvertimeHours;
    }
    return a.name.localeCompare(b.name, 'ar');
  });

  const titleRow = [`"${companyName} - كشف مسير الرواتب الشهري والساعات الإضافية المعتمدة - شهر ${monthStr}"`];
  const emptyRow = [''];

  // SECTION 1: ملخص كشف الرواتب الشهري المجمع لكل موظف على حدة
  const summarySectionHeader = ['"--- أولاً: كشف مستحقات الرواتب والإضافي لكل موظف على حدة ---"'];
  const summaryHeaders = [
    'الرقم',
    'اسم الموظف',
    'المسمى الوظيفي',
    'القسم',
    `الراتب الأساسي (${currency})`,
    `سعر الساعة العادية (${currency})`,
    `سعر الساعة الإضافية (${currency})`,
    'إجمالي الساعات الإضافية (ساعة)',
    `قيمة الاستحقاق الإضافي (${currency})`,
    `صافي الراتب المستحق للصرف (${currency})`,
    'عدد مرات الإضافي',
    'تواريخ تسجيل الإضافي (مرتبة زمنياً)',
  ];

  const summaryRows = employeeItems.map((item, idx) => [
    idx + 1,
    `"${item.name.replace(/"/g, '""')}"`,
    `"${item.jobTitle.replace(/"/g, '""')}"`,
    `"${item.department.replace(/"/g, '""')}"`,
    item.monthlySalary.toFixed(2),
    item.baseHourlyRate.toFixed(2),
    item.overtimeHourlyRate.toFixed(2),
    item.totalOvertimeHours,
    item.totalOvertimeAmount.toFixed(2),
    item.netSalary.toFixed(2),
    item.recordsCount,
    `"${item.datesList.join(' | ')}"`,
  ]);

  // Totals row for Section 1
  const totalBaseSalaries = employeeItems.reduce((acc, i) => acc + i.monthlySalary, 0);
  const totalOtHours = employeeItems.reduce((acc, i) => acc + i.totalOvertimeHours, 0);
  const totalOtPayout = employeeItems.reduce((acc, i) => acc + i.totalOvertimeAmount, 0);
  const grandNetSalary = employeeItems.reduce((acc, i) => acc + i.netSalary, 0);

  const summaryTotalsRow = [
    '"المجموع الإجمالي"',
    `"عدد الموظفين: ${employeeItems.length}"`,
    '""',
    '""',
    totalBaseSalaries.toFixed(2),
    '""',
    '""',
    totalOtHours.toFixed(1),
    totalOtPayout.toFixed(2),
    grandNetSalary.toFixed(2),
    employeeItems.reduce((acc, i) => acc + i.recordsCount, 0),
    '""',
  ];

  // SECTION 2: سجل الحركات التفصيلية للساعات الإضافية مرتبة حسب التاريخ تصاعدياً
  const detailSectionHeader = ['"--- ثانياً: تفاصيل حركات الساعات الإضافية مرتبة حسب التاريخ تصاعدياً ---"'];
  const detailHeaders = [
    'تاريخ العمل الإضافي',
    'اسم الموظف',
    'المسمى الوظيفي',
    'القسم',
    'من الساعة',
    'إلى الساعة',
    'عدد الساعات',
    'معامل الاحتساب',
    `سعر الساعة العادية (${currency})`,
    `سعر الساعة الإضافية (${currency})`,
    `إجمالي المبلغ المستحق (${currency})`,
    'حالة الاعتماد',
    'سبب العمل الإضافي',
    'ملاحظات إدارية للمدراء',
  ];

  const detailRows = filteredRecords.map((r) => [
    r.date,
    `"${(r.employeeName || '').replace(/"/g, '""')}"`,
    `"${(r.jobTitle || '').replace(/"/g, '""')}"`,
    `"${(r.department || '').replace(/"/g, '""')}"`,
    r.startTime,
    r.endTime,
    r.hours,
    `${r.multiplier}x`,
    r.baseHourlyRate.toFixed(2),
    r.overtimeHourlyRate.toFixed(2),
    r.totalAmount.toFixed(2),
    `"${r.status}"`,
    `"${(r.reason || '').replace(/"/g, '""')}"`,
    `"${(r.notes || '').replace(/"/g, '""')}"`,
  ]);

  // Combine all lines
  const allLines = [
    titleRow.join(','),
    emptyRow.join(','),
    summarySectionHeader.join(','),
    summaryHeaders.join(','),
    ...summaryRows.map((r) => r.join(',')),
    summaryTotalsRow.join(','),
    emptyRow.join(','),
    emptyRow.join(','),
    detailSectionHeader.join(','),
    detailHeaders.join(','),
    ...detailRows.map((r) => r.join(',')),
  ];

  const csvContent = '\uFEFF' + allLines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute(
    'download',
    `ZeroSoft_مسير_الرواتب_الشهري_والإضافي_${monthStr}_${dateStr}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
