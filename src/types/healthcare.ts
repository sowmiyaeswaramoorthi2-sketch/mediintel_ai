export type UserRole = 'PATIENT' | 'DOCTOR' | 'HOSPITAL_ADMIN' | 'SYSTEM_ADMIN';

export interface User {
  id: string; // Unique User ID, e.g. 'USR-1025'
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  registrationDate?: string;
  avatar?: string;
  hospitalId?: string;
  hospitalName?: string;
  patientId?: string; // For PATIENT role, e.g. PAT-1001 or unique PAT-XXXX
  doctorId?: string; // For DOCTOR role, e.g. DOC-201
  specialty?: string; // For DOCTOR role
  licenseNumber?: string;
}

export interface RegisteredPatientCategoryItem {
  id: string;
  patientId: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  registeredDate: string;
  age?: number;
  gender?: string;
  activeConditionsCount?: number;
}

export interface RegisteredDoctorCategoryItem {
  id: string;
  doctorId: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  hospital: string;
  license: string;
  registeredDate: string;
}

export interface RegisteredHospitalCategoryItem {
  id: string;
  hospitalId: string;
  name: string;
  city: string;
  adminName: string;
  email: string;
  phone: string;
  userId?: string;
  doctorsCount: number;
  patientsCount: number;
}

export interface SystemAdminStatsData {
  totalPatients: number;
  totalDoctors: number;
  totalHospitals: number;
  totalRegisteredUsers: number;
  categories: {
    patients: RegisteredPatientCategoryItem[];
    doctors: RegisteredDoctorCategoryItem[];
    hospitals: RegisteredHospitalCategoryItem[];
  };
}

export interface Patient {
  id: string; // e.g. 'PAT-1001'
  fullName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: string;
  bloodGroup: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  primaryDoctorId: string;
  primaryDoctorName: string;
  hospitalId: string;
  hospitalName: string;
  registeredDate: string;
  activeConditions: string[];
  currentMedications: string[];
  allergies: string[];
  latestVitals: {
    bloodPressure: string;
    heartRate: number;
    hba1c?: number;
    glucoseFasting?: number;
    bmi: number;
    spO2: number;
    temperature: number;
    lastRecorded: string;
  };
  qrIdentityToken: string; // Cryptographic reference token for QR
}

export type NegationStatus = 'PRESENT' | 'NEGATED' | 'UNCERTAIN';

export type VerificationStatus = 'CONFIRMED' | 'PENDING' | 'REJECTED' | 'EDITED';

export type EntityCategory = 'DIAGNOSIS' | 'MEDICATION' | 'LAB_RESULT' | 'PROCEDURE' | 'SYMPTOM_STATEMENT';

export interface StructuredSymptom {
  name: string;
  status: NegationStatus;
  confidence: number;
  sourceEvidence?: string;
  isUncertain?: boolean;
}

export interface StructuredDiagnosis {
  name: string;
  status: NegationStatus;
  confidence: number;
  clinicalCode?: string;
  sourceEvidence?: string;
  isUncertain?: boolean;
}

export interface StructuredMedication {
  name: string;
  dosage?: string | null;
  frequency?: string | null;
  duration?: string | null;
  instructions?: string | null;
  status: NegationStatus;
  confidence: number;
  clinicalCode?: string;
  sourceEvidence?: string;
  isUncertain?: boolean;
}

export interface StructuredLabTest {
  testName: string;
  result: string;
  referenceRange?: string | null;
  unit?: string | null;
  flag?: 'NORMAL' | 'HIGH' | 'LOW' | 'ABNORMAL' | null;
  confidence: number;
  sourceEvidence?: string;
  isUncertain?: boolean;
}

export interface StructuredVitalSign {
  name: string;
  value: string;
  unit?: string | null;
  confidence: number;
  sourceEvidence?: string;
  isUncertain?: boolean;
}

export interface StructuredAllergy {
  substance: string;
  reaction?: string | null;
  confidence: number;
  sourceEvidence?: string;
  isUncertain?: boolean;
}

export interface StructuredObservation {
  label: string;
  value: string;
  confidence: number;
  sourceEvidence?: string;
  isUncertain?: boolean;
}

export interface ExtractedDocumentStructuredData {
  patientName: string | null;
  patientId: string | null;
  age: string | null;
  gender: string | null;
  date: string | null;
  doctorName: string | null;
  hospitalOrClinic: string | null;
  symptoms: StructuredSymptom[] | null;
  diagnoses: StructuredDiagnosis[] | null;
  medications: StructuredMedication[] | null;
  labTests: StructuredLabTest[] | null;
  vitalSigns: StructuredVitalSign[] | null;
  allergies: StructuredAllergy[] | null;
  otherObservations: StructuredObservation[] | null;
}

export interface ExtractedEntity {
  id: string;
  category: EntityCategory;
  name: string;
  value?: string;
  unit?: string;
  dosage?: string;
  frequency?: string;
  status: NegationStatus; // PRESENT vs NEGATED vs UNCERTAIN
  confidence: number; // 0 to 100 percentage
  sourceEvidence: string; // Exact text quote from document
  sourcePage?: number;
  verificationStatus: VerificationStatus;
  clinicalCode?: string; // e.g. ICD-10 or SNOMED CT or LOINC
  doctorNotes?: string;
  isUncertain?: boolean;
}

export interface MedicalDocument {
  id: string;
  patientId: string;
  title: string;
  documentType: 'Discharge Summary' | 'Lab Report' | 'Prescription' | 'Consultation Note' | 'Radiology Report';
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: string;
  fileSize: string;
  fileFormat: 'PDF' | 'JPG' | 'JPEG' | 'PNG';
  status: 'PROCESSED' | 'PROCESSING' | 'PENDING_REVIEW' | 'VERIFIED';
  ocrTextPreview: string;
  extractedEntities: ExtractedEntity[];
}

export interface TimelineEvent {
  id: string;
  patientId: string;
  date: string; // ISO date string e.g. '2026-03-12'
  year: number;
  month: string;
  title: string;
  category: 'Hospital Visit' | 'Consultation' | 'Lab Result' | 'Medication Update' | 'Procedure' | 'Prescription';
  facility: string;
  doctorName: string;
  summary: string;
  details: {
    diagnoses?: string[];
    vitals?: Record<string, string | number>;
    prescribedMeds?: string[];
    labValues?: { parameter: string; value: string; flag?: 'NORMAL' | 'HIGH' | 'LOW' }[];
    notes?: string;
  };
  documentId?: string;
}

export interface ConsentRecord {
  id: string;
  patientId: string;
  granteeName: string;
  granteeRole: string;
  hospitalName: string;
  scope: 'Full Medical Record' | 'Emergency Care Only' | 'Prescriptions & Labs' | 'Anonymized Research';
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  grantedDate: string;
  expiryDate: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: 
    | 'Doctor viewed patient record'
    | 'Doctor uploaded document'
    | 'Patient uploaded document'
    | 'AI processed document'
    | 'Doctor confirmed extraction'
    | 'Doctor edited extraction'
    | 'Doctor rejected extraction'
    | 'Patient granted consent'
    | 'Patient revoked consent'
    | 'Unauthorized access attempt'
    | 'FHIR bundle export'
    | 'Patient identity scanned via QR';
  targetPatientId?: string;
  targetPatientName?: string;
  hospitalId?: string;
  hospitalName?: string;
  status: 'SUCCESS' | 'DENIED' | 'WARNING';
  details: string;
  ipAddress: string;
}

export interface FHIRResource {
  resourceType: string;
  id: string;
  [key: string]: any;
}

export interface FHIRBundle {
  resourceType: 'Bundle';
  id: string;
  type: 'collection' | 'searchset';
  timestamp: string;
  total: number;
  entry: {
    fullUrl: string;
    resource: FHIRResource;
  }[];
}

export interface Hospital {
  id: string;
  name: string;
  city: string;
  doctorsCount: number;
  patientsCount: number;
  documentsProcessed: number;
  status: 'ACTIVE' | 'MAINTENANCE';
}
