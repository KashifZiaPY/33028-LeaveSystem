import React, { useState, useEffect } from 'react';
import { 
  Building2, User, Briefcase, Users, AlertCircle, 
  X, Check, Save, Loader2, ShieldCheck, AtSign 
} from 'lucide-react';
import { EmployeeRecord, UserRole } from '../types';
import { callApi } from '../services/api';

interface EditEmployeeModalProps {
  isOpen: boolean;
  employeeId: string | null;
  userToken: string;
  onClose: () => void;
  onSuccess: (employeeName: string, changes: string[]) => void;
}

export const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({
  isOpen,
  employeeId,
  userToken,
  onClose,
  onSuccess,
}) => {
  const [initialData, setInitialData] = useState<EmployeeRecord | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form inputs
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState<'Employee' | 'Principal'>('Employee');

  // Load employee data when modal opens
  useEffect(() => {
    if (!isOpen || !employeeId) {
      setInitialData(null);
      setErrorMessage('');
      return;
    }

    let isMounted = true;
    const fetchEmployeeDetails = async () => {
      setLoadingInitial(true);
      setErrorMessage('');
      try {
        const emp = await callApi<EmployeeRecord>('getEmployee', {
          token: userToken,
          employeeId,
        });

        if (isMounted && emp) {
          setInitialData(emp);
          setName(emp.name || '');
          setUsername(emp.username || '');
          setDesignation(emp.designation || '');
          setDepartment(emp.department || '');
          setRole(emp.role === 'Principal' ? 'Principal' : 'Employee');
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMessage(err.message || 'Failed to fetch employee details.');
        }
      } finally {
        if (isMounted) {
          setLoadingInitial(false);
        }
      }
    };

    fetchEmployeeDetails();

    return () => {
      isMounted = false;
    };
  }, [isOpen, employeeId, userToken]);

  if (!isOpen || !employeeId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialData) return;

    setErrorMessage('');

    const cleanName = name.trim();
    const cleanUsername = username.trim();
    const cleanDesignation = designation.trim();
    const cleanDepartment = department.trim();

    if (!cleanName) {
      setErrorMessage('Full name is required.');
      return;
    }

    if (!cleanUsername) {
      setErrorMessage('Username is required.');
      return;
    }

    if (!cleanDesignation) {
      setErrorMessage('Designation is required.');
      return;
    }

    // Build payload containing ONLY fields that changed from initialData
    const payload: Record<string, any> = {
      token: userToken,
      employeeId: initialData.employeeId,
    };

    let hasChanges = false;

    if (cleanName !== (initialData.name || '').trim()) {
      payload.name = cleanName;
      hasChanges = true;
    }

    if (cleanUsername.toLowerCase() !== (initialData.username || '').trim().toLowerCase()) {
      payload.username = cleanUsername;
      hasChanges = true;
    }

    if (cleanDesignation !== (initialData.designation || '').trim()) {
      payload.designation = cleanDesignation;
      hasChanges = true;
    }

    if (cleanDepartment !== (initialData.department || '').trim()) {
      payload.department = cleanDepartment;
      hasChanges = true;
    }

    if (role !== initialData.role) {
      payload.role = role;
      hasChanges = true;
    }

    if (!hasChanges) {
      // Nothing was altered, close without error
      onClose();
      return;
    }

    setSaving(true);
    try {
      const res = await callApi<{ ok: boolean; employeeId: string; changes: string[] }>(
        'updateEmployee',
        payload
      );

      const returnedChanges =
        res && Array.isArray(res.changes) && res.changes.length > 0
          ? res.changes
          : Object.keys(payload).filter((k) => k !== 'token' && k !== 'employeeId');

      onSuccess(cleanName, returnedChanges);
      onClose();
    } catch (err: any) {
      // Show the error in the modal itself, not a toast, so the user doesn't lose their edits
      setErrorMessage(err.message || 'Failed to update employee record. Please review inputs.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header - Corporate Navy Styling */}
        <div className="bg-[#1a237e] px-6 py-4.5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-xs border border-white/15">
              <Building2 className="w-5 h-5 text-indigo-100" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-snug">Edit Employee Profile</h3>
              <p className="text-xs text-indigo-200">
                {initialData ? (
                  <span>
                    {initialData.employeeId} • <span className="font-mono">@{initialData.username}</span>
                  </span>
                ) : (
                  'Staff Record Administration'
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="p-1.5 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50 cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {loadingInitial ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Loader2 className="w-6 h-6 border-indigo-900 text-[#1a237e] animate-spin mx-auto" />
              <p className="text-xs font-medium">Fetching employee details from registry...</p>
            </div>
          ) : (
            <form id="edit-employee-form" onSubmit={handleSubmit} className="space-y-4">
              {/* In-Modal Error Banner */}
              {errorMessage && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3.5 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
                </div>
              )}

              {/* Status and ID Meta Bar */}
              {initialData && (
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-medium">Employee ID:</span>
                    <span className="font-mono font-bold text-indigo-950 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {initialData.employeeId}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-medium">Account Status:</span>
                    <span
                      className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-[11px] border ${
                        (initialData.status || '').toLowerCase() === 'active'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-rose-50 text-rose-800 border-rose-300'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          (initialData.status || '').toLowerCase() === 'active'
                            ? 'bg-emerald-600'
                            : 'bg-rose-600'
                        }`}
                      />
                      {initialData.status || 'Active'}
                    </span>
                  </div>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Iram Shazadi"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#1a237e] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Staff Username <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">Used for LMS login</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <AtSign className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. iram.shazadi"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#1a237e] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Designation */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Official Designation <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Admin Officer, Senior Instructor"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#1a237e] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Department / Wing
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Admin/Store, IT Wing, Vocational Wing"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#1a237e] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Role Dropdown */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Institutional Role <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">Employee or Principal</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'Employee' | 'Principal')}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#1a237e] focus:bg-white transition-all"
                  >
                    <option value="Employee">Employee (Staff / Faculty / Officer)</option>
                    <option value="Principal">Principal (Sanctioning Authority)</option>
                  </select>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Principals can sanction and review staff leave applications.
                </p>
              </div>

              {/* Security notice regarding PIN */}
              <div className="pt-2 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Security Notice: Modifying profile attributes never touches security PINs. PIN resets remain an independent administrative action.
                </span>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200/80 flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="edit-employee-form"
            disabled={saving || loadingInitial || !initialData}
            className="px-5 py-2.5 text-xs font-bold text-white bg-[#1a237e] hover:bg-indigo-950 rounded-xl shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
