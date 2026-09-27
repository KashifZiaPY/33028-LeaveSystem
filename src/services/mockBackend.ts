import { 
  SessionUser, DashboardData, LeaveRequest, PendingApproval, 
  EmployeeRecord, AuditLogEntry, OneTimeCredentials, UserRole, LeaveType 
} from '../types';

interface StoredEmployee {
  employeeId: string;
  name: string;
  designation: string;
  department: string;
  role: UserRole;
  username: string;
  pin: string;
  status: 'Active' | 'Inactive';
  dateJoined: string;
  mustChangePin: boolean;
  balances: {
    CL: { allocated: number; used: number; pending: number; balance: number };
    ML: { allocated: number; used: number; pending: number; balance: number };
  };
}

const STORAGE_KEY = 'gvtiw_lms_mock_state_v1';

// Initial seed data representing Govt. Vocational Training Institute for Women (GVTIW) Samanabad, Lahore
function getInitialData(): {
  employees: StoredEmployee[];
  requests: (LeaveRequest & { employeeId: string; employeeName: string; designation: string })[];
  auditLogs: AuditLogEntry[];
  sessions: Record<string, { username: string; expiresAt: number }>;
  year: number;
} {
  return {
    year: 2026,
    employees: [
      {
        employeeId: 'GVTIW-001',
        name: 'System Administrator',
        designation: 'IT / Systems Incharge',
        department: 'Technical Cell',
        role: 'Root',
        username: 'root',
        pin: '9999',
        status: 'Active',
        dateJoined: '2019-01-15',
        mustChangePin: false,
        balances: {
          CL: { allocated: 24, used: 2, pending: 0, balance: 22 },
          ML: { allocated: 12, used: 0, pending: 0, balance: 12 },
        },
      },
      {
        employeeId: 'GVTIW-101',
        name: 'Nuzhat Parveen',
        designation: 'Principal / Head of Institution',
        department: 'Administration',
        role: 'Principal',
        username: 'principal',
        pin: '1234',
        status: 'Active',
        dateJoined: '2020-03-01',
        mustChangePin: false,
        balances: {
          CL: { allocated: 24, used: 3, pending: 0, balance: 21 },
          ML: { allocated: 12, used: 1, pending: 0, balance: 11 },
        },
      },
      {
        employeeId: 'GVTIW-102',
        name: 'Amina Tariq',
        designation: 'Senior Instructor (Computer Application)',
        department: 'IT Wing',
        role: 'Employee',
        username: 'emp102',
        pin: '1234',
        status: 'Active',
        dateJoined: '2021-08-15',
        mustChangePin: false,
        balances: {
          CL: { allocated: 24, used: 5, pending: 2, balance: 17 },
          ML: { allocated: 12, used: 2, pending: 0, balance: 10 },
        },
      },
      {
        employeeId: 'GVTIW-103',
        name: 'Fatima Noor',
        designation: 'Junior Instructor (Dress Making & Textile)',
        department: 'Vocational Training Wing',
        role: 'Employee',
        username: 'emp103',
        pin: '1234',
        status: 'Active',
        dateJoined: '2022-01-10',
        mustChangePin: false,
        balances: {
          CL: { allocated: 24, used: 4, pending: 3, balance: 17 },
          ML: { allocated: 12, used: 0, pending: 0, balance: 12 },
        },
      },
      {
        employeeId: 'EMP-07F5DF50',
        name: 'Iram Shazadi',
        designation: 'Admin Officer',
        department: 'Admin/Store',
        role: 'Employee',
        username: 'iram.shazadi',
        pin: '6754',
        status: 'Active',
        dateJoined: '2026-09-27',
        mustChangePin: true,
        balances: {
          CL: { allocated: 15, used: 0, pending: 0, balance: 15 },
          ML: { allocated: 10, used: 0, pending: 0, balance: 10 },
        },
      },
      {
        employeeId: 'GVTIW-104',
        name: 'Sadia Malik',
        designation: 'Instructor (Beautician & Personal Grooming)',
        department: 'Vocational Training Wing',
        role: 'Employee',
        username: 'emp104',
        pin: '1234',
        status: 'Active',
        dateJoined: '2023-04-05',
        mustChangePin: false,
        balances: {
          CL: { allocated: 24, used: 6, pending: 0, balance: 18 },
          ML: { allocated: 12, used: 3, pending: 0, balance: 9 },
        },
      },
    ],
    requests: [
      {
        RequestID: 'REQ-33028-101',
        employeeId: 'GVTIW-102',
        employeeName: 'Amina Tariq',
        designation: 'Senior Instructor (Computer Application)',
        LeaveType: 'CL',
        FromDate: '2026-09-10',
        ToDate: '2026-09-11',
        Days: 2,
        Reason: 'Attending family urgent affair in native town',
        Status: 'Approved',
        AppliedOn: '2026-09-08 09:15',
        ActionBy: 'Nuzhat Parveen (Principal)',
        ActionOn: '2026-09-08 11:30',
        ActionRemarks: 'Sanctioned as admissible under Punjab Civil Service Leave Rules.',
      },
      {
        RequestID: 'REQ-33028-102',
        employeeId: 'GVTIW-102',
        employeeName: 'Amina Tariq',
        designation: 'Senior Instructor (Computer Application)',
        LeaveType: 'CL',
        FromDate: '2026-10-05',
        ToDate: '2026-10-06',
        Days: 2,
        Reason: 'Personal emergency and medical appointment for dependent',
        Status: 'Pending',
        AppliedOn: '2026-09-26 10:20',
      },
      {
        RequestID: 'REQ-33028-103',
        employeeId: 'GVTIW-103',
        employeeName: 'Fatima Noor',
        designation: 'Junior Instructor (Dress Making & Textile)',
        LeaveType: 'CL',
        FromDate: '2026-10-02',
        ToDate: '2026-10-04',
        Days: 3,
        Reason: 'Sister wedding ceremony out of station',
        Status: 'Pending',
        AppliedOn: '2026-09-25 14:05',
      },
      {
        RequestID: 'REQ-33028-104',
        employeeId: 'GVTIW-104',
        employeeName: 'Sadia Malik',
        designation: 'Instructor (Beautician & Personal Grooming)',
        LeaveType: 'ML',
        FromDate: '2026-08-15',
        ToDate: '2026-08-17',
        Days: 3,
        Reason: 'Acute viral fever and medical prescription attached',
        Status: 'Approved',
        AppliedOn: '2026-08-14 16:45',
        ActionBy: 'Nuzhat Parveen (Principal)',
        ActionOn: '2026-08-15 08:30',
        ActionRemarks: 'Sanctioned on medical grounds.',
      },
    ],
    auditLogs: [
      {
        Timestamp: '2026-09-27 08:00:00',
        Actor: 'System (GVTIW Server)',
        Action: 'PORTAL_INITIALIZATION',
        Details: 'GVTIW Leave Management System online for Institute Code 33028.',
      },
      {
        Timestamp: '2026-09-26 10:20:15',
        Actor: 'Amina Tariq (GVTIW-102)',
        Action: 'LEAVE_APPLIED',
        Details: 'Applied for 2 days CL from 2026-10-05 to 2026-10-06.',
      },
      {
        Timestamp: '2026-09-25 14:05:40',
        Actor: 'Fatima Noor (GVTIW-103)',
        Action: 'LEAVE_APPLIED',
        Details: 'Applied for 3 days CL from 2026-10-02 to 2026-10-04.',
      },
      {
        Timestamp: '2026-09-08 11:30:00',
        Actor: 'Nuzhat Parveen (Principal)',
        Action: 'LEAVE_APPROVED',
        Details: 'Sanctioned leave REQ-33028-101 for Amina Tariq (2 days).',
      },
    ],
    sessions: {},
  };
}

function loadState() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  const init = getInitialData();
  saveState(init);
  return init;
}

function saveState(state: any) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

// Memory cache
let db = loadState();

function refreshDb() {
  db = loadState();
  return db;
}

function commitDb() {
  saveState(db);
}

function getSessionUser(token: string): StoredEmployee | null {
  refreshDb();
  if (!token) return null;
  const session = db.sessions[token];
  if (!session) return null;
  if (session.expiresAt && Date.now() > session.expiresAt) {
    delete db.sessions[token];
    commitDb();
    return null;
  }
  const emp = db.employees.find((e: StoredEmployee) => e.username === session.username);
  return emp || null;
}

function generateToken(): string {
  return 'gvtiw_tk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function formatNow(): string {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export async function handleMockApi(action: string, payload: Record<string, any> = {}): Promise<any> {
  // Simulate natural brief server latency
  await new Promise((r) => setTimeout(r, 120));
  refreshDb();

  switch (action) {
    case 'login': {
      const username = (payload.username || '').trim().toLowerCase();
      const pin = (payload.pin || '').trim();

      if (!username || !pin) {
        throw new Error('Username and Security PIN are required.');
      }

      const emp = db.employees.find(
        (e: StoredEmployee) => e.username.toLowerCase() === username && e.pin === pin
      );

      if (!emp) {
        throw new Error('Invalid username or Security PIN. Please verify credentials.');
      }

      if (emp.status === 'Inactive') {
        throw new Error('This employee account has been deactivated. Please contact the Principal.');
      }

      const token = generateToken();
      // 8-hour session expiry
      db.sessions[token] = {
        username: emp.username,
        expiresAt: Date.now() + 8 * 60 * 60 * 1000,
      };

      db.auditLogs.unshift({
        Timestamp: formatNow(),
        Actor: `${emp.name} (${emp.employeeId})`,
        Action: 'USER_LOGIN',
        Details: `Successful authentication with role ${emp.role}.`,
      });

      commitDb();

      return {
        token,
        role: emp.role,
        employeeId: emp.employeeId,
        name: emp.name,
        designation: emp.designation,
        department: emp.department,
        mustChangePin: !!emp.mustChangePin,
      };
    }

    case 'logout': {
      const { token } = payload;
      if (token && db.sessions[token]) {
        const username = db.sessions[token].username;
        delete db.sessions[token];
        db.auditLogs.unshift({
          Timestamp: formatNow(),
          Actor: username,
          Action: 'USER_LOGOUT',
          Details: 'Staff member signed out.',
        });
        commitDb();
      }
      return { success: true };
    }

    case 'getMyDashboard': {
      const { token } = payload;
      const emp = getSessionUser(token);
      if (!emp) throw new Error('Session expired or unauthorized. Please log in again.');

      const empRequests = db.requests
        .filter((r: any) => r.employeeId === emp.employeeId)
        .map(({ employeeId, employeeName, designation, ...rest }: any) => rest);

      return {
        profile: {
          name: emp.name,
          designation: emp.designation,
          department: emp.department,
          role: emp.role,
        },
        year: db.year,
        balances: emp.balances,
        requests: empRequests,
      };
    }

    case 'applyLeave': {
      const { token, leaveType, fromDate, toDate, reason } = payload;
      const emp = getSessionUser(token);
      if (!emp) throw new Error('Session expired or unauthorized. Please log in again.');

      if (!fromDate || !toDate || !reason) {
        throw new Error('All leave application fields are mandatory.');
      }

      const start = new Date(fromDate);
      const end = new Date(toDate);
      if (end < start) {
        throw new Error('To Date cannot be earlier than From Date.');
      }

      const diffTime = Math.abs(end.getTime() - start.getTime());
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      const typeKey = (leaveType === 'ML' ? 'ML' : 'CL') as 'CL' | 'ML';
      const balObj = emp.balances[typeKey];

      const requestId = `REQ-33028-${Math.floor(100 + Math.random() * 900)}`;

      // Update pending count
      balObj.pending += days;
      balObj.balance = Math.max(0, balObj.allocated - balObj.used - balObj.pending);

      const newReq = {
        RequestID: requestId,
        employeeId: emp.employeeId,
        employeeName: emp.name,
        designation: emp.designation,
        LeaveType: typeKey,
        FromDate: fromDate,
        ToDate: toDate,
        Days: days,
        Reason: reason.trim(),
        Status: 'Pending',
        AppliedOn: formatNow(),
      };

      db.requests.unshift(newReq);

      db.auditLogs.unshift({
        Timestamp: formatNow(),
        Actor: `${emp.name} (${emp.employeeId})`,
        Action: 'LEAVE_APPLY',
        Details: `Applied for ${days} days ${typeKey} (#${requestId}).`,
      });

      commitDb();

      return {
        requestId,
        days,
        status: 'Pending',
      };
    }

    case 'cancelLeaveRequest': {
      const { token, requestId } = payload;
      const emp = getSessionUser(token);
      if (!emp) throw new Error('Session expired or unauthorized. Please log in again.');

      const reqIndex = db.requests.findIndex(
        (r: any) => r.RequestID === requestId && r.employeeId === emp.employeeId
      );

      if (reqIndex === -1) {
        throw new Error('Leave request not found or does not belong to you.');
      }

      const req = db.requests[reqIndex];
      if (req.Status !== 'Pending') {
        throw new Error(`Cannot cancel request #${requestId} because it is already ${req.Status}.`);
      }

      req.Status = 'Cancelled';
      const typeKey = req.LeaveType as 'CL' | 'ML';
      const balObj = emp.balances[typeKey];
      balObj.pending = Math.max(0, balObj.pending - req.Days);
      balObj.balance = Math.max(0, balObj.allocated - balObj.used - balObj.pending);

      db.auditLogs.unshift({
        Timestamp: formatNow(),
        Actor: `${emp.name} (${emp.employeeId})`,
        Action: 'LEAVE_CANCEL',
        Details: `Cancelled pending leave request #${requestId}.`,
      });

      commitDb();
      return { success: true };
    }

    case 'changePin': {
      const { token, oldPin, newPin } = payload;
      const emp = getSessionUser(token);
      if (!emp) throw new Error('Session expired or unauthorized. Please log in again.');

      if (emp.pin !== oldPin) {
        throw new Error('Current PIN is incorrect. Please verify and try again.');
      }

      if (!newPin || newPin.length < 4) {
        throw new Error('New PIN must be at least 4 digits.');
      }

      emp.pin = newPin;
      emp.mustChangePin = false;

      db.auditLogs.unshift({
        Timestamp: formatNow(),
        Actor: `${emp.name} (${emp.employeeId})`,
        Action: 'PIN_CHANGE',
        Details: 'Employee updated security PIN.',
      });

      commitDb();
      return { success: true };
    }

    case 'getPendingApprovals': {
      const { token } = payload;
      const emp = getSessionUser(token);
      if (!emp || (emp.role !== 'Principal' && emp.role !== 'Root')) {
        throw new Error('Unauthorized. Only Principal and Root administrator can access approvals.');
      }

      const pending = db.requests
        .filter((r: any) => r.Status === 'Pending')
        .map((r: any) => ({
          RequestID: r.RequestID,
          EmployeeID: r.employeeId,
          employeeName: r.employeeName,
          designation: r.designation,
          LeaveType: r.LeaveType,
          FromDate: r.FromDate,
          ToDate: r.ToDate,
          Days: r.Days,
          Reason: r.Reason,
          AppliedOn: r.AppliedOn,
        }));

      return pending;
    }

    case 'actionOnLeaveRequest': {
      const { token, requestId, decision, remarks } = payload;
      const emp = getSessionUser(token);
      if (!emp || (emp.role !== 'Principal' && emp.role !== 'Root')) {
        throw new Error('Unauthorized. Only Principal and Root administrator can sanction leave requests.');
      }

      const req = db.requests.find((r: any) => r.RequestID === requestId);
      if (!req) throw new Error(`Leave request #${requestId} not found.`);

      const targetEmp = db.employees.find((e: StoredEmployee) => e.employeeId === req.employeeId);
      const typeKey = req.LeaveType as 'CL' | 'ML';

      req.Status = decision === 'Approved' ? 'Approved' : 'Rejected';
      req.ActionBy = `${emp.name} (${emp.role})`;
      req.ActionOn = formatNow();
      req.ActionRemarks = remarks || (decision === 'Approved' ? 'Sanctioned as admissible under rules.' : 'Rejected.');

      if (targetEmp) {
        const balObj = targetEmp.balances[typeKey];
        balObj.pending = Math.max(0, balObj.pending - req.Days);
        if (decision === 'Approved') {
          balObj.used += req.Days;
        }
        balObj.balance = Math.max(0, balObj.allocated - balObj.used - balObj.pending);
      }

      db.auditLogs.unshift({
        Timestamp: formatNow(),
        Actor: `${emp.name} (${emp.role})`,
        Action: decision === 'Approved' ? 'LEAVE_SANCTIONED' : 'LEAVE_REJECTED',
        Details: `${decision} request #${requestId} for ${req.employeeName}. Remarks: ${remarks || 'None'}`,
      });

      commitDb();
      return { success: true };
    }

    case 'listEmployees': {
      const { token } = payload;
      const emp = getSessionUser(token);
      if (!emp || emp.role !== 'Root') {
        throw new Error('Unauthorized. Only Root Administrator can access staff management console.');
      }

      return db.employees.map((e: StoredEmployee) => ({
        employeeId: e.employeeId,
        name: e.name,
        designation: e.designation,
        department: e.department,
        role: e.role,
        username: e.username,
        status: e.status,
        dateJoined: e.dateJoined,
      }));
    }

    case 'createEmployee': {
      const { token, name, designation, department, role } = payload;
      const emp = getSessionUser(token);
      if (!emp || emp.role !== 'Root') {
        throw new Error('Unauthorized. Only Root Administrator can create employee records.');
      }

      const nextNum = 100 + db.employees.length + 1;
      const employeeId = `GVTIW-${nextNum}`;
      const username = `emp${nextNum}`;
      const pin = Math.floor(1000 + Math.random() * 9000).toString();

      const newEmp: StoredEmployee = {
        employeeId,
        name: name.trim(),
        designation: designation.trim(),
        department: (department || 'Vocational Training Wing').trim(),
        role: role || 'Employee',
        username,
        pin,
        status: 'Active',
        dateJoined: new Date().toISOString().split('T')[0],
        mustChangePin: true,
        balances: {
          CL: { allocated: 24, used: 0, pending: 0, balance: 24 },
          ML: { allocated: 12, used: 0, pending: 0, balance: 12 },
        },
      };

      db.employees.push(newEmp);

      db.auditLogs.unshift({
        Timestamp: formatNow(),
        Actor: `${emp.name} (Root)`,
        Action: 'STAFF_ENROLLED',
        Details: `Enrolled new staff member ${name} (${employeeId}) as ${designation}.`,
      });

      commitDb();

      return {
        employeeId,
        username,
        pin,
        role: newEmp.role,
      };
    }

    case 'resetPin': {
      const { token, employeeId } = payload;
      const emp = getSessionUser(token);
      if (!emp || emp.role !== 'Root') {
        throw new Error('Unauthorized. Only Root Administrator can reset staff credentials.');
      }

      const targetEmp = db.employees.find((e: StoredEmployee) => e.employeeId === employeeId);
      if (!targetEmp) throw new Error('Employee record not found.');

      const newPin = Math.floor(1000 + Math.random() * 9000).toString();
      targetEmp.pin = newPin;
      targetEmp.mustChangePin = true;

      db.auditLogs.unshift({
        Timestamp: formatNow(),
        Actor: `${emp.name} (Root)`,
        Action: 'PIN_RESET',
        Details: `Generated new security PIN for ${targetEmp.name} (${targetEmp.employeeId}).`,
      });

      commitDb();

      return {
        employeeId: targetEmp.employeeId,
        username: targetEmp.username,
        pin: newPin,
      };
    }

    case 'setEmployeeStatus': {
      const { token, employeeId, status } = payload;
      const emp = getSessionUser(token);
      if (!emp || emp.role !== 'Root') {
        throw new Error('Unauthorized. Only Root Administrator can toggle employee status.');
      }

      const targetEmp = db.employees.find((e: StoredEmployee) => e.employeeId === employeeId);
      if (!targetEmp) throw new Error('Employee record not found.');

      targetEmp.status = status === 'Inactive' ? 'Inactive' : 'Active';

      db.auditLogs.unshift({
        Timestamp: formatNow(),
        Actor: `${emp.name} (Root)`,
        Action: 'STATUS_UPDATE',
        Details: `Set employee ${targetEmp.name} status to ${targetEmp.status}.`,
      });

      commitDb();

      return { success: true };
    }

    case 'getAuditLog': {
      const { token } = payload;
      const emp = getSessionUser(token);
      if (!emp || emp.role !== 'Root') {
        throw new Error('Unauthorized. Only Root Administrator can access system audit trails.');
      }

      return db.auditLogs;
    }

    case 'runYearEndRollover': {
      const { token } = payload;
      const emp = getSessionUser(token);
      if (!emp || emp.role !== 'Root') {
        throw new Error('Unauthorized. Only Root Administrator can trigger year-end quota rollover.');
      }

      db.year += 1;
      let count = 0;
      for (const e of db.employees) {
        // CL resets to 24 each academic year
        e.balances.CL.allocated = 24;
        e.balances.CL.used = 0;
        e.balances.CL.pending = 0;
        e.balances.CL.balance = 24;

        // ML carries over partially or remains 12
        e.balances.ML.used = 0;
        e.balances.ML.pending = 0;
        e.balances.ML.balance = e.balances.ML.allocated;
        count++;
      }

      db.auditLogs.unshift({
        Timestamp: formatNow(),
        Actor: `${emp.name} (Root)`,
        Action: 'YEAR_END_ROLLOVER',
        Details: `Completed annual leave rollover for Academic Year ${db.year}. Processed ${count} staff records.`,
      });

      commitDb();

      return {
        year: db.year,
        processed: count,
      };
    }

    default:
      throw new Error(`Unknown API action: "${action}"`);
  }
}
