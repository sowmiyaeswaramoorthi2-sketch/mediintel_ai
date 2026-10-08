import {
  User,
  Patient,
  MedicalDocument,
  TimelineEvent,
  ConsentRecord,
  AuditLog,
  FHIRBundle,
  ExtractedEntity,
  SystemAdminStatsData,
  Hospital
} from '../types/healthcare';

export interface PatientGraphData {
  patientId: string;
  hba1cTrend?: { date: string; value: number; label: string }[];
  bpTrend: { date: string; systolic: number; diastolic: number }[];
  glucoseTrend?: { date: string; fasting: number; postPrandial: number }[];
  customMetric?: { name: string; unit: string; series: { date: string; value: number }[] };
}

export interface PatientRecordResponse {
  patient: Patient;
  timelineEvents: TimelineEvent[];
  documents: MedicalDocument[];
  consents?: ConsentRecord[];
  auditLogs?: AuditLog[];
  graphData?: PatientGraphData | null;
  fhirBundle?: FHIRBundle;
}

export interface SearchPatientsResponse {
  total: number;
  patients: Patient[];
  searchMetadata: {
    query: string;
    parsedTokens: {
      gender?: string;
      minAge?: number;
      conditions: string[];
      medications: string[];
    };
  };
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: 'PATIENT' | 'DOCTOR' | 'HOSPITAL_ADMIN';
  specialty?: string;
  licenseNumber?: string;
  hospitalName?: string;
  city?: string;
  age?: number;
  gender?: string;
  bloodGroup?: string;
}

export const api = {
  async getMe(): Promise<{ user: User | null }> {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) return { user: null };
      return await res.json();
    } catch {
      return { user: null };
    }
  },

  async login(emailOrRoleKey?: string, passwordOrEmail?: string, maybePassword?: string): Promise<{ success: boolean; user: User; token: string }> {
    // Support either login(email, password) or legacy signature login(roleKey, email, password)
    let email = emailOrRoleKey;
    let password = passwordOrEmail;

    if (maybePassword !== undefined) {
      // Called with 3 arguments (roleKey, email, password)
      email = passwordOrEmail;
      password = maybePassword;
    }

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Authentication failed. Please verify your credentials.');
    }
    return data;
  },

  async register(data: RegisterPayload): Promise<{ success: boolean; user: User; token: string }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Registration failed. Please check your details.');
    }
    return result;
  },

  async loginWithGoogle(email?: string, name?: string, role?: string): Promise<{ success: boolean; user: User; token: string }> {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, role })
    });
    if (!res.ok) throw new Error('Google Sign-In failed');
    return await res.json();
  },

  async signUp(data: { name: string; email: string; role: string; hospitalId?: string; specialty?: string; phone?: string; password?: string }): Promise<{ success: boolean; user: User; token: string }> {
    return this.register({
      fullName: data.name,
      email: data.email,
      phone: data.phone || '+91 98450 00000',
      password: data.password || 'User@2026!',
      role: data.role as any,
      specialty: data.specialty
    });
  },

  async logout(): Promise<void> {
    await fetch('/api/auth/logout', { method: 'POST' });
  },

  async getSystemStats(): Promise<SystemAdminStatsData> {
    const res = await fetch('/api/admin/stats');
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch platform metrics and statistics');
    }
    return await res.json();
  },

  async getHospitalData(): Promise<{
    hospital: Hospital & { adminName?: string; adminEmail?: string; adminPhone?: string };
    doctors: any[];
    patients: Patient[];
    documents: MedicalDocument[];
    auditLogs: AuditLog[];
  }> {
    const res = await fetch('/api/hospital/data');
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch hospital administrator records');
    }
    return await res.json();
  },

  async getPatientMe(): Promise<PatientRecordResponse> {
    const res = await fetch('/api/patient/me');
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch personal health record');
    }
    return await res.json();
  },

  async getPatientById(patientId: string): Promise<PatientRecordResponse> {
    const res = await fetch(`/api/patient/${encodeURIComponent(patientId)}`);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const error: any = new Error(errData.message || 'Access Denied');
      error.status = res.status;
      error.code = errData.code || 'ERR_FORBIDDEN';
      error.targetPatientId = errData.targetPatientId || patientId;
      throw error;
    }
    return await res.json();
  },

  async searchPatients(params: {
    q?: string;
    disease?: string;
    medicine?: string;
    gender?: string;
    age?: string;
  }): Promise<SearchPatientsResponse> {
    const searchParams = new URLSearchParams();
    if (params.q) searchParams.set('q', params.q);
    if (params.disease) searchParams.set('disease', params.disease);
    if (params.medicine) searchParams.set('medicine', params.medicine);
    if (params.gender) searchParams.set('gender', params.gender);
    if (params.age) searchParams.set('age', params.age);

    const res = await fetch(`/api/doctor/search?${searchParams.toString()}`);
    if (!res.ok) throw new Error('Failed to search patients');
    return await res.json();
  },

  async processDocument(params: {
    patientId: string;
    docTitle?: string;
    docType?: string;
    customText?: string;
    fileData?: string;
    fileName?: string;
    fileFormat?: string;
  }): Promise<{
    success: boolean;
    patientId: string;
    docTitle: string;
    docType: string;
    detectedDocType: string;
    isHandwritten: boolean;
    fileFormat?: string;
    filePreview?: string | null;
    ocrText: string;
    rawOcrText?: string;
    structuredData: import('../types/healthcare').ExtractedDocumentStructuredData;
    extractedEntities: ExtractedEntity[];
  }> {
    const res = await fetch('/api/documents/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Document processing and OCR extraction failed.');
    }
    return data;
  },

  async confirmExtraction(params: {
    patientId: string;
    docTitle: string;
    docType: string;
    ocrText: string;
    verifiedEntities: ExtractedEntity[];
    fileFormat?: string;
  }): Promise<{
    success: boolean;
    document: MedicalDocument;
    timelineEvent: TimelineEvent;
  }> {
    const res = await fetch('/api/documents/confirm-extraction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error('Failed to confirm extraction');
    return await res.json();
  },

  async toggleConsent(consentId: string): Promise<{ success: boolean; consent: ConsentRecord }> {
    const res = await fetch('/api/consent/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consentId })
    });
    if (!res.ok) throw new Error('Failed to update consent');
    return await res.json();
  },

  async getFHIRBundle(patientId: string): Promise<FHIRBundle> {
    const res = await fetch(`/api/patient/${encodeURIComponent(patientId)}/fhir`);
    if (!res.ok) throw new Error('Failed to export FHIR bundle');
    return await res.json();
  },

  async getAuditLogs(): Promise<{ auditLogs: AuditLog[] }> {
    const res = await fetch('/api/audit-logs');
    if (!res.ok) return { auditLogs: [] };
    return await res.json();
  }
};
