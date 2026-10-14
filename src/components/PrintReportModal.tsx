import React, { useRef } from 'react';
import { Printer, X, Download, Clock, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OvertimeRecord } from '../types';
import { formatMoney, formatDateArabic } from '../utils/calculations';
import { ZeroSoftLogo } from './ZeroSoftLogo';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  singleRecord?: OvertimeRecord | null;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  singleRecord,
}) => {
  const { overtimeRecords, settings, employees } = useApp();

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const isSingle = !!singleRecord;
  const recordsToPrint = isSingle && singleRecord ? [singleRecord] : overtimeRecords;
  const totalHours = recordsToPrint.reduce((acc, r) => acc + r.hours, 0);
  const totalAmount = recordsToPrint.reduce((acc, r) => acc + r.totalAmount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div 
        className="w-full max-w-4xl rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar (Screen only) */}
        <div className="no-print p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-cyan-500/20 active:scale-95 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة المستند / حفظ PDF</span>
            </button>
            <span className="text-xs text-slate-400 hidden sm:inline">
              (يمكنك اختيار "Save as PDF" من خيارات الطابعة لحفظ الملف مباشرة)
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Area - Rendered in clean high-contrast printable document layout */}
        <div className="p-6 sm:p-10 bg-white text-slate-900 overflow-y-auto font-sans text-right" id="printable-report">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ZeroSoftLogo size="md" showText={false} />
              <div className="text-right">
                <h1 className="text-2xl font-black text-slate-900">{settings.companyName || 'ZeroSoft'}</h1>
                <p className="text-xs text-slate-600 mt-0.5">قسم الشؤون الإدارية والموارد البشرية</p>
                <p className="text-xs text-slate-600 font-mono dir-ltr">هاتف التواصل المعتمد: {settings.supportPhone || '00962790797342'}</p>
              </div>
            </div>

            <div className="text-left border-l-2 border-slate-200 pl-4">
              <div className="text-xs text-slate-500">منظومة ZeroSoft لإدارة الإضافي</div>
              <h2 className="text-lg font-extrabold text-blue-700">
                {isSingle ? 'سند استحقاق ساعات إضافية' : 'كشف مسير الساعات الإضافية الرسمي'}
              </h2>
              <div className="text-xs font-mono text-slate-700 mt-1">
                التاريخ: {new Date().toLocaleDateString('ar-JO')}
              </div>
            </div>
          </div>

          {/* Subtitle / Policy notice */}
          <div className="my-4 p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs text-slate-700">
            <span>
              <strong>معدل الاحتساب المعتمد:</strong> يتم احتساب الساعة الإضافية العادية بمعدل <strong>({settings.defaultMultiplier || 1.5}×)</strong> وأيام الإجازات والعطل بمعدل <strong>({settings.holidayMultiplier || 2.0}×)</strong> من أصل أجر الساعة العادية المستخرجة من الراتب.
            </span>
            <span className="font-mono font-bold text-slate-900">
              عدد السجلات: {recordsToPrint.length}
            </span>
          </div>

          {/* Records Table */}
          <div className="mt-4 overflow-hidden border border-slate-300 rounded-lg">
            <table className="w-full text-xs text-right border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800">
                  <th className="p-2 border-l border-slate-300">#</th>
                  <th className="p-2 border-l border-slate-300">اسم الموظف</th>
                  <th className="p-2 border-l border-slate-300">المسمى والقسم</th>
                  <th className="p-2 border-l border-slate-300">التاريخ</th>
                  <th className="p-2 border-l border-slate-300">التوقيت</th>
                  <th className="p-2 border-l border-slate-300 text-center">الساعات</th>
                  <th className="p-2 border-l border-slate-300">أجر الساعة</th>
                  <th className="p-2 border-l border-slate-300">المعامل</th>
                  <th className="p-2 border-l border-slate-300">المستحق</th>
                  <th className="p-2">السبب والملاحظات الإدارية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {recordsToPrint.map((r, i) => (
                  <tr key={r.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                    <td className="p-2 border-l border-slate-200 font-mono text-center">{i + 1}</td>
                    <td className="p-2 border-l border-slate-200 font-bold text-slate-900">{r.employeeName}</td>
                    <td className="p-2 border-l border-slate-200 text-slate-700">
                      <div>{r.jobTitle}</div>
                      <span className="text-[10px] text-slate-500">{r.department}</span>
                    </td>
                    <td className="p-2 border-l border-slate-200 font-mono">{r.date}</td>
                    <td className="p-2 border-l border-slate-200 font-mono text-[11px] dir-ltr text-right">
                      {r.startTime} - {r.endTime}
                    </td>
                    <td className="p-2 border-l border-slate-200 font-mono font-bold text-center text-blue-700">
                      {r.hours} س
                    </td>
                    <td className="p-2 border-l border-slate-200 font-mono text-slate-700">
                      {formatMoney(r.baseHourlyRate, settings.currency)}
                    </td>
                    <td className="p-2 border-l border-slate-200 font-mono text-center font-bold">
                      {r.multiplier}×
                    </td>
                    <td className="p-2 border-l border-slate-200 font-mono font-bold text-slate-900">
                      {formatMoney(r.totalAmount, settings.currency)}
                    </td>
                    <td className="p-2 text-slate-700 text-[11px]">
                      <div className="font-semibold text-slate-900">{r.reason || 'عمل إضافي'}</div>
                      {r.notes && (
                        <div className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200/80 rounded px-1.5 py-0.5 mt-0.5">
                          <span className="font-bold">ملاحظات: </span>
                          <span>{r.notes}</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-extrabold border-t-2 border-slate-400 text-slate-900">
                  <td colSpan={5} className="p-2.5 text-left border-l border-slate-300">
                    المجموع الكلي المستحق:
                  </td>
                  <td className="p-2.5 text-center font-mono border-l border-slate-300 text-blue-800">
                    {totalHours.toFixed(1)} ساعة
                  </td>
                  <td colSpan={2} className="p-2.5 border-l border-slate-300"></td>
                  <td colSpan={2} className="p-2.5 font-mono text-base text-blue-900">
                    {formatMoney(totalAmount, settings.currency)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Signature & Approval Block */}
          <div className="mt-12 pt-6 border-t-2 border-slate-300 grid grid-cols-3 gap-6 text-center text-xs">
            <div className="space-y-8">
              <span className="font-bold text-slate-700 block">إعداد ومراجعة المحاسب</span>
              <div className="border-b border-dashed border-slate-400 w-32 mx-auto"></div>
              <span className="text-[11px] text-slate-500">التوقيع والتاريخ</span>
            </div>

            <div className="space-y-8">
              <span className="font-bold text-slate-700 block">مدير الموارد البشرية</span>
              <div className="border-b border-dashed border-slate-400 w-32 mx-auto"></div>
              <span className="text-[11px] text-slate-500">الاعتماد الرسمي</span>
            </div>

            <div className="space-y-8">
              <span className="font-bold text-slate-700 block">المدير العام / المفوض</span>
              <div className="border-b border-dashed border-slate-400 w-32 mx-auto"></div>
              <span className="text-[11px] text-slate-500">الموافقة والصرف</span>
            </div>
          </div>

          {/* Document Footer */}
          <div className="mt-8 text-center text-[10px] text-slate-400 border-t border-slate-100 pt-3">
            تم استخراج هذا التقرير آلياً عبر نظام ZeroSoft لإدارة واحتساب الساعات الإضافية • جميع الحقوق محفوظة {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </div>
  );
};
