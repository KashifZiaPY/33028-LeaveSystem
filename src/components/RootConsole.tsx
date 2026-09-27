import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, UserPlus, FileSearch, CalendarSync, ShieldAlert, 
  KeyRound, Power, Search, RefreshCw, CheckCircle2, 
  AlertTriangle, Copy, Check, Filter, ShieldCheck, ArrowUpDown 
} from 'lucide-react';
import { SessionUser, EmployeeRecord, AuditLogEntry, OneTimeCredentials, UserRole } from '../types';
import { OneTimePinModal } from './OneTimePinModal';
import { callApi } from '../services/api';
import { useToast } from '../context/ToastContext';

interface RootConsoleProps {
  user: SessionUser;
}

export const RootConsole: React.FC<RootConsoleProps> = ({ user }) => {
  const { showSuccess, showError, showWarning } = useToast();
  const [activeTab, setActiveTab] = useState<'employees' | 'create' | 'audit' | 'rollover'>('employees');

  // Employees List State
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [togglingStatusId, setTogglingStatusId] = useState<string | null>(null);

  // Create Employee Form State
  const [newName, setNewName] = useState('');
  const [newDesignation, setNewDesignation] = useState('');
  const [newDepartment, setNewDepartment] = useState('Vocational Training Wing');
  const [newRole, setNewRole] = useState<'Employee' | 'Principal'>('Employee');
  const [creating, setCreating] = useState(false);

  // One-time credentials modal
  const [credentialsModal, setCredentialsModal] = useState<OneTimeCredentials | null>(null);
  const [isCredentialsOpen, setIsCredentialsOpen] = useState(false);
  const [credentialsModalTitle, setCredentialsModalTitle] = useState('New Employee Credentials');

  // Audit Log State
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [auditSearch, setAuditSearch] = useState('');

  // Year End Rollover State
  const [rolloverModalOpen, setRolloverModalOpen] = useState(false);
  const [runningRollover, setRunningRollover] = useState(false);
  const [rolloverResult, setRolloverResult] = useState<{ year: number | string; processed: any } | null>(null);

  // Fetch Employees
  const fetchEmployees = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoadingEmployees(true);
    try {
      const list = await callApi<EmployeeRecord[]>('listEmployees', { token: user.token });
      setEmployees(Array.isArray(list) ? list : []);
    } catch (err: any) {
      showError(err.message || 'Failed to fetch employee roster');
    } finally {
      setLoadingEmployees(false);
    }
  }, [user.token, showError]);

  // Fetch Audit Logs
  const fetchAuditLogs = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoadingAudit(true);
    try {
      const logs = await callApi<AuditLogEntry[]>('getAuditLog', { token: user.token });
      setAuditLogs(Array.isArray(logs) ? logs : []);
    } catch (err: any) {
      showError(err.message || 'Failed to fetch audit log');
    } finally {
      setLoadingAudit(false);
    }
  }, [user.token, showError]);

  useEffect(() => {
    if (activeTab === 'employees') {
      fetchEmployees();
    } else if (activeTab === 'audit') {
      fetchAuditLogs();
    }
  }, [activeTab, fetchEmployees, fetchAuditLogs]);

  // Handle Toggle Employee Status
  const handleToggleStatus = async (emp: EmployeeRecord) => {
    const nextStatus = (emp.status || '').toLowerCase() === 'active' ? 'Inactive' : 'Active';
    setTogglingStatusId(emp.employeeId);
    try {
      await callApi('setEmployeeStatus', {
        token: user.token,
        employeeId: emp.employeeId,
        status: nextStatus,
      });
      showSuccess(`Employee ${emp.name} marked as ${nextStatus}`);
      fetchEmployees(true);
    } catch (err: any) {
      showError(err.message || 'Failed to update employee status');
    } finally {
      setTogglingStatusId(null);
    }
  };

  // Handle Reset PIN
  const handleResetPin = async (emp: EmployeeRecord) => {
    try {
      const res = await callApi<{ employeeId: string; username: string; pin: string }>('resetPin', {
        token: user.token,
        employeeId: emp.employeeId,
      });

      setCredentialsModal({
        employeeId: res.employeeId || emp.employeeId,
        username: res.username || emp.username,
        pin: res.pin,
        name: emp.name,
        role: emp.role,
      });
      setCredentialsModalTitle(`New PIN for ${emp.name}`);
      setIsCredentialsOpen(true);
      showSuccess(`PIN successfully reset for ${emp.name}`);
    } catch (err: any) {
      showError(err.message || 'Failed to reset employee PIN');
    }
  };

  // Handle Create Employee Submit
  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newName.trim() || !newDesignation.trim()) {
      showError('Please enter full name and official designation');
      return;
    }

    setCreating(true);
    try {
      const res = await callApi<{ employeeId: string; username: string; pin: string; role: UserRole }>(
        'createEmployee',
        {
          token: user.token,
          name: newName.trim(),
          designation: newDesignation.trim(),
          department: newDepartment.trim(),
          role: newRole,
        }
      );

      setCredentialsModal({
        employeeId: res.employeeId,
        username: res.username,
        pin: res.pin,
        role: res.role || newRole,
        name: newName.trim(),
      });
      setCredentialsModalTitle('New Employee Account Created');
      setIsCredentialsOpen(true);

      showSuccess(`Employee account for ${newName.trim()} created successfully!`);
      // Reset form
      setNewName('');
      setNewDesignation('');
      setNewDepartment('Vocational Training Wing');
      setNewRole('Employee');
      fetchEmployees(true);
    } catch (err: any) {
      showError(err.message || 'Failed to create employee account');
    } finally {
      setCreating(false);
    }
  };

  // Handle Year-End Rollover
  const handleRunRollover = async () => {
    setRunningRollover(true);
    try {
      const res = await callApi<{ year: number | string; processed: any }>('runYearEndRollover', {
        token: user.token,
      });
      setRolloverResult(res);
      showSuccess(`Year-end rollover successfully completed for year ${res?.year || ''}!`);
    } catch (err: any) {
      showError(err.message || 'Failed to execute year-end rollover');
    } finally {
      setRunningRollover(false);
    }
  };

  // Filtered employees
  const filteredEmployees = employees.filter((emp) => {
    const q = employeeSearch.toLowerCase();
    const matchesSearch =
      (emp.name || '').toLowerCase().includes(q) ||
      (emp.username || '').toLowerCase().includes(q) ||
      (emp.employeeId || '').toLowerCase().includes(q) ||
      (emp.designation || '').toLowerCase().includes(q) ||
      (emp.department || '').toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === 'ALL' || (emp.status || '').toLowerCase() === statusFilter.toLowerCase();

    const matchesRole = roleFilter === 'ALL' || (emp.role || '').toLowerCase() === roleFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesRole;
  });

  // Filtered audit logs
  const filteredAuditLogs = auditLogs.filter((log) => {
    const q = auditSearch.toLowerCase();
    return (
      (log.Action || '').toLowerCase().includes(q) ||
      (log.Actor || '').toLowerCase().includes(q) ||
      (log.Details || '').toLowerCase().includes(q) ||
      (log.Timestamp || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Root Console Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Root Super Admin
              </span>
              <span className="text-xs text-slate-400">GVTIW Samanabad #33028</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white mt-0.5">
              System Administration Console
            </h1>
          </div>
        </div>

        {/* Subtab Navigation Pill */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-800/90 p-1.5 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('employees')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'employees'
                ? 'bg-[#1a237e] text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Staff Roster
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'create'
                ? 'bg-[#1a237e] text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" /> New Account
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'bg-[#1a237e] text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <FileSearch className="w-3.5 h-3.5" /> Audit Log
          </button>
          <button
            onClick={() => setActiveTab('rollover')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'rollover'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <CalendarSync className="w-3.5 h-3.5" /> Year Rollover
          </button>
        </div>
      </div>

      {/* TAB 1: EMPLOYEES ROSTER */}
      {activeTab === 'employees' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-900" /> Institute Faculty & Staff Directory
              </h2>
              <p className="text-xs text-slate-500">Manage user accounts, active statuses, and PIN resets</p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative w-full sm:w-56">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={employeeSearch}
                  onChange={(e) => setEmployeeSearch(e.target.value)}
                  placeholder="Search staff, username..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#1a237e]"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#1a237e]"
              >
                <option value="ALL">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#1a237e]"
              >
                <option value="ALL">All Roles</option>
                <option value="Employee">Employee</option>
                <option value="Principal">Principal</option>
                <option value="Root">Root</option>
              </select>

              <button
                onClick={() => fetchEmployees(true)}
                disabled={loadingEmployees}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                title="Refresh Directory"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingEmployees ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">ID & Username</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date Joined</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loadingEmployees ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="inline-flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-indigo-900/20 border-t-indigo-900 rounded-full animate-spin" />
                        <span>Loading staff directory...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      No staff records matched your query.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => {
                    const isActive = (emp.status || '').toLowerCase() === 'active';
                    const isSelf = emp.employeeId === user.employeeId;

                    return (
                      <tr key={emp.employeeId} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 text-sm">{emp.name}</div>
                          <div className="text-slate-500 text-[11px]">{emp.designation}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-mono text-indigo-900 font-bold">{emp.employeeId}</div>
                          <div className="font-mono text-slate-500 text-[11px] bg-slate-100 px-1.5 py-0.5 rounded inline-block mt-0.5">
                            @{emp.username}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                              emp.role === 'Root'
                                ? 'bg-purple-100 text-purple-900 border-purple-200'
                                : emp.role === 'Principal'
                                ? 'bg-blue-100 text-blue-900 border-blue-200'
                                : 'bg-slate-100 text-slate-800 border-slate-200'
                            }`}
                          >
                            {emp.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-medium">
                          {emp.department || '—'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                              isActive
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-rose-100 text-rose-800 border-rose-300'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                            {emp.status || 'Active'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                          {emp.dateJoined || '—'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Reset PIN */}
                            <button
                              type="button"
                              onClick={() => handleResetPin(emp)}
                              className="px-2.5 py-1 text-slate-700 hover:text-indigo-900 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                              title="Generate new temporary PIN"
                            >
                              <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                              Reset PIN
                            </button>

                            {/* Toggle Active / Inactive */}
                            {!isSelf && (
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(emp)}
                                disabled={togglingStatusId === emp.employeeId}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                                  isActive
                                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                                }`}
                                title={isActive ? 'Deactivate user' : 'Activate user'}
                              >
                                <Power className="w-3.5 h-3.5" />
                                {togglingStatusId === emp.employeeId
                                  ? 'Updating...'
                                  : isActive
                                  ? 'Deactivate'
                                  : 'Activate'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CREATE EMPLOYEE / PRINCIPAL */}
      {activeTab === 'create' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
            <div className="p-3 bg-indigo-50 rounded-xl text-[#1a237e]">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Provision Faculty or Administrator</h2>
              <p className="text-xs text-slate-500">
                Create new staff credential account with automated secure PIN generation
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateEmployee} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Dr. Ayesha Siddiqa"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#1a237e] focus:bg-white"
              />
            </div>

            {/* Designation & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Official Designation *
                </label>
                <input
                  type="text"
                  value={newDesignation}
                  onChange={(e) => setNewDesignation(e.target.value)}
                  placeholder="e.g. Senior Trade Instructor"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#1a237e] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Department / Wing
                </label>
                <input
                  type="text"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  placeholder="e.g. Computer Science / Dress Making"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#1a237e] focus:bg-white"
                />
              </div>
            </div>

            {/* Role Selection Radio */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                System Access Role *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    newRole === 'Employee'
                      ? 'border-[#1a237e] bg-indigo-50/60 text-indigo-950'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="roleOption"
                      checked={newRole === 'Employee'}
                      onChange={() => setNewRole('Employee')}
                      className="text-[#1a237e] focus:ring-[#1a237e]"
                    />
                    <div>
                      <span className="font-bold text-sm block">Faculty / Employee</span>
                      <span className="text-[11px] text-slate-500">Standard leave quota access</span>
                    </div>
                  </div>
                </label>

                <label
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    newRole === 'Principal'
                      ? 'border-blue-700 bg-blue-50/60 text-blue-950'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="roleOption"
                      checked={newRole === 'Principal'}
                      onChange={() => setNewRole('Principal')}
                      className="text-blue-700 focus:ring-blue-700"
                    />
                    <div>
                      <span className="font-bold text-sm block">Principal</span>
                      <span className="text-[11px] text-slate-500">Sanctions & approvals authority</span>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* High Security Note */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>One-Time PIN Protocol:</strong> Upon submission, the backend will generate an employee ID, username, and temporary PIN. You will have one opportunity to copy this PIN.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setActiveTab('employees')}
                className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1a237e] hover:bg-indigo-950 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-60"
              >
                {creating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Provision Account
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileSearch className="w-5 h-5 text-indigo-900" /> Security & System Audit Trail
              </h2>
              <p className="text-xs text-slate-500">Immutable chronological log of all administrative and leave actions</p>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  placeholder="Filter audit logs..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#1a237e]"
                />
              </div>

              <button
                onClick={() => fetchAuditLogs(true)}
                disabled={loadingAudit}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                title="Refresh Audit Logs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingAudit ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Details / Parameters</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {loadingAudit ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400 font-sans">
                      <div className="inline-flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-indigo-900/20 border-t-indigo-900 rounded-full animate-spin" />
                        <span>Loading audit logs...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredAuditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-500 font-sans">
                      No audit log records found.
                    </td>
                  </tr>
                ) : (
                  filteredAuditLogs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {log.Timestamp || '—'}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {log.Actor || 'System'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-900 font-bold border border-indigo-200 inline-block">
                          {log.Action || 'EVENT'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 break-words font-sans max-w-md">
                        {log.Details || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: YEAR-END ROLLOVER */}
      {activeTab === 'rollover' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
            <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
              <CalendarSync className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Annual Quota Rollover Operations</h2>
              <p className="text-xs text-slate-500">
                Execute manual annual reset of leave quotas for all faculty and staff
              </p>
            </div>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl space-y-2">
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" /> Important Operational Notice
            </h4>
            <p className="text-xs text-amber-900 leading-relaxed">
              Year-end rollover is normally executed automatically on 1st January. Executing this manually is an override function that computes the new calendar year balances, archives unutilized quota under TEVTA policy, and resets staff quotas.
            </p>
          </div>

          {rolloverResult && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-950 space-y-1">
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Rollover Executed Successfully!
              </div>
              <p className="text-xs text-emerald-800">
                Processed for Academic/Calendar Year <strong>{rolloverResult.year}</strong>. Records updated:{' '}
                {typeof rolloverResult.processed === 'object'
                  ? JSON.stringify(rolloverResult.processed)
                  : String(rolloverResult.processed || 'Completed')}
              </p>
            </div>
          )}

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setRolloverModalOpen(true)}
              className="w-full py-3.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <CalendarSync className="w-4 h-4" />
              Initiate Manual Year-End Rollover
            </button>
          </div>
        </div>
      )}

      {/* Rollover Double-Confirmation Dialog */}
      {rolloverModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="p-2.5 bg-amber-50 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Confirm Year-End Rollover</h3>
                <p className="text-xs text-slate-500">Super Admin Manual Override</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              Are you sure you want to execute the annual quota rollover now? This will calculate and apply fresh annual quota allocations across all active staff profiles.
            </p>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setRolloverModalOpen(false)}
                disabled={runningRollover}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await handleRunRollover();
                  setRolloverModalOpen(false);
                }}
                disabled={runningRollover}
                className="flex-1 inline-flex justify-center items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                {runningRollover ? 'Processing...' : 'Yes, Run Rollover'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* One Time Credentials Modal */}
      <OneTimePinModal
        isOpen={isCredentialsOpen}
        credentials={credentialsModal}
        title={credentialsModalTitle}
        onClose={() => {
          setIsCredentialsOpen(false);
          setCredentialsModal(null); // Purge PIN from memory immediately
        }}
      />
    </div>
  );
};
