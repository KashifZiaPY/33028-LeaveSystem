export type UserRole = 'Root' | 'Principal' | 'Employee';

export type LeaveType = 'CL' | 'ML';

export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' | string;

export interface SessionUser {
  token: string;
  role: UserRole;
  employeeId: string;
  name: string;
  designation: string;
  department?: string;
  mustChangePin?: boolean;
}

export interface LeaveBalance {
  allocated: number;
  used: number;
  pending: number;
  balance: number;
}

export interface LeaveRequest {
  RequestID: string;
  LeaveType: LeaveType;
  FromDate: string;
  ToDate: string;
  Days: number;
  Reason: string;
  Status: LeaveStatus;
  AppliedOn: string;
  ActionBy?: string;
  ActionOn?: string;
  ActionRemarks?: string;
}

export interface DashboardData {
  profile: {
    name: string;
    designation: string;
    department: string;
    role: UserRole;
  };
  year: number | string;
  balances: {
    CL: LeaveBalance;
    ML: LeaveBalance;
  };
  requests: LeaveRequest[];
}

export interface PendingApproval {
  RequestID: string;
  EmployeeID: string;
  employeeName: string;
  designation: string;
  LeaveType: LeaveType;
  FromDate: string;
  ToDate: string;
  Days: number;
  Reason: string;
  AppliedOn: string;
}

export interface EmployeeRecord {
  employeeId: string;
  name: string;
  designation: string;
  department: string;
  role: UserRole;
  username: string;
  status: 'Active' | 'Inactive' | string;
  dateJoined?: string;
}

export interface AuditLogEntry {
  Timestamp: string;
  Actor: string;
  Action: string;
  Details: string;
}

export interface OneTimeCredentials {
  employeeId?: string;
  username: string;
  pin: string;
  role?: UserRole;
  name?: string;
}

export interface ApiResponse<T = any> {
  ok: boolean;
  data?: T;
  error?: string;
}
