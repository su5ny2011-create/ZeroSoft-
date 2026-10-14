export type UserRole = 'admin' | 'manager' | 'viewer';

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
}

export interface Employee {
  id: string;
  name: string;
  jobTitle: string; // المسمى الوظيفي
  department: string; // القسم
  monthlySalary: number; // راتب الموظف الشهري
  workStartTime: string; // ساعات الدوام من (e.g. 08:00)
  workEndTime: string; // ساعات الدوام إلى (e.g. 16:00)
  dailyWorkHours: number; // ساعات العمل اليومية
  monthlyWorkingDays: number; // أيام العمل في الشهر (افتراضي 26 أو 30)
  phone: string;
  nationalId?: string;
  hireDate?: string;
  isActive: boolean;
  notes?: string;
  customMaxOvertimeHours?: number; // حد أقصى مخصص لساعات الإضافي شهرياً للموظف لمنع تجاوز الحد
  createdAt: string;
}

export type OvertimeStatus = 'معتمد' | 'معلق' | 'مصروف';

export type OvertimeType = 'regular' | 'holiday' | 'night' | 'custom';

export interface OvertimeRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  jobTitle: string;
  department: string;
  date: string; // YYYY-MM-DD
  startTime: string; // من الساعة
  endTime: string; // إلى الساعة
  hours: number; // عدد الساعات
  overtimeType?: OvertimeType; // نوع الإضافي (عادي، إجازة/عطلة، ليلي، مخصص)
  multiplier: number; // معامل الإضافي (اختياري: 1x ساعة بساعة، 1.5x ساعة ونص، 2x ساعتين، إلخ)
  baseHourlyRate: number; // أجر الساعة العادية
  overtimeHourlyRate: number; // أجر الساعة الإضافية
  totalAmount: number; // المبلغ الإجمالي المستحق
  reason: string; // سبب العمل الإضافي
  notes?: string; // ملاحظات إدارية اختيارية (تعليقات المدراء، تفاصيل إدارية، إلخ)
  status: OvertimeStatus;
  approvedBy?: string;
  createdAt: string;
}

export interface SystemSettings {
  companyName: string;
  currency: string;
  defaultDailyHours: number;
  defaultMonthlyDays: number;
  supportPhone: string;
  defaultMultiplier: number; // معامل الساعة الإضافية العادية (1x, 1.5x, 2x...)
  holidayMultiplier: number; // معامل ساعة يوم الإجازة والعطل الرسمية (1.5x, 2x, 2.5x...)
  nightMultiplier?: number; // معامل الساعات الليلية
  customLogo?: string; // صورة الشعار المخصصة (Data URL أو مسار الصورة)
  maxMonthlyOvertimeHours?: number; // الحد الأقصى لساعات الإضافي الشهرية للموظف (مثلاً 30 أو 40 ساعة)
  enableOvertimeCapAlert?: boolean; // تفعيل خاصية التنبيه عند تجاوز الحد الشهري لمنع الأخطاء
}

export interface BackupData {
  version: string;
  exportedAt: string;
  settings: SystemSettings;
  users: User[];
  employees: Employee[];
  overtimeRecords: OvertimeRecord[];
}
