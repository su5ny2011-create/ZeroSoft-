import React, { useState } from 'react';
import { 
  Clock, 
  Users, 
  CalendarClock, 
  LayoutDashboard, 
  Shield, 
  Database, 
  LogOut, 
  Calculator, 
  Menu, 
  X, 
  Sparkles,
  FileSpreadsheet,
  Sliders
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PWAInstallButton } from './PWAInstallButton';
import { ZeroSoftLogo } from './ZeroSoftLogo';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenCalculator: () => void;
  onOpenPayrollExport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onOpenCalculator, onOpenPayrollExport }) => {
  const { currentUser, logout, settings } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'overtime', label: 'تسجيل وحساب الإضافي', icon: CalendarClock },
    { id: 'overtime-settings', label: 'تعديل الساعات الإضافية', icon: Sliders },
    { id: 'employees', label: 'إدارة الموظفين', icon: Users },
    { id: 'users', label: 'المستخدمين', icon: Shield },
    { id: 'backup', label: 'النسخ الاحتياطي', icon: Database },
  ];

  const handleTabClick = (tabId: string) => {
    setCurrentTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Right Side (in RTL): Brand Logo & Name */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none transition"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              <div className="flex items-center gap-2">
                <ZeroSoftLogo 
                  size="md"
                  onClick={() => setCurrentTab('dashboard')}
                  subtitle="إدارة الساعات الإضافية والرواتب"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentTab('overtime-settings');
                  }}
                  className="hidden sm:inline-flex px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 transition cursor-pointer"
                  title="تعديل معايير الساعات الإضافية"
                >
                  {settings.defaultMultiplier || 1.5}× | عطل {settings.holidayMultiplier || 2.0}×
                </button>
              </div>

              {/* Desktop Nav Tabs */}
              <nav className="hidden lg:flex items-center gap-1 mr-6">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabClick(item.id)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Left Side (in RTL): Action buttons, PWA, User Info, Calculator */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Monthly Payroll CSV Export Button */}
              <button
                onClick={onOpenPayrollExport}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/90 text-emerald-400 border border-slate-700 text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer"
                title="تصدير كشف مسير الرواتب الشهري التفصيلي (CSV)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>مسير الرواتب CSV</span>
              </button>

              {/* Quick Calculator Button */}
              <button
                onClick={onOpenCalculator}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/90 text-cyan-300 border border-slate-700 text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer"
                title="حاسبة الساعات الإضافية السريعة (1.5x)"
              >
                <Calculator className="w-3.5 h-3.5 text-cyan-400" />
                <span>حاسبة 1.5×</span>
              </button>

              {/* PWA Install Button */}
              <PWAInstallButton />

              {/* User Profile Badge */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-white flex items-center justify-end gap-1">
                    <span>{currentUser?.name}</span>
                  </div>
                  <span className="text-[10px] text-cyan-400/90 font-mono">
                    {currentUser?.role === 'admin' ? 'مدير النظام (Admin)' : 'مشرف (Manager)'}
                  </span>
                </div>

                <button
                  onClick={logout}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition cursor-pointer"
                  title="تسجيل الخروج"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 pt-3 pb-4 space-y-2 animate-in slide-in-from-top-2">
            <div className="p-3 mb-2 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">{currentUser?.name}</p>
                <p className="text-[11px] text-cyan-400 font-mono">
                  {currentUser?.role === 'admin' ? 'مدير النظام' : 'مشرف'}
                </p>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>تسجيل الخروج</span>
              </button>
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <button
              onClick={() => {
                onOpenPayrollExport();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-emerald-300 bg-slate-800/80 hover:bg-slate-800 border border-slate-700"
            >
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              <span>كشف مسير الرواتب الشهري (CSV)</span>
            </button>

            <button
              onClick={() => {
                onOpenCalculator();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-cyan-300 bg-slate-800/80 hover:bg-slate-800 border border-slate-700"
            >
              <Calculator className="w-5 h-5 text-cyan-400" />
              <span>حاسبة الساعات الإضافية (1.5×)</span>
            </button>
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation Bar for Native-App Feeling on Smartphones */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition cursor-pointer ${
                isActive ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-cyan-500/20' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium mt-0.5 whitespace-nowrap">
                {item.label.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
