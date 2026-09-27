import React, { useState } from 'react';
import { 
  Building2, Lock, User, Eye, EyeOff, KeyRound, 
  ShieldCheck, AlertCircle, ArrowRight, BookOpen 
} from 'lucide-react';
import { SessionUser } from '../types';
import { callApi } from '../services/api';
import { useToast } from '../context/ToastContext';

interface LoginScreenProps {
  onLoginSuccess: (user: SessionUser) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const { showError, showSuccess } = useToast();
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanUser = username.trim();
    const cleanPin = pin.trim();

    if (!cleanUser) {
      setErrorMessage('Please enter your staff username');
      return;
    }

    if (!cleanPin) {
      setErrorMessage('Please enter your security PIN');
      return;
    }

    setLoading(true);
    try {
      const data = await callApi<{
        token: string;
        role: 'Root' | 'Principal' | 'Employee';
        employeeId: string;
        name: string;
        designation: string;
        department?: string;
        mustChangePin?: boolean;
      }>('login', {
        username: cleanUser,
        pin: cleanPin,
      });

      if (!data || !data.token) {
        throw new Error('Authentication succeeded but received no session token.');
      }

      showSuccess(`Welcome back, ${data.name || cleanUser}!`);
      onLoginSuccess({
        token: data.token,
        role: data.role,
        employeeId: data.employeeId,
        name: data.name,
        designation: data.designation,
        department: data.department,
        mustChangePin: !!data.mustChangePin,
      });
    } catch (err: any) {
      const msg = err.message || 'Invalid username or PIN. Please check your credentials.';
      setErrorMessage(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Brand Banner */}
      <div className="max-w-md w-full mx-auto text-center pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full shadow-2xs mb-3 text-xs font-bold text-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          Technical Education & Vocational Training Authority (TEVTA)
        </div>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto bg-white rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden">
        {/* Institutional Card Header */}
        <div className="bg-[#1a237e] p-7 text-center text-white relative overflow-hidden">
          {/* Subtle background crest accent */}
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />
          
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 mb-3 shadow-inner">
            <Building2 className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
            GVTIW Samanabad
          </h1>
          <p className="text-xs font-semibold text-indigo-200 uppercase tracking-wider mt-0.5">
            Leave Management System
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-black/25 text-[11px] font-mono text-indigo-100 border border-white/10">
            <span>Institute Code: <strong>33028</strong></span>
            <span>•</span>
            <span>Govt. of Punjab</span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-7 space-y-4">
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Username */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Staff Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. principal or emp102"
                autoComplete="username"
                required
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-hidden focus:ring-2 focus:ring-[#1a237e] focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Security PIN */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Security PIN
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter assigned PIN"
                autoComplete="current-password"
                required
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-hidden focus:ring-2 focus:ring-[#1a237e] focus:bg-white transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                title={showPin ? 'Hide PIN' : 'Show PIN'}
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Numeric security credential</p>
          </div>

          {/* Sign In Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#1a237e] hover:bg-indigo-950 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-950/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating Staff...
                </>
              ) : (
                <>
                  Sign In to LMS
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Institutional Compliance Notice */}
          <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500 justify-center">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Secure In-Memory Session • TEVTA Punjab</span>
          </div>
        </form>
      </div>

      {/* Footer info */}
      <footer className="max-w-md w-full mx-auto text-center text-xs text-slate-500 pb-2">
        <p className="font-semibold text-slate-600">
          Govt. Vocational Training Institute for Women (GVTIW)
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Samanabad, Lahore • Institute Code 33028 • TEVTA Punjab
        </p>
      </footer>
    </div>
  );
};
