import React, { createContext, useContext, useState, useEffect } from 'react';
import { Employee, OvertimeRecord, User, SystemSettings, BackupData } from '../types';
import { initialEmployees, initialOvertimeRecords, initialSettings, initialUsers } from '../data/initialData';
import { calculateEmployeeHourlyRate, calculateOvertimeRate, calculateOvertimeTotal } from '../utils/calculations';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  currentUser: User | null;
  users: User[];
  employees: Employee[];
  overtimeRecords: OvertimeRecord[];
  settings: SystemSettings;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => boolean;
  updateUser: (user: User) => boolean;
  deleteUser: (id: string) => { success: boolean; message?: string };
  changePassword: (userId: string, newPass: string) => boolean;
  addEmployee: (employee: Omit<Employee, 'id' | 'createdAt'>) => void;
  updateEmployee: (employee: Employee) => void;
  deleteEmployee: (id: string) => void;
  addOvertime: (record: Omit<OvertimeRecord, 'id' | 'createdAt' | 'baseHourlyRate' | 'overtimeHourlyRate' | 'totalAmount'>) => void;
  updateOvertime: (record: OvertimeRecord) => void;
  deleteOvertime: (id: string) => void;
  recalculateAllOvertime: (regularMult?: number, holidayMult?: number) => { count: number; totalDelta: number };
  updateOvertimeRates: (params: { defaultMultiplier: number; holidayMultiplier: number; recalculateAll?: boolean }) => void;
  batchUpdateOvertimeMultiplier: (ids: string[], newMultiplier: number, newType?: any) => void;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  resetToDefaultData: () => void;
  importBackupData: (backup: BackupData, mode: 'replace' | 'merge') => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CURRENT_USER: 'zerosoft_current_user_v1',
  USERS: 'zerosoft_users_v1',
  EMPLOYEES: 'zerosoft_employees_v1',
  OVERTIME: 'zerosoft_overtime_v1',
  SETTINGS: 'zerosoft_settings_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialUsers;
      }
    }
    return initialUsers;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialEmployees;
      }
    }
    return initialEmployees;
  });

  const [overtimeRecords, setOvertimeRecords] = useState<OvertimeRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.OVERTIME);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialOvertimeRecords;
      }
    }
    return initialOvertimeRecords;
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.currency || parsed.currency === '$' || parsed.currency === 'USD' || parsed.currency === 'د.أ' || parsed.currency === 'دينار أردني') {
          parsed.currency = 'JD';
        }
        if (parsed.defaultMultiplier === undefined) {
          parsed.defaultMultiplier = 1.5;
        }
        if (parsed.holidayMultiplier === undefined) {
          parsed.holidayMultiplier = 2.0;
        }
        if (parsed.maxMonthlyOvertimeHours === undefined) {
          parsed.maxMonthlyOvertimeHours = 30;
        }
        if (parsed.enableOvertimeCapAlert === undefined) {
          parsed.enableOvertimeCapAlert = true;
        }
        return {
          ...initialSettings,
          ...parsed,
          companyName: 'ZeroSoft', // اسم البرنامج ثابت لا يمكن التعديل
          supportPhone: '00962790797342', // رقم الهاتف ثابت للتواصل
        };
      } catch {
        return initialSettings;
      }
    }
    return initialSettings;
  });

  const [toasts, setToasts] = useState<Toast[]>([]);

  // Persistent storage synchronizer
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.OVERTIME, JSON.stringify(overtimeRecords));
  }, [overtimeRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const login = (username: string, pass: string): boolean => {
    const trimmedUser = username.trim();
    const found = users.find(
      (u) => u.username.toLowerCase() === trimmedUser.toLowerCase() && u.password === pass
    );
    if (found) {
      setCurrentUser(found);
      showToast(`أهلاً وسهلاً بك، ${found.name}`, 'success');
      return true;
    }
    showToast('اسم المستخدم أو كلمة المرور غير صحيحة', 'error');
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    showToast('تم تسجيل الخروج بنجاح', 'info');
  };

  // User management
  const addUser = (userData: Omit<User, 'id' | 'createdAt'>): boolean => {
    const exists = users.some(
      (u) => u.username.toLowerCase() === userData.username.trim().toLowerCase()
    );
    if (exists) {
      showToast('اسم المستخدم هذا مستخدم بالفعل', 'error');
      return false;
    }
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      username: userData.username.trim(),
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setUsers((prev) => [...prev, newUser]);
    showToast(`تمت إضافة المستخدم "${newUser.name}" بنجاح`, 'success');
    return true;
  };

  const updateUser = (updatedUser: User): boolean => {
    const duplicate = users.some(
      (u) => u.id !== updatedUser.id && u.username.toLowerCase() === updatedUser.username.trim().toLowerCase()
    );
    if (duplicate) {
      showToast('اسم المستخدم مستخدم لحساب آخر', 'error');
      return false;
    }
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    if (currentUser?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
    showToast('تم تحديث بيانات المستخدم بنجاح', 'success');
    return true;
  };

  const deleteUser = (id: string): { success: boolean; message?: string } => {
    if (currentUser?.id === id) {
      showToast('لا يمكن حذف حساب المستخدم النشط حالياً', 'error');
      return { success: false, message: 'لا يمكن حذف الحساب المسجل به حالياً' };
    }
    if (users.length <= 1) {
      showToast('يجب أن يبقى مستخدم واحد على الأقل في النظام', 'error');
      return { success: false, message: 'لا يمكن حذف آخر مستخدم في النظام' };
    }
    const userToDelete = users.find((u) => u.id === id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
    showToast(`تم حذف المستخدم "${userToDelete?.name || ''}" بنجاح`, 'info');
    return { success: true };
  };

  const changePassword = (userId: string, newPass: string): boolean => {
    if (!newPass || newPass.trim().length === 0) {
      showToast('كلمة المرور الجديدة لا يمكن أن تكون فارغة', 'error');
      return false;
    }
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, password: newPass.trim() } : u))
    );
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, password: newPass.trim() } : null));
    }
    showToast('تم تغيير كلمة المرور بنجاح', 'success');
    return true;
  };

  // Employee management
  const addEmployee = (empData: Omit<Employee, 'id' | 'createdAt'>) => {
    const newEmp: Employee = {
      ...empData,
      id: `emp-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setEmployees((prev) => [newEmp, ...prev]);
    showToast(`تمت إضافة الموظف "${newEmp.name}" بنجاح`, 'success');
  };

  const updateEmployee = (emp: Employee) => {
    setEmployees((prev) => prev.map((e) => (e.id === emp.id ? emp : e)));
    // Also update any matching overtime records with new name/jobTitle/department
    setOvertimeRecords((prev) =>
      prev.map((ot) => {
        if (ot.employeeId === emp.id) {
          const newBase = calculateEmployeeHourlyRate(
            emp.monthlySalary,
            emp.monthlyWorkingDays,
            emp.dailyWorkHours
          );
          const newOtRate = calculateOvertimeRate(newBase, ot.multiplier);
          return {
            ...ot,
            employeeName: emp.name,
            jobTitle: emp.jobTitle,
            department: emp.department,
            baseHourlyRate: newBase,
            overtimeHourlyRate: newOtRate,
            totalAmount: parseFloat((ot.hours * newOtRate).toFixed(2)),
          };
        }
        return ot;
      })
    );
    showToast(`تم تحديث بيانات الموظف "${emp.name}" بنجاح`, 'success');
  };

  const deleteEmployee = (id: string) => {
    const emp = employees.find((e) => e.id === id);
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    // Optionally keep or purge overtime
    showToast(`تم حذف الموظف "${emp?.name || ''}" بنجاح`, 'info');
  };

  // Overtime management
  // Overtime management
  const addOvertime = (
    data: Omit<OvertimeRecord, 'id' | 'createdAt' | 'baseHourlyRate' | 'overtimeHourlyRate' | 'totalAmount'>
  ) => {
    const emp = employees.find((e) => e.id === data.employeeId);
    const baseRate = emp
      ? calculateEmployeeHourlyRate(emp.monthlySalary, emp.monthlyWorkingDays, emp.dailyWorkHours)
      : 3.5;
    const mult = data.multiplier ?? (data.overtimeType === 'holiday' ? settings.holidayMultiplier : settings.defaultMultiplier);
    const otRate = calculateOvertimeRate(baseRate, mult);
    const total = calculateOvertimeTotal(data.hours, baseRate, mult);

    const newRecord: OvertimeRecord = {
      ...data,
      id: `ot-${Date.now()}`,
      multiplier: mult,
      baseHourlyRate: baseRate,
      overtimeHourlyRate: otRate,
      totalAmount: total,
      createdAt: new Date().toISOString(),
    };

    setOvertimeRecords((prev) => [newRecord, ...prev]);
    showToast(`تم تسجيل ${data.hours} ساعة إضافية للموظف ${data.employeeName} بقيمة ${total} ${settings.currency}`, 'success');
  };

  const updateOvertime = (rec: OvertimeRecord) => {
    const emp = employees.find((e) => e.id === rec.employeeId);
    const baseRate = emp
      ? calculateEmployeeHourlyRate(emp.monthlySalary, emp.monthlyWorkingDays, emp.dailyWorkHours)
      : rec.baseHourlyRate || 3.5;
    const mult = rec.multiplier || settings.defaultMultiplier || 1.5;
    const otRate = calculateOvertimeRate(baseRate, mult);
    const total = calculateOvertimeTotal(rec.hours, baseRate, mult);

    const updated: OvertimeRecord = {
      ...rec,
      baseHourlyRate: baseRate,
      multiplier: mult,
      overtimeHourlyRate: otRate,
      totalAmount: total,
    };

    setOvertimeRecords((prev) => prev.map((item) => (item.id === rec.id ? updated : item)));
    showToast('تم تحديث سجل الساعات الإضافية بنجاح', 'success');
  };

  const deleteOvertime = (id: string) => {
    setOvertimeRecords((prev) => prev.filter((item) => item.id !== id));
    showToast('تم حذف سجل الساعات الإضافية بنجاح', 'info');
  };

  /**
   * Recalculates all overtime records across the entire app based on new multipliers and employee hourly rates.
   * Modifies the whole program's overtime history.
   */
  const recalculateAllOvertime = (regularMult?: number, holidayMult?: number): { count: number; totalDelta: number } => {
    const regMult = regularMult ?? settings.defaultMultiplier ?? 1.5;
    const holMult = holidayMult ?? settings.holidayMultiplier ?? 2.0;

    let count = 0;
    let oldTotal = 0;
    let newTotal = 0;

    setOvertimeRecords((prev) => {
      return prev.map((rec) => {
        oldTotal += rec.totalAmount || 0;
        const isHoliday = rec.overtimeType === 'holiday' || (rec.multiplier >= 2.0 && rec.overtimeType !== 'regular');
        const targetMult = isHoliday ? holMult : regMult;
        const targetType = isHoliday ? 'holiday' : (rec.overtimeType || 'regular');

        const emp = employees.find((e) => e.id === rec.employeeId);
        const baseRate = emp
          ? calculateEmployeeHourlyRate(emp.monthlySalary, emp.monthlyWorkingDays, emp.dailyWorkHours)
          : rec.baseHourlyRate || 3.5;

        const otRate = calculateOvertimeRate(baseRate, targetMult);
        const totalAmount = calculateOvertimeTotal(rec.hours, baseRate, targetMult);

        count++;
        newTotal += totalAmount;

        return {
          ...rec,
          overtimeType: targetType,
          multiplier: targetMult,
          baseHourlyRate: baseRate,
          overtimeHourlyRate: otRate,
          totalAmount,
        };
      });
    });

    const totalDelta = parseFloat((newTotal - oldTotal).toFixed(2));
    showToast(`تم تحديث وإعادة احتساب ${count} سجل إضافي على كامل البرنامج بنجاح (${regMult}× للعادي، ${holMult}× للعطل)`, 'success');
    return { count, totalDelta };
  };

  /**
   * Saves new overtime rates with optional full-program recalculation
   */
  const updateOvertimeRates = ({
    defaultMultiplier,
    holidayMultiplier,
    recalculateAll = false,
  }: {
    defaultMultiplier: number;
    holidayMultiplier: number;
    recalculateAll?: boolean;
  }) => {
    const updatedSettings: SystemSettings = {
      ...settings,
      defaultMultiplier,
      holidayMultiplier,
    };
    setSettings(updatedSettings);

    if (recalculateAll) {
      recalculateAllOvertime(defaultMultiplier, holidayMultiplier);
    } else {
      showToast(`تم حفظ معايير الإضافي بنجاح (العادي: ${defaultMultiplier}×، الإجازات: ${holidayMultiplier}×)`, 'success');
    }
  };

  /**
   * Updates multiplier on specific selected records
   */
  const batchUpdateOvertimeMultiplier = (
    ids: string[],
    newMultiplier: number,
    newType?: any
  ) => {
    setOvertimeRecords((prev) =>
      prev.map((rec) => {
        if (!ids.includes(rec.id)) return rec;
        const emp = employees.find((e) => e.id === rec.employeeId);
        const baseRate = emp
          ? calculateEmployeeHourlyRate(emp.monthlySalary, emp.monthlyWorkingDays, emp.dailyWorkHours)
          : rec.baseHourlyRate || 3.5;
        const otRate = calculateOvertimeRate(baseRate, newMultiplier);
        const totalAmount = calculateOvertimeTotal(rec.hours, baseRate, newMultiplier);
        return {
          ...rec,
          multiplier: newMultiplier,
          overtimeType: newType || (newMultiplier >= 2.0 ? 'holiday' : 'regular'),
          baseHourlyRate: baseRate,
          overtimeHourlyRate: otRate,
          totalAmount,
        };
      })
    );
    showToast(`تم تعديل معامل الاحتساب لـ ${ids.length} سجل إلى ${newMultiplier}× بنجاح`, 'success');
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
      companyName: 'ZeroSoft', // اسم البرنامج ثابت لا يمكن التعديل
      supportPhone: '00962790797342', // رقم الهاتف ثابت للتواصل
    }));
    showToast('تم حفظ الإعدادات بنجاح', 'success');
  };

  const resetToDefaultData = () => {
    setUsers(initialUsers);
    setEmployees(initialEmployees);
    setOvertimeRecords(initialOvertimeRecords);
    setSettings(initialSettings);
    showToast('تمت استعادة البيانات الافتراضية بنجاح', 'success');
  };

  const importBackupData = (backup: BackupData, mode: 'replace' | 'merge'): boolean => {
    try {
      if (!backup || !backup.employees || !backup.overtimeRecords) {
        showToast('ملف النسخة الاحتياطية غير صالح أو تالف', 'error');
        return false;
      }

      if (mode === 'replace') {
        if (backup.settings) {
          setSettings({
            ...backup.settings,
            companyName: 'ZeroSoft', // اسم البرنامج ثابت لا يمكن التعديل
            supportPhone: '00962790797342', // رقم الهاتف ثابت للتواصل
          });
        }
        if (backup.users && backup.users.length > 0) setUsers(backup.users);
        setEmployees(backup.employees);
        setOvertimeRecords(backup.overtimeRecords);
        showToast('تم استبدال واستعادة كافة البيانات من النسخة الاحتياطية بنجاح', 'success');
      } else {
        // Merge
        setEmployees((prev) => {
          const map = new Map(prev.map((e) => [e.id, e]));
          backup.employees.forEach((e) => map.set(e.id, e));
          return Array.from(map.values());
        });

        setOvertimeRecords((prev) => {
          const map = new Map(prev.map((o) => [o.id, o]));
          backup.overtimeRecords.forEach((o) => map.set(o.id, o));
          return Array.from(map.values());
        });

        if (backup.users) {
          setUsers((prev) => {
            const map = new Map(prev.map((u) => [u.username, u]));
            backup.users.forEach((u) => map.set(u.username, u));
            return Array.from(map.values());
          });
        }
        showToast('تم دمج بيانات النسخة الاحتياطية بنجاح', 'success');
      }
      return true;
    } catch {
      showToast('حدث خطأ أثناء قراءة ملف النسخة الاحتياطية', 'error');
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        employees,
        overtimeRecords,
        settings,
        toasts,
        showToast,
        removeToast,
        login,
        logout,
        addUser,
        updateUser,
        deleteUser,
        changePassword,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        addOvertime,
        updateOvertime,
        deleteOvertime,
        recalculateAllOvertime,
        updateOvertimeRates,
        batchUpdateOvertimeMultiplier,
        updateSettings,
        resetToDefaultData,
        importBackupData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
