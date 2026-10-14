/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LoginPage } from './components/LoginPage';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { OvertimeView } from './components/OvertimeView';
import { EmployeesView } from './components/EmployeesView';
import { UsersView } from './components/UsersView';
import { BackupView } from './components/BackupView';
import { OvertimeSettingsView } from './components/OvertimeSettingsView';
import { CalculatorModal } from './components/CalculatorModal';
import { PrintReportModal } from './components/PrintReportModal';
import { MonthlyPayrollExportModal } from './components/MonthlyPayrollExportModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { OvertimeRecord } from './types';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const MainApp: React.FC = () => {
  const { currentUser, toasts, removeToast } = useApp();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Modals state
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  const [singleVoucherToPrint, setSingleVoucherToPrint] = useState<OvertimeRecord | null>(null);

  // Quick navigation flags
  const [openAddOvertimeTrigger, setOpenAddOvertimeTrigger] = useState(false);
  const [openAddEmployeeTrigger, setOpenAddEmployeeTrigger] = useState(false);

  // If user is not authenticated, show the rich Login screen
  if (!currentUser) {
    return (
      <>
        <LoginPage />
        <OfflineIndicator />
        <ToastsContainer toasts={toasts} onRemove={removeToast} />
      </>
    );
  }

  const handlePrintFullReport = () => {
    setSingleVoucherToPrint(null);
    setIsPrintModalOpen(true);
  };

  const handlePrintSingleVoucher = (rec: OvertimeRecord) => {
    setSingleVoucherToPrint(rec);
    setIsPrintModalOpen(true);
  };

  const handleOpenAddOvertime = () => {
    setCurrentTab('overtime');
    setOpenAddOvertimeTrigger(true);
  };

  const handleOpenAddEmployee = () => {
    setCurrentTab('employees');
    setOpenAddEmployeeTrigger(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white pb-20 lg:pb-8">
      {/* Top Navbar */}
      <div className="no-print">
        <Navbar
          currentTab={currentTab}
          setCurrentTab={(tab) => {
            setCurrentTab(tab);
            setOpenAddOvertimeTrigger(false);
            setOpenAddEmployeeTrigger(false);
          }}
          onOpenCalculator={() => setIsCalculatorOpen(true)}
          onOpenPayrollExport={() => setIsPayrollModalOpen(true)}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            onNavigate={(tab) => setCurrentTab(tab)}
            onOpenAddOvertime={handleOpenAddOvertime}
            onOpenAddEmployee={handleOpenAddEmployee}
            onOpenCalculator={() => setIsCalculatorOpen(true)}
            onPrintReport={handlePrintFullReport}
            onOpenPayrollExport={() => setIsPayrollModalOpen(true)}
          />
        )}

        {currentTab === 'overtime' && (
          <OvertimeView
            initialOpenAdd={openAddOvertimeTrigger}
            onPrintReport={handlePrintFullReport}
            onPrintSingleVoucher={handlePrintSingleVoucher}
            onOpenPayrollExport={() => setIsPayrollModalOpen(true)}
            onNavigateToOvertimeSettings={() => setCurrentTab('overtime-settings')}
          />
        )}

        {currentTab === 'overtime-settings' && (
          <OvertimeSettingsView
            onNavigateToOvertime={() => setCurrentTab('overtime')}
          />
        )}

        {currentTab === 'employees' && (
          <EmployeesView initialOpenAdd={openAddEmployeeTrigger} />
        )}

        {currentTab === 'users' && <UsersView />}

        {currentTab === 'backup' && <BackupView />}
      </main>

      {/* Interactive Overtime Calculator Modal */}
      <CalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        onSelectAndRecord={(empId, hours) => {
          setCurrentTab('overtime');
          setOpenAddOvertimeTrigger(true);
        }}
      />

      {/* Monthly Payroll CSV Export Modal */}
      <MonthlyPayrollExportModal
        isOpen={isPayrollModalOpen}
        onClose={() => setIsPayrollModalOpen(false)}
      />

      {/* Printable PDF & Voucher Modal */}
      <PrintReportModal
        isOpen={isPrintModalOpen}
        onClose={() => {
          setIsPrintModalOpen(false);
          setSingleVoucherToPrint(null);
        }}
        singleRecord={singleVoucherToPrint}
      />

      {/* Offline Status Warning Pill */}
      <div className="no-print">
        <OfflineIndicator />
      </div>

      {/* Floating Interactive Toast Notifications */}
      <div className="no-print">
        <ToastsContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </div>
  );
};

// Toasts Notification Toast Container
const ToastsContainer: React.FC<{
  toasts: Array<{ id: string; type: 'success' | 'error' | 'info'; message: string }>;
  onRemove: (id: string) => void;
}> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl shadow-2xl text-xs font-semibold backdrop-blur-md border animate-in slide-in-from-left duration-200 ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40'
              : toast.type === 'error'
              ? 'bg-rose-950/90 text-rose-200 border-rose-500/40'
              : 'bg-cyan-950/90 text-cyan-200 border-cyan-500/40'
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-cyan-400 shrink-0" />}
            <span className="leading-snug">{toast.message}</span>
          </div>
          <button
            onClick={() => onRemove(toast.id)}
            className="p-1 rounded-lg hover:bg-white/10 transition text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
