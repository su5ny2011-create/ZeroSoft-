import React from 'react';
import { useApp } from '../context/AppContext';

interface ZeroSoftLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  onClick?: () => void;
  subtitle?: string;
  forceVector?: boolean;
}

export const ZeroSoftLogo: React.FC<ZeroSoftLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  onClick,
  subtitle = 'إدارة الساعات الإضافية والرواتب',
  forceVector = false
}) => {
  const { settings } = useApp();
  const customLogo = !forceVector && settings?.customLogo ? settings.customLogo : null;

  const sizeConfigs = {
    sm: {
      emblemSize: 'w-7 h-7',
      textSize: 'text-base',
      subtextSize: 'text-[9px]',
      gap: 'gap-2',
      badgeSize: 'text-[9px] px-1 py-0.5'
    },
    md: {
      emblemSize: 'w-10 h-10',
      textSize: 'text-lg',
      subtextSize: 'text-[10px]',
      gap: 'gap-2.5',
      badgeSize: 'text-[10px] px-1.5 py-0.5'
    },
    lg: {
      emblemSize: 'w-14 h-14',
      textSize: 'text-2xl',
      subtextSize: 'text-xs',
      gap: 'gap-3.5',
      badgeSize: 'text-xs px-2 py-0.5'
    },
    xl: {
      emblemSize: 'w-20 h-20',
      textSize: 'text-3xl',
      subtextSize: 'text-sm',
      gap: 'gap-4',
      badgeSize: 'text-sm px-2.5 py-1'
    }
  };

  const currentSize = sizeConfigs[size];

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center ${currentSize.gap} ${onClick ? 'cursor-pointer select-none group' : ''} ${className}`}
    >
      {/* Logo Emblem Container */}
      <div
        className={`${currentSize.emblemSize} relative rounded-xl shrink-0 p-0.5 shadow-lg shadow-cyan-500/20 bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 transition-all duration-300 ${
          onClick ? 'group-hover:scale-105 group-hover:shadow-cyan-500/40' : ''
        }`}
      >
        <div className="w-full h-full bg-slate-950 rounded-[10px] overflow-hidden flex items-center justify-center relative">
          {customLogo ? (
            <img
              src={customLogo}
              alt="ZeroSoft Logo"
              className="w-full h-full object-contain p-1"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // If custom logo image fails, fallback to vector
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            /* Official ZeroSoft Vector Logo Emblem */
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full p-1"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="logoZGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="45%" stopColor="#06b6d4" />
                  <stop offset="80%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
                <linearGradient id="arcGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
              </defs>

              {/* Inner Orbit Track */}
              <circle cx="50" cy="50" r="42" stroke="#1e293b" strokeWidth="2.5" strokeDasharray="4 3" />
              
              {/* Overtime Progress Arc (1.5x) */}
              <path
                d="M 50 8 A 42 42 0 0 1 92 50"
                stroke="url(#arcGrad)"
                strokeWidth="4"
                strokeLinecap="round"
              />

              {/* Ticks */}
              <circle cx="50" cy="12" r="2" fill="#38bdf8" />
              <circle cx="88" cy="50" r="2" fill="#38bdf8" />
              <circle cx="50" cy="88" r="2" fill="#38bdf8" />
              <circle cx="12" cy="50" r="2" fill="#38bdf8" />

              {/* Stylized Modern 'Z' Geometry */}
              <path
                d="M 28 26 L 70 26 C 73 26 75 29 74 33 L 68 41 C 67 43 64 45 61 45 L 43 45 L 69 66 C 73 69 72 74 67 74 L 25 74 C 22 74 20 71 21 67 L 27 59 C 28 57 31 55 34 55 L 53 55 L 27 34 C 23 31 24 26 28 26 Z"
                fill="url(#logoZGrad)"
              />

              {/* Center Core Pulsing Circuit Node */}
              <circle cx="50" cy="50" r="5" fill="#38bdf8" stroke="#090f1e" strokeWidth="2" />
              <circle cx="50" cy="50" r="2" fill="#ffffff" />
            </svg>
          )}
        </div>
      </div>

      {/* Brand Text & Identity */}
      {showText && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-black tracking-wider text-white ${currentSize.textSize} drop-shadow-sm`}>
              ZERO<span className="text-cyan-400">SOFT</span>
            </span>
            <span
              className={`font-mono font-bold rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 ${currentSize.badgeSize}`}
              title="نظام احتساب الساعات الإضافية 1.5x"
            >
              1.5×
            </span>
          </div>
          {subtitle && (
            <span className={`text-slate-400 font-medium block leading-tight mt-0.5 ${currentSize.subtextSize}`}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
