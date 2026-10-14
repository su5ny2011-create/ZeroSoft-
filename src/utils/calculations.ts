import { Employee } from '../types';

/**
 * Calculates duration in hours between two HH:MM time strings.
 * Handles shifts crossing midnight if necessary.
 */
export function calculateHoursBetween(startTime: string, endTime: string): number {
  if (!startTime || !endTime) return 8;
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  
  if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) return 8;
  
  let startMinutes = startH * 60 + startM;
  let endMinutes = endH * 60 + endM;
  
  if (endMinutes < startMinutes) {
    // Crosses midnight
    endMinutes += 24 * 60;
  }
  
  const diffHours = (endMinutes - startMinutes) / 60;
  return Math.max(0, parseFloat(diffHours.toFixed(2)));
}

/**
 * Calculates the standard base hourly wage of an employee.
 * Formula: Monthly Salary / (Monthly Working Days * Daily Work Hours)
 */
export function calculateEmployeeHourlyRate(
  monthlySalary: number,
  monthlyWorkingDays: number = 26,
  dailyWorkHours: number = 8
): number {
  const safeDays = monthlyWorkingDays > 0 ? monthlyWorkingDays : 26;
  const safeHours = dailyWorkHours > 0 ? dailyWorkHours : 8;
  const totalMonthlyHours = safeDays * safeHours;
  
  if (totalMonthlyHours <= 0 || monthlySalary <= 0) return 0;
  const rate = monthlySalary / totalMonthlyHours;
  return parseFloat(rate.toFixed(3));
}

/**
 * Calculates overtime hourly rate:
 * 1 hour of overtime = 1.5 standard base hourly wage (ساعة ونص من أصل سعر الساعة)
 */
export function calculateOvertimeRate(baseHourlyRate: number, multiplier: number = 1.5): number {
  const rate = baseHourlyRate * multiplier;
  return parseFloat(rate.toFixed(3));
}

/**
 * Calculates total overtime amount.
 */
export function calculateOvertimeTotal(
  hours: number,
  baseHourlyRate: number,
  multiplier: number = 1.5
): number {
  const otRate = calculateOvertimeRate(baseHourlyRate, multiplier);
  const total = hours * otRate;
  return parseFloat(total.toFixed(2));
}

/**
 * Formats a currency number with clean 2 or 3 decimals.
 */
export function formatMoney(amount: number, currency: string = 'JD'): string {
  const safeCurrency = (!currency || currency === '$' || currency === 'USD') ? 'JD' : currency;
  const formatted = (amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${formatted} ${safeCurrency}`;
}

/**
 * Formats date into readable Arabic string.
 */
export function formatDateArabic(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ar-JO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}
