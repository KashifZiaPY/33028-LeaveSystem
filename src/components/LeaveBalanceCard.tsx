import React from 'react';
import { LeaveBalance, LeaveType } from '../types';
import { CalendarDays, Clock, HeartPulse, CheckCircle } from 'lucide-react';

interface LeaveBalanceCardProps {
  type: LeaveType;
  balanceData: LeaveBalance;
  onApplyClick?: () => void;
}

export const LeaveBalanceCard: React.FC<LeaveBalanceCardProps> = ({
  type,
  balanceData,
  onApplyClick,
}) => {
  const isCasual = type === 'CL';
  const title = isCasual ? 'Casual Leave (CL)' : 'Medical Leave (ML)';
  const subtitle = isCasual
    ? 'Standard urgent / short-term personal affairs'
    : 'Health, medical certificates & recovery';

  const allocated = Number(balanceData?.allocated || 0);
  const used = Number(balanceData?.used || 0);
  const pending = Number(balanceData?.pending || 0);
  const balance = Number(balanceData?.balance ?? (allocated - used - pending));

  const percentage = allocated > 0 ? Math.max(0, Math.min(100, Math.round((balance / allocated) * 100))) : 0;
  const usedPercentage = allocated > 0 ? Math.min(100, Math.round((used / allocated) * 100)) : 0;
  const pendingPercentage = allocated > 0 ? Math.min(100, Math.round((pending / allocated) * 100)) : 0;

  // SVG Circular Gauge calculations
  const size = 110;
  const strokeWidth = 10;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const themePrimary = isCasual ? 'from-blue-700 to-indigo-900' : 'from-emerald-700 to-teal-900';
  const ringColor = isCasual ? '#1a237e' : '#059669';
  const badgeBg = isCasual ? 'bg-indigo-50 text-indigo-900 border-indigo-200' : 'bg-emerald-50 text-emerald-900 border-emerald-200';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
      {/* Top Banner */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5">
            <div className={`p-2.5 rounded-xl text-white bg-gradient-to-br ${themePrimary} shadow-xs`}>
              {isCasual ? <CalendarDays className="w-5 h-5" /> : <HeartPulse className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-snug">{title}</h3>
              <p className="text-xs text-slate-500 line-clamp-1">{subtitle}</p>
            </div>
          </div>
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${badgeBg}`}>
            {type}
          </span>
        </div>

        {/* Ring Gauge & Balance Headline */}
        <div className="flex items-center justify-around py-3 px-1 my-2 bg-slate-50/70 rounded-xl border border-slate-100">
          <div className="relative flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
              {/* Background Ring */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                stroke="#e2e8f0"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              {/* Progress Ring */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                stroke={ringColor}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-slate-900 leading-none">
                {balance}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-0.5">
                Days Left
              </span>
            </div>
          </div>

          <div className="space-y-1.5 pl-2">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
                Available Quota
              </span>
              <span className="text-xl font-extrabold text-slate-800">
                {balance}{' '}
                <span className="text-xs font-medium text-slate-500">/ {allocated} days</span>
              </span>
            </div>
            <div className="text-xs text-slate-600 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ringColor }} />
              <span className="font-semibold text-slate-700">{percentage}%</span> quota remaining
            </div>
          </div>
        </div>

        {/* Mini breakdown grid */}
        <div className="grid grid-cols-3 gap-2 pt-2 text-center">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Allocated
            </span>
            <span className="text-base font-bold text-slate-800">{allocated}</span>
            <span className="text-[10px] text-slate-400 block">Total</span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Used
            </span>
            <span className="text-base font-bold text-rose-600">{used}</span>
            <span className="text-[10px] text-slate-400 block">{usedPercentage}%</span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Pending
            </span>
            <span className="text-base font-bold text-amber-600">{pending}</span>
            <span className="text-[10px] text-slate-400 block">{pendingPercentage}%</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      {onApplyClick && (
        <div className="bg-slate-50/90 border-t border-slate-100 px-5 py-3 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            {balance > 0 ? `${balance} days eligible to apply` : 'Quota exhausted'}
          </span>
          <button
            type="button"
            onClick={onApplyClick}
            className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition-colors shadow-xs ${
              balance > 0
                ? isCasual
                  ? 'bg-[#1a237e] hover:bg-indigo-950 text-white'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
            disabled={balance <= 0}
          >
            Apply {type}
          </button>
        </div>
      )}
    </div>
  );
};
