import React, { useState } from 'react';
import { 
  Building2, LogOut, KeyRound, User, PlusCircle, 
  CheckSquare, ShieldAlert, LayoutDashboard, Menu, X, Users, Sparkles 
} from 'lucide-react';
import { SessionUser, UserRole } from '../types';

interface NavbarProps {
  user: SessionUser;
  activeTab: string;
  pendingApprovalsCount?: number;
  onTabChange: (tab: string) => void;
  onApplyLeaveClick: () => void;
  onChangePinClick: () => void;
  onLogout: () => void;
  loggingOut?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  pendingApprovalsCount = 0,
  onTabChange,
  onApplyLeaveClick,
  onChangePinClick,
  onLogout,
  loggingOut = false,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const canApprove = user.role === 'Principal' || user.role === 'Root';
  const isRoot = user.role === 'Root';

  const handleTabSelect = (tab: string) => {
    onTabChange(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-[#1a237e] text-white shadow-lg sticky top-0 z-40">
      {/* Top institution stripe */}
      <div className="bg-[#0f174a] text-slate-300 text-[11px] py-1 px-4 sm:px-8 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-2 font-medium truncate">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
          <span>Technical Education & Vocational Training Authority • Govt. of Punjab</span>
        </div>
        <div className="hidden sm:flex items-center gap-3 font-mono text-[11px] text-slate-300 shrink-0">
          <span>INST CODE: <strong className="text-white">33028</strong></span>
          <span>•</span>
          <span>GVTIW SAMANABAD</span>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shadow-inner shrink-0">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-black text-base sm:text-lg tracking-tight block leading-tight">
                GVTIW LMS
              </span>
              <span className="text-[10px] sm:text-xs text-indigo-200 font-medium block">
                Leave Management System
              </span>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => handleTabSelect('dashboard')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'dashboard'
                  ? 'bg-white/15 text-white shadow-inner'
                  : 'text-indigo-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              My Leave & Balance
            </button>

            {canApprove && (
              <button
                onClick={() => handleTabSelect('approvals')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 relative ${
                  activeTab === 'approvals'
                    ? 'bg-white/15 text-white shadow-inner'
                    : 'text-indigo-200 hover:text-white hover:bg-white/5'
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                Approvals Desk
                {pendingApprovalsCount > 0 && (
                  <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-2xs">
                    {pendingApprovalsCount}
                  </span>
                )}
              </button>
            )}

            {isRoot && (
              <button
                onClick={() => handleTabSelect('root')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'root'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-amber-200 hover:text-white hover:bg-white/5'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                Root Admin Console
              </button>
            )}
          </nav>

          {/* User Profile & Actions (Desktop) */}
          <div className="hidden lg:flex items-center gap-3">
            {/* User identity card */}
            <div className="flex items-center gap-2.5 bg-black/20 px-3 py-1.5 rounded-xl border border-white/10">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/30 flex items-center justify-center text-xs font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold truncate max-w-[130px] leading-tight">
                  {user.name}
                </div>
                <div className="text-[10px] text-indigo-200 font-medium truncate max-w-[130px]">
                  {user.designation} •{' '}
                  <span className="font-bold text-amber-300">{user.role}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <button
              onClick={onChangePinClick}
              className="p-2 text-indigo-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              title="Change Security PIN"
            >
              <KeyRound className="w-4 h-4" />
            </button>

            <button
              onClick={onLogout}
              disabled={loggingOut}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
              title="End Secure Session"
            >
              <LogOut className="w-3.5 h-3.5" />
              {loggingOut ? 'Signing Out...' : 'Logout'}
            </button>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0d1544] border-t border-white/10 px-4 pt-3 pb-5 space-y-3 animate-fadeIn">
          {/* User details on mobile */}
          <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/30 flex items-center justify-center font-bold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-bold">{user.name}</div>
              <div className="text-xs text-indigo-200">
                {user.designation} • <strong className="text-amber-300">{user.role}</strong>
              </div>
            </div>
          </div>

          {/* Mobile Navigation Links */}
          <div className="space-y-1">
            <button
              onClick={() => handleTabSelect('dashboard')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 ${
                activeTab === 'dashboard'
                  ? 'bg-white/15 text-white'
                  : 'text-indigo-200 hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              My Leave & Balance
            </button>

            {canApprove && (
              <button
                onClick={() => handleTabSelect('approvals')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between ${
                  activeTab === 'approvals'
                    ? 'bg-white/15 text-white'
                    : 'text-indigo-200 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CheckSquare className="w-4 h-4" />
                  Leave Approvals Desk
                </div>
                {pendingApprovalsCount > 0 && (
                  <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                    {pendingApprovalsCount}
                  </span>
                )}
              </button>
            )}

            {isRoot && (
              <button
                onClick={() => handleTabSelect('root')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 ${
                  activeTab === 'root'
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'text-amber-200 hover:bg-white/5'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                Root Admin Console
              </button>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onChangePinClick();
                setMobileMenuOpen(false);
              }}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Change PIN
            </button>

            <button
              onClick={() => {
                onLogout();
                setMobileMenuOpen(false);
              }}
              disabled={loggingOut}
              className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
