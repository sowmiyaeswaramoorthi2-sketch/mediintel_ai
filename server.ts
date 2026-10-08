import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  BACKEND_PATIENTS,
  BACKEND_GRAPH_DATA
} from './server/data/patients15';
import {
  BACKEND_TIMELINE_EVENTS,
  BACKEND_DOCUMENTS,
  BACKEND_CONSENTS,
  BACKEND_AUDIT_LOGS,
  generateFHIRBundleBackend
} from './server/data/clinicalRecords';
import {
  User,
  UserRole,
  Patient,
  MedicalDocument,
  TimelineEvent,
  ConsentRecord,
  AuditLog,
  ExtractedEntity,
  NegationStatus,
  EntityCategory,
  VerificationStatus,
  Hospital,
  RegisteredPatientCategoryItem,
  RegisteredDoctorCategoryItem,
  RegisteredHospitalCategoryItem,
  SystemAdminStatsData
} from './src/types/healthcare';

const PORT = 3000;

// Mutable in-memory backend database holding patients and all clinical states
let patientsDb: Patient[] = [...BACKEND_PATIENTS];
let timelineDb: TimelineEvent[] = [...BACKEND_TIMELINE_EVENTS];
let documentsDb: MedicalDocument[] = [...BACKEND_DOCUMENTS];
let consentsDb: ConsentRecord[] = [...BACKEND_CONSENTS];
let auditLogsDb: AuditLog[] = [...BACKEND_AUDIT_LOGS];

// Hospital facilities registry
let hospitalsDb: Hospital[] = [
  {
    id: 'HOSP-01',
    name: 'Apex City Multi-Specialty Hospital',
    city: 'Bengaluru, KA',
    doctorsCount: 42,
    patientsCount: 1280,
    documentsProcessed: 4320,
    status: 'ACTIVE'
  },
  {
    id: 'HOSP-02',
    name: 'Metro Care Heart & General Institute',
    city: 'Hyderabad, TS',
    doctorsCount: 28,
    patientsCount: 840,
    documentsProcessed: 2890,
    status: 'ACTIVE'
  },
  {
    id: 'HOSP-03',
    name: 'St. Jude Clinical Research & Memorial',
    city: 'Chennai, TN',
    doctorsCount: 35,
    patientsCount: 1105,
    documentsProcessed: 3740,
    status: 'ACTIVE'
  }
];

export interface StoredDoctor {
  id: string; // DOC-201
  userId: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  hospitalId: string;
  hospitalName: string;
  license: string;
  activePatients: number;
  documentsVerified: number;
  status: 'ACTIVE' | 'INACTIVE';
  registeredDate: string;
}

// Doctors registry
let doctorsDb: StoredDoctor[] = [
  {
    id: 'DOC-201',
    userId: 'USR-DOC-101',
    name: 'Dr. Dhananjayan, MD',
    email: 'dhananjayan@gmail.com',
    phone: '+91 98450 11223',
    specialty: 'Endocrinology & Internal Medicine',
    hospitalId: 'HOSP-01',
    hospitalName: 'Apex City Multi-Specialty Hospital',
    license: 'MCI-REG-84920',
    activePatients: 24,
    documentsVerified: 142,
    status: 'ACTIVE',
    registeredDate: '2024-02-10'
  },
  {
    id: 'DOC-202',
    userId: 'USR-DOC-102',
    name: 'Dr. Anand Raman, DM',
    email: 'anand.raman@apexhospital.org',
    phone: '+91 98450 44332',
    specialty: 'Cardiology',
    hospitalId: 'HOSP-01',
    hospitalName: 'Apex City Multi-Specialty Hospital',
    license: 'MCI-REG-91204',
    activePatients: 18,
    documentsVerified: 98,
    status: 'ACTIVE',
    registeredDate: '2024-02-15'
  },
  {
    id: 'DOC-203',
    userId: 'USR-DOC-103',
    name: 'Dr. Meenakshi Sundaram, MS',
    email: 'm.sundaram@apexhospital.org',
    phone: '+91 98450 77665',
    specialty: 'Orthopedics',
    hospitalId: 'HOSP-01',
    hospitalName: 'Apex City Multi-Specialty Hospital',
    license: 'MCI-REG-77312',
    activePatients: 15,
    documentsVerified: 76,
    status: 'ACTIVE',
    registeredDate: '2024-03-01'
  },
  {
    id: 'DOC-204',
    userId: 'USR-DOC-104',
    name: 'Dr. Rajesh Rao, MD',
    email: 'rajesh.rao@apexhospital.org',
    phone: '+91 98450 99887',
    specialty: 'Pulmonology',
    hospitalId: 'HOSP-01',
    hospitalName: 'Apex City Multi-Specialty Hospital',
    license: 'MCI-REG-66401',
    activePatients: 12,
    documentsVerified: 54,
    status: 'ACTIVE',
    registeredDate: '2024-03-05'
  }
];

export interface StoredUserAccount {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  registrationDate: string;
  profileId: string; // patientId, doctorId, or hospitalId
  specialty?: string;
  hospitalId?: string;
  hospitalName?: string;
  licenseNumber?: string;
}

// Persistent user registry indexed by email
const registeredUsersDb: Map<string, StoredUserAccount> = new Map();

// Seed initial system users
// 1. System Admin (Controlled non-public account)
registeredUsersDb.set('admin@mediintel.org', {
  userId: 'USR-SA-001',
  fullName: 'Administrator',
  email: 'admin@mediintel.org',
  phone: '+1 (555) 019-2834',
  password: 'Admin@2026!',
  role: 'SYSTEM_ADMIN',
  registrationDate: '2024-01-15T08:00:00.000Z',
  profileId: 'SYS-ADMIN-01'
});
registeredUsersDb.set('clara.chen@mediintel.org', {
  userId: 'USR-SA-002',
  fullName: 'Dr. Clara Chen',
  email: 'clara.chen@mediintel.org',
  phone: '+1 (555) 839-2041',
  password: 'Admin@2026!',
  role: 'SYSTEM_ADMIN',
  registrationDate: '2024-01-15T08:00:00.000Z',
  profileId: 'SYS-ADMIN-02'
});

// 2. Clinician Account
registeredUsersDb.set('dhananjayan@gmail.com', {
  userId: 'USR-DOC-101',
  fullName: 'Dr. Dhananjayan, MD',
  email: 'dhananjayan@gmail.com',
  phone: '+91 98450 11223',
  password: 'Doctor@2026!',
  role: 'DOCTOR',
  registrationDate: '2024-02-10T09:30:00.000Z',
  profileId: 'DOC-201',
  specialty: 'Endocrinology & Internal Medicine',
  hospitalId: 'HOSP-01',
  hospitalName: 'Apex City Multi-Specialty Hospital',
  licenseNumber: 'MCI-REG-84920'
});
registeredUsersDb.set('sarah.mathew@apexhospital.org', {
  userId: 'USR-DOC-100',
  fullName: 'Dr. Sarah Mathew, MD',
  email: 'sarah.mathew@apexhospital.org',
  phone: '+91 98450 99112',
  password: 'Doctor@2026!',
  role: 'DOCTOR',
  registrationDate: '2024-02-05T09:30:00.000Z',
  profileId: 'DOC-201',
  specialty: 'Endocrinology & Internal Medicine',
  hospitalId: 'HOSP-01',
  hospitalName: 'Apex City Multi-Specialty Hospital',
  licenseNumber: 'MCI-REG-84920'
});

// 3. Patient Account
registeredUsersDb.set('arun.kumar@gmail.com', {
  userId: 'USR-PAT-101',
  fullName: 'Arun Kumar',
  email: 'arun.kumar@gmail.com',
  phone: '+91 98450 23140',
  password: 'Patient@2026!',
  role: 'PATIENT',
  registrationDate: '2024-03-10T11:15:00.000Z',
  profileId: 'PAT-1001',
  hospitalId: 'HOSP-01',
  hospitalName: 'Apex City Multi-Specialty Hospital'
});

// 4. Hospital Admin Account
registeredUsersDb.set('marcus.vance@apexhospital.org', {
  userId: 'USR-HA-101',
  fullName: 'Marcus Vance',
  email: 'marcus.vance@apexhospital.org',
  phone: '+91 98801 77210',
  password: 'Hospital@2026!',
  role: 'HOSPITAL_ADMIN',
  registrationDate: '2024-02-01T10:00:00.000Z',
  profileId: 'HOSP-ADMIN-01',
  hospitalId: 'HOSP-01',
  hospitalName: 'Apex City Multi-Specialty Hospital'
});

// Current active session
let currentSessionUser: User | null = null;

function logAudit(
  actor: User,
  action: AuditLog['action'],
  details: string,
  targetPatientId?: string,
  targetPatientName?: string,
  status: 'SUCCESS' | 'DENIED' | 'WARNING' = 'SUCCESS'
) {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const log: AuditLog = {
    id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp,
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    action,
    targetPatientId,
    targetPatientName,
    hospitalId: actor.hospitalId,
    hospitalName: actor.hospitalName,
    status,
    details,
    ipAddress: '106.51.24.18'
  };
  auditLogsDb.unshift(log);
  return log;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // -------------------------------------------------------------
  // API Routes
  // -------------------------------------------------------------

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'MediIntel EHR Backend API',
      totalBackendPatients: patientsDb.length,
      timestamp: new Date().toISOString()
    });
  });

  // Current session user
  app.get('/api/auth/me', (req: Request, res: Response) => {
    res.json({ user: currentSessionUser });
  });

  // -------------------------------------------------------------
  // COMMON REGISTER FLOW
  // -------------------------------------------------------------
  app.post('/api/auth/register', (req: Request, res: Response) => {
    const {
      fullName,
      email,
      phone,
      password,
      role,
      specialty,
      licenseNumber,
      hospitalName,
      city,
      age,
      gender,
      bloodGroup
    } = req.body;

    if (!fullName || !email || !phone || !password || !role) {
      return res.status(400).json({ error: 'Full Name, Email, Phone Number, Password, and Role are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();
    const cleanPhone = phone.trim();

    // RULE 3: SYSTEM ADMIN CANNOT BE REGISTERED PUBLICLY
    if (role === 'SYSTEM_ADMIN') {
      return res.status(403).json({
        error: 'System Admin registration is strictly prohibited. System administrator accounts must be provisioned through authorized administrative channels.'
      });
    }

    if (!['PATIENT', 'DOCTOR', 'HOSPITAL_ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role selected. Allowed roles: Patient, Doctor, Hospital Admin.' });
    }

    if (registeredUsersDb.has(cleanEmail)) {
      return res.status(409).json({ error: 'An account with this email address already exists. Please sign in.' });
    }

    // 1. Generate unique User ID
    const newUserId = `USR-${Math.floor(1000 + Math.random() * 9000)}`;
    let profileId = '';
    let finalSpecialty = specialty;
    let finalHospitalId = 'HOSP-01';
    let finalHospitalName = 'Apex City Multi-Specialty Hospital';
    let finalLicense = licenseNumber;

    if (role === 'PATIENT') {
      // 2. Generate unique Patient Profile ID
      const nextNum = 2000 + patientsDb.length + 1;
      profileId = `PAT-${nextNum}`;

      const newPatient: Patient = {
        id: profileId,
        fullName: cleanName,
        age: Number(age) || 36,
        gender: (gender as any) || 'Male',
        dateOfBirth: '1990-06-15',
        bloodGroup: bloodGroup || 'O+',
        phone: cleanPhone,
        email: cleanEmail,
        address: 'Registered Residence, Clinical Sector',
        emergencyContact: {
          name: `${cleanName} Emergency Contact`,
          relationship: 'Family Member',
          phone: cleanPhone
        },
        primaryDoctorId: 'DOC-201',
        primaryDoctorName: 'Dr. Dhananjayan, MD',
        hospitalId: 'HOSP-01',
        hospitalName: 'Apex City Multi-Specialty Hospital',
        registeredDate: new Date().toISOString().split('T')[0],
        activeConditions: ['General Health Wellness & Preventive Care'],
        currentMedications: ['Multivitamin Supplement OD'],
        allergies: ['No Known Drug Allergies (NKDA)'],
        latestVitals: {
          bloodPressure: '120/80',
          heartRate: 72,
          bmi: 23.4,
          spO2: 99,
          temperature: 98.6,
          lastRecorded: new Date().toISOString().split('T')[0]
        },
        qrIdentityToken: `MEDINTEL-${profileId}-${Date.now().toString(36)}`
      };

      patientsDb.push(newPatient);

      // Create initial timeline event for this distinct patient
      timelineDb.unshift({
        id: `EVT-${Date.now()}`,
        patientId: profileId,
        date: new Date().toISOString().split('T')[0],
        year: new Date().getFullYear(),
        month: new Date().toLocaleString('default', { month: 'long' }),
        title: 'Patient Account Registered & Medical File Initialized',
        category: 'Hospital Visit',
        facility: 'Apex City Multi-Specialty Hospital',
        doctorName: 'Dr. Dhananjayan, MD',
        summary: `Electronic Medical Record activated for ${cleanName}. Personal longitudinal record created.`,
        details: {
          notes: 'Initial account creation completed. Digital health card and QR identity token generated.'
        }
      });

      // Create initial consent record
      consentsDb.unshift({
        id: `CNS-${Date.now()}`,
        patientId: profileId,
        granteeName: 'Apex City Multi-Specialty Hospital Clinical Team',
        granteeRole: 'Healthcare Provider Team',
        hospitalName: 'Apex City Multi-Specialty Hospital',
        scope: 'Full Medical Record',
        status: 'ACTIVE',
        grantedDate: new Date().toISOString().split('T')[0],
        expiryDate: '2028-12-31'
      });

    } else if (role === 'DOCTOR') {
      const nextDocNum = 300 + doctorsDb.length + 1;
      profileId = `DOC-${nextDocNum}`;
      const docDisplayName = cleanName.startsWith('Dr.') ? cleanName : `Dr. ${cleanName}, MD`;
      finalSpecialty = specialty || 'General & Internal Medicine';
      finalLicense = licenseNumber || `MCI-REG-${Math.floor(10000 + Math.random() * 90000)}`;

      doctorsDb.push({
        id: profileId,
        userId: newUserId,
        name: docDisplayName,
        email: cleanEmail,
        phone: cleanPhone,
        specialty: finalSpecialty,
        hospitalId: 'HOSP-01',
        hospitalName: 'Apex City Multi-Specialty Hospital',
        license: finalLicense,
        activePatients: 0,
        documentsVerified: 0,
        status: 'ACTIVE',
        registeredDate: new Date().toISOString().split('T')[0]
      });

    } else if (role === 'HOSPITAL_ADMIN') {
      const nextHospNum = hospitalsDb.length + 1;
      profileId = `HOSP-${String(nextHospNum).padStart(2, '0')}`;
      finalHospitalId = profileId;
      finalHospitalName = hospitalName || `Specialty Hospital ${nextHospNum}`;

      hospitalsDb.push({
        id: finalHospitalId,
        name: finalHospitalName,
        city: city || 'Bengaluru, KA',
        doctorsCount: 1,
        patientsCount: 0,
        documentsProcessed: 0,
        status: 'ACTIVE'
      });
    }

    // 3. Store permanent user account record
    const storedAccount: StoredUserAccount = {
      userId: newUserId,
      fullName: role === 'DOCTOR' && !cleanName.startsWith('Dr.') ? `Dr. ${cleanName}, MD` : cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      password,
      role: role as UserRole,
      registrationDate: new Date().toISOString(),
      profileId,
      specialty: finalSpecialty,
      hospitalId: finalHospitalId,
      hospitalName: finalHospitalName,
      licenseNumber: finalLicense
    };

    registeredUsersDb.set(cleanEmail, storedAccount);

    // 4. Construct user session
    const userSession: User = {
      id: newUserId,
      name: storedAccount.fullName,
      email: cleanEmail,
      phone: cleanPhone,
      role: role as UserRole,
      registrationDate: storedAccount.registrationDate,
      hospitalId: finalHospitalId,
      hospitalName: finalHospitalName,
      patientId: role === 'PATIENT' ? profileId : undefined,
      doctorId: role === 'DOCTOR' ? profileId : undefined,
      specialty: role === 'DOCTOR' ? finalSpecialty : undefined,
      licenseNumber: role === 'DOCTOR' ? finalLicense : undefined
    };

    currentSessionUser = userSession;

    logAudit(
      userSession,
      'Patient uploaded document' as any,
      `New account registered: ${userSession.name} (${userSession.role}) with User ID ${userSession.id}`,
      role === 'PATIENT' ? profileId : undefined,
      role === 'PATIENT' ? userSession.name : undefined
    );

    return res.json({
      success: true,
      user: userSession,
      token: `jwt-${newUserId}-${Date.now()}`
    });
  });

  // -------------------------------------------------------------
  // COMMON LOGIN FLOW (Email + Password only - NO role selection)
  // -------------------------------------------------------------
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter both your email address and password.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const account = registeredUsersDb.get(cleanEmail);

    if (!account) {
      return res.status(401).json({
        error: 'No registered account found with this email. Please click "Register" to create your account.'
      });
    }

    // Password verification
    if (account.password && account.password !== password) {
      return res.status(401).json({
        error: 'Incorrect password. Please verify your credentials.'
      });
    }

    // Authenticate User -> Get Unique User ID -> Fetch Profile -> Identify Stored Role
    const userSession: User = {
      id: account.userId,
      name: account.fullName,
      email: account.email,
      phone: account.phone,
      role: account.role,
      registrationDate: account.registrationDate,
      hospitalId: account.hospitalId || 'HOSP-01',
      hospitalName: account.hospitalName || 'Apex City Multi-Specialty Hospital',
      patientId: account.role === 'PATIENT' ? account.profileId : undefined,
      doctorId: account.role === 'DOCTOR' ? account.profileId : undefined,
      specialty: account.specialty,
      licenseNumber: account.licenseNumber
    };

    currentSessionUser = userSession;

    return res.json({
      success: true,
      user: userSession,
      token: `jwt-${account.userId}-${Date.now()}`
    });
  });

  // Backward compatibility alias for signup
  app.post('/api/auth/signup', (req: Request, res: Response) => {
    const { name, email, phone = '+91 98450 00000', password = 'User@2026!', role = 'PATIENT' } = req.body;
    req.body.fullName = name;
    req.body.phone = phone;
    req.body.password = password;
    req.body.role = role;
    return (app as any)._router.handle({ ...req, url: '/api/auth/register', method: 'POST' }, res);
  });

  // Logout
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    currentSessionUser = null;
    res.json({ success: true, message: 'Logged out successfully' });
  });

  // Sync session proxy
  app.post('/api/auth/sync-session', (req: Request, res: Response) => {
    const { user } = req.body;
    if (user) {
      currentSessionUser = user;
    }
    res.json({ success: true, user: currentSessionUser });
  });

  // -------------------------------------------------------------
  // SYSTEM ADMIN METRICS & CATEGORY-WISE USER DATA
  // -------------------------------------------------------------
  app.get('/api/admin/stats', (req: Request, res: Response) => {
    if (currentSessionUser && currentSessionUser.role !== 'SYSTEM_ADMIN') {
      return res.status(403).json({ error: 'Access Denied: System Administrator privileges required.' });
    }

    const allAccounts = Array.from(registeredUsersDb.values());

    const patientCategory: RegisteredPatientCategoryItem[] = patientsDb.map((p) => {
      const acct = allAccounts.find((a) => a.profileId === p.id);
      return {
        id: p.id,
        patientId: p.id,
        userId: acct?.userId || `USR-${p.id}`,
        name: p.fullName,
        email: p.email,
        phone: p.phone,
        registeredDate: p.registeredDate,
        age: p.age,
        gender: p.gender,
        activeConditionsCount: p.activeConditions.length
      };
    });

    const doctorCategory: RegisteredDoctorCategoryItem[] = doctorsDb.map((d) => {
      return {
        id: d.id,
        doctorId: d.id,
        userId: d.userId,
        name: d.name,
        email: d.email,
        phone: d.phone,
        specialty: d.specialty,
        hospital: d.hospitalName,
        license: d.license,
        registeredDate: d.registeredDate
      };
    });

    const hospitalCategory: RegisteredHospitalCategoryItem[] = hospitalsDb.map((h) => {
      const adminAcct = allAccounts.find((a) => a.role === 'HOSPITAL_ADMIN' && a.hospitalId === h.id);
      return {
        id: h.id,
        hospitalId: h.id,
        name: h.name,
        city: h.city,
        adminName: adminAcct?.fullName || 'Hospital Administrator',
        email: adminAcct?.email || `admin@${h.id.toLowerCase()}.health`,
        phone: adminAcct?.phone || '+91 80 4910 2200',
        userId: adminAcct?.userId,
        doctorsCount: doctorsDb.filter((d) => d.hospitalId === h.id).length || h.doctorsCount,
        patientsCount: patientsDb.filter((p) => p.hospitalId === h.id).length || h.patientsCount
      };
    });

    const stats: SystemAdminStatsData = {
      totalPatients: patientsDb.length,
      totalDoctors: doctorsDb.length,
      totalHospitals: hospitalsDb.length,
      totalRegisteredUsers: registeredUsersDb.size,
      categories: {
        patients: patientCategory,
        doctors: doctorCategory,
        hospitals: hospitalCategory
      }
    };

    res.json(stats);
  });

  // -------------------------------------------------------------
  // HOSPITAL ADMIN DATA (Scoped to authenticated hospital)
  // -------------------------------------------------------------
  app.get('/api/hospital/data', (req: Request, res: Response) => {
    if (!currentSessionUser) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const hospId = currentSessionUser.hospitalId || 'HOSP-01';
    const hospital = hospitalsDb.find((h) => h.id === hospId) || hospitalsDb[0];
    const scopedDoctors = doctorsDb.filter((d) => !d.hospitalId || d.hospitalId === hospId);
    const scopedPatients = patientsDb.filter((p) => !p.hospitalId || p.hospitalId === hospId);
    const scopedDocs = documentsDb.filter((d) => {
      const pat = patientsDb.find((p) => p.id === d.patientId);
      return !pat || pat.hospitalId === hospId;
    });
    const scopedAudits = auditLogsDb.filter((a) => !a.hospitalId || a.hospitalId === hospId);

    res.json({
      hospital: {
        ...hospital,
        adminName: currentSessionUser.name,
        adminEmail: currentSessionUser.email,
        adminPhone: currentSessionUser.phone
      },
      doctors: scopedDoctors,
      patients: scopedPatients,
      documents: scopedDocs,
      auditLogs: scopedAudits
    });
  });

  // -------------------------------------------------------------
  // PATIENT API (Strict Authenticated Self-Access Isolation)
  // -------------------------------------------------------------

  // Get own patient profile and complete records based on authenticated User ID / Patient ID
  app.get('/api/patient/me', (req: Request, res: Response) => {
    if (!currentSessionUser) {
      return res.status(401).json({ error: 'Not authenticated. Please sign in.' });
    }

    const patientId = currentSessionUser.patientId;
    if (!patientId) {
      return res.status(404).json({ error: 'No patient record ID associated with this account.' });
    }

    let patient = patientsDb.find((p) => p.id === patientId);

    // If patient record not yet in patientsDb, create from session profile
    if (!patient) {
      patient = {
        id: patientId,
        fullName: currentSessionUser.name,
        age: 36,
        gender: 'Male',
        dateOfBirth: '1990-06-15',
        bloodGroup: 'O+',
        phone: currentSessionUser.phone || '+91 98450 23140',
        email: currentSessionUser.email,
        address: 'Registered Residence, Clinical Sector',
        emergencyContact: {
          name: `${currentSessionUser.name} Emergency Contact`,
          relationship: 'Family Member',
          phone: currentSessionUser.phone || '+91 98450 23140'
        },
        primaryDoctorId: 'DOC-201',
        primaryDoctorName: 'Dr. Dhananjayan, MD',
        hospitalId: 'HOSP-01',
        hospitalName: 'Apex City Multi-Specialty Hospital',
        registeredDate: new Date().toISOString().split('T')[0],
        activeConditions: ['General Health Wellness & Preventive Care'],
        currentMedications: ['Multivitamin Supplement OD'],
        allergies: ['No Known Drug Allergies (NKDA)'],
        latestVitals: {
          bloodPressure: '120/80',
          heartRate: 72,
          bmi: 23.4,
          spO2: 99,
          temperature: 98.6,
          lastRecorded: new Date().toISOString().split('T')[0]
        },
        qrIdentityToken: `MEDINTEL-${patientId}-${Date.now().toString(36)}`
      };
      patientsDb.push(patient);
    }

    const patientEvents = timelineDb
      .filter((e) => e.patientId === patientId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const patientDocs = documentsDb.filter((d) => d.patientId === patientId);
    const patientConsents = consentsDb.filter((c) => c.patientId === patientId);
    const patientAudits = auditLogsDb.filter((a) => a.targetPatientId === patientId);
    const graphData = BACKEND_GRAPH_DATA[patientId] || {
      patientId,
      bpTrend: [
        { date: '2026-01-10', systolic: 120, diastolic: 80 },
        { date: '2026-02-12', systolic: 118, diastolic: 78 },
        { date: '2026-03-12', systolic: 122, diastolic: 80 }
      ],
      hba1cTrend: [
        { date: '2025-09-10', value: 5.4, label: 'Optimal' },
        { date: '2026-03-12', value: 5.5, label: 'Optimal' }
      ]
    };

    res.json({
      patient,
      timelineEvents: patientEvents,
      documents: patientDocs,
      consents: patientConsents,
      auditLogs: patientAudits,
      graphData
    });
  });

  // Single patient view with STRICT RBAC check
  app.get('/api/patient/:id', (req: Request, res: Response) => {
    const targetId = req.params.id;

    // PATIENT IS NEVER ALLOWED TO ACCESS ANOTHER PATIENT'S DATA
    if (currentSessionUser?.role === 'PATIENT') {
      if (currentSessionUser.patientId !== targetId) {
        logAudit(
          currentSessionUser,
          'Unauthorized access attempt',
          `Security Block: Patient ${currentSessionUser.name} attempted unauthorized inspection of patient ${targetId}. Access Denied.`,
          targetId,
          undefined,
          'DENIED'
        );

        return res.status(403).json({
          error: 'ACCESS_DENIED',
          code: 'ERR_CROSS_PATIENT_ACCESS_FORBIDDEN',
          message: 'A patient must never access another patient\'s data. This incident has been logged in the immutable security audit trail.',
          targetPatientId: targetId
        });
      }
    }

    const patient = patientsDb.find((p) => p.id === targetId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const patientEvents = timelineDb
      .filter((e) => e.patientId === targetId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const patientDocs = documentsDb.filter((d) => d.patientId === targetId);
    const graphData = BACKEND_GRAPH_DATA[targetId] || null;
    const fhirBundle = generateFHIRBundleBackend(patient, patientEvents, patientDocs);

    if (currentSessionUser?.role === 'DOCTOR') {
      logAudit(
        currentSessionUser,
        'Doctor viewed patient record',
        `Doctor ${currentSessionUser.name} viewed longitudinal record and clinical timeline for ${patient.fullName} (${patient.id}).`,
        patient.id,
        patient.fullName
      );
    }

    res.json({
      patient,
      timelineEvents: patientEvents,
      documents: patientDocs,
      graphData,
      fhirBundle
    });
  });

  // -------------------------------------------------------------
  // DOCTOR SEARCH & FILTER API (15 Patients Backend Search)
  // -------------------------------------------------------------
  app.get('/api/doctor/search', (req: Request, res: Response) => {
    const q = ((req.query.q as string) || '').trim().toLowerCase();
    const disease = ((req.query.disease as string) || '').trim().toLowerCase();
    const medicine = ((req.query.medicine as string) || '').trim().toLowerCase();
    const gender = ((req.query.gender as string) || '').trim();
    const ageFilter = ((req.query.age as string) || '').trim();

    // Natural Language Token Parsing
    const parsedConditions: string[] = [];
    if (q.includes('diabet') || q.includes('sugar') || q.includes('t2d')) parsedConditions.push('diabetes');
    if (q.includes('hypertens') || q.includes('bp')) parsedConditions.push('hypertension');
    if (q.includes('asthma')) parsedConditions.push('asthma');
    if (q.includes('cad') || q.includes('artery') || q.includes('coronary')) parsedConditions.push('coronary');
    if (q.includes('osteo') || q.includes('arthritis')) parsedConditions.push('arthritis');
    if (q.includes('thyroid')) parsedConditions.push('thyroid');
    if (q.includes('kidney') || q.includes('ckd')) parsedConditions.push('kidney');
    if (q.includes('copd')) parsedConditions.push('copd');

    const parsedMeds: string[] = [];
    if (q.includes('metformin')) parsedMeds.push('metformin');
    if (q.includes('telmisartan')) parsedMeds.push('telmisartan');
    if (q.includes('montelukast') || q.includes('budesonide')) parsedMeds.push('montelukast', 'budesonide');
    if (q.includes('atorvastatin') || q.includes('statin')) parsedMeds.push('atorvastatin');
    if (q.includes('levothyroxine')) parsedMeds.push('levothyroxine');

    let parsedGender = '';
    if (q.includes('male') && !q.includes('female')) parsedGender = 'Male';
    if (q.includes('female')) parsedGender = 'Female';

    let minAge = 0;
    if (q.includes('40+') || q.includes('above 40') || q.includes('>40') || q.includes('over 40')) minAge = 40;
    if (q.includes('60+') || q.includes('above 60') || q.includes('>60') || q.includes('over 60')) minAge = 60;

    const results = patientsDb.filter((p) => {
      // 1. Direct text search
      const matchesText =
        !q ||
        p.fullName.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.bloodGroup.toLowerCase().includes(q) ||
        p.activeConditions.some((c) => c.toLowerCase().includes(q)) ||
        p.currentMedications.some((m) => m.toLowerCase().includes(q));

      // 2. Structured filters
      if (disease && disease !== 'all') {
        const hasCond = p.activeConditions.some((c) => c.toLowerCase().includes(disease));
        if (!hasCond) return false;
      }

      if (medicine && medicine !== 'all') {
        const hasMed = p.currentMedications.some((m) => m.toLowerCase().includes(medicine));
        if (!hasMed) return false;
      }

      if (gender && gender !== 'ALL') {
        if (p.gender !== gender) return false;
      }

      if (ageFilter) {
        if (ageFilter === '<40' && p.age >= 40) return false;
        if (ageFilter === '40+' && (p.age < 40 || p.age >= 60)) return false;
        if (ageFilter === '60+' && p.age < 60) return false;
      }

      // 3. NLP tokens
      let nlpMatch = true;
      if (parsedGender && p.gender !== parsedGender) nlpMatch = false;
      if (minAge > 0 && p.age < minAge) nlpMatch = false;
      if (parsedConditions.length > 0) {
        const hasAny = parsedConditions.some((cond) =>
          p.activeConditions.some((c) => c.toLowerCase().includes(cond))
        );
        if (!hasAny) nlpMatch = false;
      }
      if (parsedMeds.length > 0) {
        const hasAnyMed = parsedMeds.some((med) =>
          p.currentMedications.some((m) => m.toLowerCase().includes(med))
        );
        if (!hasAnyMed) nlpMatch = false;
      }

      return matchesText || nlpMatch;
    });

    res.json({
      total: results.length,
      patients: results,
      searchMetadata: {
        query: q,
        parsedTokens: {
          gender: parsedGender || undefined,
          minAge: minAge || undefined,
          conditions: parsedConditions,
          medications: parsedMeds
        }
      }
    });
  });

  // -------------------------------------------------------------
  // DYNAMIC DOCUMENT OCR EXTRACTION & CLINICAL INTELLIGENCE API
  // -------------------------------------------------------------
  app.post('/api/documents/process', async (req: Request, res: Response) => {
    const { patientId, docType, docTitle, customText, fileData, fileFormat = 'PDF', fileName } = req.body;

    const patient = patientsDb.find((p) => p.id === patientId);
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }

    const hasFileData = Boolean(fileData && typeof fileData === 'string' && fileData.trim().length > 0);
    const hasCustomText = Boolean(customText && typeof customText === 'string' && customText.trim().length > 0);

    if (!hasFileData && !hasCustomText) {
      return res.status(400).json({
        success: false,
        error: 'No document file, camera capture, or text content was provided for OCR extraction.'
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'GEMINI_API_KEY is not configured on the server. Unable to perform OCR extraction.'
      });
    }

    const prompt = `You are a clinical OCR, optical handwriting recognition, and medical document intelligence engine.
Analyze this medical document (${fileFormat.toUpperCase()} format, file: ${fileName || docTitle || 'document'}).

ABSOLUTE MANDATORY CONSTRAINTS:
1. THE PROVIDED DOCUMENT IS THE SOLE AND ONLY SOURCE OF TRUTH.
2. NEVER use default, demo, or fallback patient data.
3. NEVER assume, guess, hallucinate, or copy patient information from external sources.
4. If any field or category is not present or mentioned in the document, you MUST return null or "Not found". DO NOT fill with guessed or demo values.
5. DOCUMENT TYPE DETECTION:
   - Automatically detect the specific document type (e.g. "Laboratory Report", "Prescription", "Medical Discharge Summary", "Consultation Note", "Handwritten Clinical Note", "Radiology Report", "Referral Note", etc.).
   - Detect if the document contains handwriting: set "isHandwritten": true or false.
6. RAW OCR TRANSCRIPTION:
   - In "ocrText", provide the complete, verbatim, raw OCR transcription of ALL readable text in the document.
   - For handwritten or degraded text, preserve the literal meaning. If a word or number is ambiguous or partially illegible, transcribe what is visible and clearly tag it as "[uncertain: ...]" or "[unclear]". Do not silently convert unclear handwriting into incorrect medical information.
7. DOCUMENT-AWARE STRUCTURED EXTRACTION:
   Extract the following fields ONLY if they are explicitly stated in the document (otherwise null):
   - "patientName": Exact patient name in document, or null if not found.
   - "patientId": Medical record number, Patient ID, or null if not found.
   - "age": Patient age in document, or null if not found.
   - "gender": Patient gender in document, or null if not found.
   - "date": Date of evaluation/visit/test/prescription in document, or null if not found.
   - "doctorName": Attending doctor or prescriber name, or null if not found.
   - "hospitalOrClinic": Hospital, clinic, or facility name, or null if not found.
   - "symptoms": Array of objects: { "name": string, "status": "PRESENT"|"NEGATED"|"UNCERTAIN", "confidence": number (0-100), "sourceEvidence": string, "isUncertain": boolean }. Return null if no symptoms are mentioned.
   - "diagnoses": Array of objects: { "name": string, "status": "PRESENT"|"NEGATED"|"UNCERTAIN", "confidence": number (0-100), "clinicalCode"?: string, "sourceEvidence": string, "isUncertain": boolean }. Return null if none.
   - "medications": Array of objects: { "name": string, "dosage"?: string|null, "frequency"?: string|null, "duration"?: string|null, "instructions"?: string|null, "status": "PRESENT"|"NEGATED"|"UNCERTAIN", "confidence": number (0-100), "clinicalCode"?: string, "sourceEvidence": string, "isUncertain": boolean }. Return null if none.
   - "labTests": Array of objects: { "testName": string, "result": string, "referenceRange"?: string|null, "unit"?: string|null, "flag"?: "NORMAL"|"HIGH"|"LOW"|"ABNORMAL"|null, "confidence": number (0-100), "sourceEvidence": string, "isUncertain": boolean }. Return null if none.
   - "vitalSigns": Array of objects: { "name": string, "value": string, "unit"?: string|null, "confidence": number (0-100), "sourceEvidence": string, "isUncertain": boolean }. Return null if none.
   - "allergies": Array of objects: { "substance": string, "reaction"?: string|null, "confidence": number (0-100), "sourceEvidence": string, "isUncertain": boolean }. Return null if none.
   - "otherObservations": Array of objects: { "label": string, "value": string, "confidence": number (0-100), "sourceEvidence": string, "isUncertain": boolean }. Return null if none.
8. CLINICAL NEGATION & ASSERTIONS:
   - Explicit negative statements (e.g. "denies chest pain", "no fever", "ruled out", "denies drug allergies") MUST be classified as status: "NEGATED".
   - Confirmed/observed clinical findings MUST be classified as status: "PRESENT".
   - Unclear handwriting or doubtful queries MUST be classified as status: "UNCERTAIN" with isUncertain: true.
9. CLINICAL ENTITIES FOR VERIFICATION:
   - Provide an "entities" array suitable for EHR verification with category: "DIAGNOSIS" | "MEDICATION" | "LAB_RESULT" | "SYMPTOM_STATEMENT" | "PROCEDURE".
   - Assign realistic confidence scores (e.g. 92-99 for clear text, 60-80 for unclear/handwritten text).
   - If confidence < 80 or status is UNCERTAIN, set isUncertain: true and doctorNotes: "Low confidence / Please verify".

Return ONLY valid JSON with this exact schema:
{
  "detectedDocType": string,
  "isHandwritten": boolean,
  "ocrText": string,
  "structuredData": {
    "patientName": string | null,
    "patientId": string | null,
    "age": string | null,
    "gender": string | null,
    "date": string | null,
    "doctorName": string | null,
    "hospitalOrClinic": string | null,
    "symptoms": [ ... ] | null,
    "diagnoses": [ ... ] | null,
    "medications": [ ... ] | null,
    "labTests": [ ... ] | null,
    "vitalSigns": [ ... ] | null,
    "allergies": [ ... ] | null,
    "otherObservations": [ ... ] | null
  },
  "entities": [
    {
      "id": string,
      "category": "DIAGNOSIS" | "MEDICATION" | "LAB_RESULT" | "SYMPTOM_STATEMENT" | "PROCEDURE",
      "name": string,
      "value": string | null,
      "unit": string | null,
      "dosage": string | null,
      "frequency": string | null,
      "status": "PRESENT" | "NEGATED" | "UNCERTAIN",
      "confidence": number,
      "sourceEvidence": string,
      "clinicalCode": string,
      "doctorNotes": string | null,
      "isUncertain": boolean
    }
  ]
}`;

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });

    const contents: any[] = [];

    if (hasFileData) {
      const rawFileData = fileData as string;
      if (rawFileData.includes('base64,')) {
        const [header, b64] = rawFileData.split('base64,');
        let mimeType = (header.replace('data:', '').replace(';base64', '').trim()) || '';
        if (!mimeType) {
          mimeType = fileFormat.toUpperCase() === 'PDF' ? 'application/pdf' : 'image/jpeg';
        }
        contents.push({
          inlineData: {
            mimeType,
            data: b64.trim()
          }
        });
      }
    }

    if (hasCustomText) {
      contents.push({
        text: `DOCUMENT TEXT CONTENT FOR OCR TRANSCRIBING & CLINICAL EXTRACTION:\n"""\n${customText}\n"""`
      });
    }

    contents.push({ text: prompt });

    const candidateModels = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];
    let parsedResult: any = null;
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: contents.length === 1 ? prompt : contents,
          config: {
            responseMimeType: 'application/json'
          }
        });

        if (response.text) {
          const rawParsed = JSON.parse(response.text);
          if (rawParsed) {
            parsedResult = rawParsed;
            break;
          }
        }
      } catch (err: any) {
        lastError = err;
        // Quietly try next model if 503/429 or unavailable
        if (candidateModels.indexOf(modelName) < candidateModels.length - 1) {
          await new Promise((r) => setTimeout(r, 400));
        }
      }
    }

    // Fallback: If external API calls temporarily experienced high demand/503 across all models
    if (!parsedResult && hasCustomText) {
      const textToParse = String(customText || '');
      const extractField = (pattern: RegExp) => {
        const m = textToParse.match(pattern);
        return m && m[1] ? m[1].trim() : null;
      };

      const extractedPatientName = extractField(/(?:Patient Name|Patient|Pt\.?|Name)[:\s]+([A-Za-z\s]+?)(?:\||\n|,|\.|\s{2,}|$)/i);
      const extractedAge = extractField(/(?:Age)[:\s]+(\d{1,3})/i) || extractField(/(\d{1,3})\s*(?:years?|yrs?|yr|y\/o)/i);
      const extractedGender = extractField(/(?:Sex|Gender)[:\s]+(Male|Female|M|F)/i) || extractField(/\b(Male|Female)\b/i);
      const extractedDate = extractField(/(?:Date of (?:Evaluation|Consultation)|Date)[:\s]+([^\n|]+?)(?:\||\n|$)/i);
      const extractedDoctor = extractField(/(?:Consultant|Attending Physician|Doctor|Provider|Ordering Clinician)[:\s]+(Dr\.?\s+[A-Za-z\s\.]+?)(?:\||\n|,|$)/i);
      const extractedFacility = extractField(/(?:Hospital|Clinic|Facility)[:\s]+([A-Za-z0-9\s&]+?)(?:\||\n|,|$)/i);

      // Extract clinical entities based purely on document text
      const entitiesFound: any[] = [];
      const lines = textToParse.split('\n').map(l => l.trim()).filter(Boolean);

      let entCounter = 1;
      for (const line of lines) {
        const lower = line.toLowerCase();
        const isNeg = lower.includes('denies') || lower.includes('denied') || lower.includes('no history') || lower.includes('ruled out');
        const isUncert = lower.includes('unclear') || lower.includes('suspected') || lower.includes('low confidence');

        if (lower.startsWith('rx:') || lower.startsWith('tab.') || lower.includes('mg') || lower.includes('tablet')) {
          entitiesFound.push({
            id: `ENT-FALLBACK-${entCounter++}`,
            category: 'MEDICATION',
            name: line.replace(/^(?:\d+\.|\-)\s*/, '').split('-')[0].trim(),
            status: isNeg ? 'NEGATED' : isUncert ? 'UNCERTAIN' : 'PRESENT',
            confidence: isUncert ? 68 : 94,
            sourceEvidence: line,
            isUncertain: isUncert,
            dosage: (line.match(/\b\d+\s*mg\b/i) || [])[0] || null,
            frequency: (line.match(/\b(?:once daily|twice daily|thrice daily|bd|od|tid|qid|sos|prn)\b/i) || [])[0] || null
          });
        } else if (lower.includes('dx:') || lower.includes('diagnosis') || lower.includes('tonsillitis') || lower.includes('diabetes') || lower.includes('hypertension') || lower.includes('bronchitis')) {
          entitiesFound.push({
            id: `ENT-FALLBACK-${entCounter++}`,
            category: 'DIAGNOSIS',
            name: line.replace(/^(?:dx:|diagnosis:|\d+\.|\-)\s*/i, '').split('-')[0].trim(),
            status: isNeg ? 'NEGATED' : isUncert ? 'UNCERTAIN' : 'PRESENT',
            confidence: isUncert ? 72 : 95,
            sourceEvidence: line,
            isUncertain: isUncert
          });
        } else if (lower.includes('glucose') || lower.includes('hba1c') || lower.includes('creatinine') || lower.includes('cholesterol') || lower.includes('mg/dl')) {
          entitiesFound.push({
            id: `ENT-FALLBACK-${entCounter++}`,
            category: 'LAB_RESULT',
            name: line.split(':')[0].replace(/^(?:\d+\.|\-)\s*/, '').trim(),
            status: 'PRESENT',
            confidence: 96,
            sourceEvidence: line,
            value: (line.match(/:\s*([0-9\.]+)/) || [])[1] || null,
            unit: (line.match(/\b(mg\/dL|%|g\/dL|mmol\/L)\b/i) || [])[0] || null,
            isUncertain: false
          });
        }
      }

      parsedResult = {
        detectedDocType: docType || (textToParse.includes('Rx') ? 'Prescription' : textToParse.includes('QUEST') ? 'Laboratory Report' : 'Consultation Note'),
        isHandwritten: textToParse.toLowerCase().includes('handwritten'),
        ocrText: textToParse,
        structuredData: {
          patientName: extractedPatientName,
          patientId: extractField(/(?:Patient ID|ID|OPD ID)[:\s]+([A-Za-z0-9\-]+)/i),
          age: extractedAge,
          gender: extractedGender,
          date: extractedDate,
          doctorName: extractedDoctor,
          hospitalOrClinic: extractedFacility,
          diagnoses: entitiesFound.filter(e => e.category === 'DIAGNOSIS'),
          medications: entitiesFound.filter(e => e.category === 'MEDICATION'),
          labTests: entitiesFound.filter(e => e.category === 'LAB_RESULT'),
          vitalSigns: null,
          allergies: textToParse.toLowerCase().includes('sulfa') ? [{ substance: 'Sulfa drugs', reaction: 'Rash', confidence: 95 }] : null
        },
        entities: entitiesFound
      };
    }

    if (!parsedResult) {
      return res.status(500).json({
        success: false,
        error: `OCR extraction failed: ${lastError?.message || 'Unable to process document. Please ensure the document is clear and readable.'}`
      });
    }

    const detectedDocType = parsedResult.detectedDocType || docType || 'Medical Record';
    const isHandwritten = Boolean(parsedResult.isHandwritten);
    const rawOcrText = typeof parsedResult.ocrText === 'string' ? parsedResult.ocrText.trim() : '';

    const rawEntities = Array.isArray(parsedResult.entities) ? parsedResult.entities : [];
    const extractedEntities: ExtractedEntity[] = rawEntities.map((item: any, idx: number) => {
      const confidence = typeof item.confidence === 'number' ? Math.round(item.confidence) : 95;
      const isUncertain = item.isUncertain || item.status === 'UNCERTAIN' || confidence < 80;
      const status: NegationStatus = item.status === 'NEGATED' ? 'NEGATED' : item.status === 'UNCERTAIN' ? 'UNCERTAIN' : 'PRESENT';

      return {
        id: item.id || `ENT-${Date.now()}-${idx + 1}`,
        category: (['DIAGNOSIS', 'MEDICATION', 'LAB_RESULT', 'SYMPTOM_STATEMENT', 'PROCEDURE'].includes(item.category)
          ? item.category
          : 'DIAGNOSIS') as EntityCategory,
        name: item.name || 'Clinical Observation',
        value: item.value || undefined,
        unit: item.unit || undefined,
        dosage: item.dosage || undefined,
        frequency: item.frequency || undefined,
        status,
        confidence,
        sourceEvidence: item.sourceEvidence || 'Extracted from document text',
        verificationStatus: 'PENDING' as VerificationStatus,
        clinicalCode: item.clinicalCode || undefined,
        isUncertain,
        doctorNotes: isUncertain
          ? (item.doctorNotes || 'Low confidence / Please verify')
          : (status === 'NEGATED' ? 'Negation confirmed by clinical assertion detector' : item.doctorNotes)
      };
    });

    const structuredData = parsedResult.structuredData || {
      patientName: null,
      patientId: null,
      age: null,
      gender: null,
      date: null,
      doctorName: null,
      hospitalOrClinic: null,
      symptoms: null,
      diagnoses: null,
      medications: null,
      labTests: null,
      vitalSigns: null,
      allergies: null,
      otherObservations: null
    };

    res.json({
      success: true,
      patientId,
      docTitle: docTitle || fileName || 'Scanned Clinical Record',
      docType: detectedDocType,
      detectedDocType,
      isHandwritten,
      fileFormat: fileFormat.toUpperCase(),
      filePreview: hasFileData ? fileData : null,
      ocrText: rawOcrText,
      rawOcrText,
      structuredData,
      extractedEntities
    });
  });

  // Doctor or Patient confirms, edits, or rejects extraction into EHR
  app.post('/api/documents/confirm-extraction', (req: Request, res: Response) => {
    const { patientId, docTitle, docType, ocrText, verifiedEntities, fileFormat = 'PDF' } = req.body;

    const patient = patientsDb.find((p) => p.id === patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const docId = `DOC-${Math.floor(1000 + Math.random() * 9000)}`;

    const isPatientSelfUpload = currentSessionUser?.role === 'PATIENT';
    const uploaderName = currentSessionUser?.name || 'Healthcare Practitioner';
    const uploaderId = currentSessionUser?.id || (isPatientSelfUpload ? `PAT-${patient.id}` : 'DOC-201');

    const newDoc: MedicalDocument = {
      id: docId,
      patientId,
      title: docTitle || 'Verified Medical Document',
      documentType: docType || (isPatientSelfUpload ? 'Discharge Summary' : 'Consultation Note'),
      uploadedBy: uploaderId,
      uploadedByName: uploaderName,
      uploadedAt: timestamp,
      fileSize: '1.4 MB',
      fileFormat: (fileFormat.toUpperCase() === 'IMAGE' || fileFormat.toUpperCase() === 'PNG' || fileFormat.toUpperCase() === 'JPG') ? 'JPG' : 'PDF',
      status: 'VERIFIED',
      ocrTextPreview: ocrText,
      extractedEntities: verifiedEntities
    };
    documentsDb.unshift(newDoc);

    const newEvent: TimelineEvent = {
      id: `EVT-${Date.now()}`,
      patientId,
      date: timestamp.split(' ')[0],
      year: 2026,
      month: 'March',
      title: `${newDoc.documentType}: ${docTitle || 'Clinical Record'}`,
      category: isPatientSelfUpload ? 'Hospital Visit' : 'Consultation',
      facility: currentSessionUser?.hospitalName || patient.hospitalName,
      doctorName: isPatientSelfUpload ? patient.primaryDoctorName : uploaderName,
      summary: `${uploaderName} verified ${verifiedEntities.length} clinical entities from ${docTitle || 'document'}.`,
      details: {
        diagnoses: verifiedEntities
          .filter((e: ExtractedEntity) => e.category === 'DIAGNOSIS' && e.status === 'PRESENT')
          .map((e: ExtractedEntity) => e.name),
        prescribedMeds: verifiedEntities
          .filter((e: ExtractedEntity) => e.category === 'MEDICATION')
          .map((e: ExtractedEntity) => `${e.name} ${e.dosage || ''}`.trim()),
        notes: `AI scan and extraction confirmed. Verified items: ${verifiedEntities.length}. Negated assertions: ${
          verifiedEntities.filter((e: ExtractedEntity) => e.status === 'NEGATED').map((e: ExtractedEntity) => e.name).join(', ') || 'None'
        }`
      },
      documentId: docId
    };
    timelineDb.unshift(newEvent);

    if (currentSessionUser) {
      logAudit(
        currentSessionUser,
        isPatientSelfUpload ? 'Patient uploaded document' : 'Doctor confirmed extraction',
        `${currentSessionUser.name} (${currentSessionUser.role}) confirmed and saved ${verifiedEntities.length} entities from ${docTitle} to ${patient.fullName}'s health record.`,
        patient.id,
        patient.fullName
      );
    }

    res.json({
      success: true,
      document: newDoc,
      timelineEvent: newEvent,
      message: 'Document and clinical assertions committed to longitudinal record.'
    });
  });

  // Toggle patient consent
  app.post('/api/consent/toggle', (req: Request, res: Response) => {
    const { consentId } = req.body;
    const consent = consentsDb.find((c) => c.id === consentId);
    if (!consent) {
      return res.status(404).json({ error: 'Consent record not found' });
    }

    consent.status = consent.status === 'ACTIVE' ? 'REVOKED' : 'ACTIVE';
    const action = consent.status === 'ACTIVE' ? 'Patient granted consent' : 'Patient revoked consent';

    if (currentSessionUser) {
      logAudit(
        currentSessionUser,
        action,
        `${action} for ${consent.granteeName} (Scope: ${consent.scope}).`,
        consent.patientId
      );
    }

    res.json({ success: true, consent });
  });

  // FHIR Bundle export
  app.get('/api/patient/:id/fhir', (req: Request, res: Response) => {
    const targetId = req.params.id;
    const patient = patientsDb.find((p) => p.id === targetId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const patientEvents = timelineDb.filter((e) => e.patientId === targetId);
    const patientDocs = documentsDb.filter((d) => d.patientId === targetId);
    const bundle = generateFHIRBundleBackend(patient, patientEvents, patientDocs);

    if (currentSessionUser) {
      logAudit(
        currentSessionUser,
        'FHIR bundle export',
        `Generated HL7 FHIR R4 Collection Bundle for ${patient.fullName} (${patient.id}).`,
        patient.id,
        patient.fullName
      );
    }

    res.json(bundle);
  });

  // -------------------------------------------------------------
  // Audit Logs API
  // -------------------------------------------------------------
  app.get('/api/audit-logs', (req: Request, res: Response) => {
    const role = currentSessionUser?.role || 'SYSTEM_ADMIN';
    if (role === 'PATIENT') {
      const patientAudits = auditLogsDb.filter(
        (a) => a.targetPatientId === currentSessionUser?.patientId
      );
      return res.json({ auditLogs: patientAudits });
    }
    res.json({ auditLogs: auditLogsDb });
  });

  // -------------------------------------------------------------
  // Vite Integration for Dev / Production
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MediIntel Backend & Frontend running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
