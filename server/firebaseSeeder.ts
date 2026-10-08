import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  getDocs
} from 'firebase/firestore';
import { BACKEND_PATIENTS } from './data/patients15';
import {
  BACKEND_TIMELINE_EVENTS,
  BACKEND_DOCUMENTS,
  BACKEND_CONSENTS,
  BACKEND_AUDIT_LOGS
} from './data/clinicalRecords';
import config from '../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(config) : getApp();

export const db = config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, config.firestoreDatabaseId)
  : getFirestore(app);

/**
 * Seeds all 15 longitudinal patients and all clinical datasets into Firestore
 */
export async function seedFirestoreDatabase(): Promise<{
  patients: number;
  timelineEvents: number;
  documents: number;
  consents: number;
  auditLogs: number;
  users: number;
}> {
  console.log('[Firebase Seed] Commencing Firestore population with clinical datasets...');

  // 1. Seed All 15 Patients
  const patientsCount = BACKEND_PATIENTS.length;
  for (const patient of BACKEND_PATIENTS) {
    await setDoc(doc(db, 'patients', patient.id), patient, { merge: true });
  }
  console.log(`[Firebase Seed] Successfully seeded ${patientsCount} patient records.`);

  // 2. Generate and seed timeline events for all 15 patients
  let eventsCount = 0;
  // Seed the predefined detailed events
  for (const evt of BACKEND_TIMELINE_EVENTS) {
    await setDoc(doc(db, 'timelineEvents', evt.id), evt, { merge: true });
    eventsCount++;
  }

  // Ensure every patient has longitudinal timeline events in Firestore
  for (const patient of BACKEND_PATIENTS) {
    const existingForPatient = BACKEND_TIMELINE_EVENTS.filter((e) => e.patientId === patient.id);
    if (existingForPatient.length === 0) {
      // Create baseline consultation event
      const eventId = `EVT-AUTO-${patient.id}-01`;
      const autoEvent = {
        id: eventId,
        patientId: patient.id,
        date: patient.registeredDate || '2025-06-15',
        year: 2025,
        month: 'June',
        title: 'Comprehensive Baseline Clinical Evaluation',
        category: 'Consultation',
        facility: patient.hospitalName || 'Apex City Multi-Specialty Hospital',
        doctorName: patient.primaryDoctorName || 'Dr. Sarah Mathew, MD',
        summary: `Baseline intake completed. Active conditions: ${patient.activeConditions.join(', ')}. Current therapy: ${patient.currentMedications.join(', ')}.`,
        details: {
          diagnoses: patient.activeConditions,
          vitals: patient.latestVitals ? {
            'Blood Pressure': patient.latestVitals.bloodPressure,
            'Heart Rate': `${patient.latestVitals.heartRate} bpm`,
            'HbA1c': `${patient.latestVitals.hba1c}%`
          } : undefined,
          prescribedMeds: patient.currentMedications,
          notes: 'Baseline longitudinal profile initiated.'
        }
      };
      await setDoc(doc(db, 'timelineEvents', eventId), autoEvent, { merge: true });
      eventsCount++;

      // Create lab panel event
      const labEventId = `EVT-AUTO-${patient.id}-02`;
      const labEvent = {
        id: labEventId,
        patientId: patient.id,
        date: patient.latestVitals?.lastRecorded || '2026-02-10',
        year: 2026,
        month: 'February',
        title: 'Diagnostic Biochemical & Metabolic Panel',
        category: 'Lab Result',
        facility: 'Apex Central Diagnostics Laboratory',
        doctorName: patient.primaryDoctorName || 'Dr. Sarah Mathew, MD',
        summary: `Metabolic screening conducted. Glycated Hemoglobin: ${patient.latestVitals?.hba1c}%. Fasting glucose: ${patient.latestVitals?.glucoseFasting} mg/dL.`,
        details: {
          labValues: [
            { parameter: 'HbA1c Glycated Hemoglobin', value: `${patient.latestVitals?.hba1c} %`, flag: 'NORMAL' },
            { parameter: 'Fasting Blood Sugar', value: `${patient.latestVitals?.glucoseFasting} mg/dL`, flag: 'NORMAL' }
          ]
        }
      };
      await setDoc(doc(db, 'timelineEvents', labEventId), labEvent, { merge: true });
      eventsCount++;
    }
  }
  console.log(`[Firebase Seed] Successfully seeded ${eventsCount} longitudinal timeline events.`);

  // 3. Seed Medical Documents
  let docsCount = 0;
  for (const d of BACKEND_DOCUMENTS) {
    await setDoc(doc(db, 'documents', d.id), d, { merge: true });
    docsCount++;
  }
  console.log(`[Firebase Seed] Successfully seeded ${docsCount} medical documents.`);

  // 4. Seed Consents
  let consentsCount = 0;
  for (const c of BACKEND_CONSENTS) {
    await setDoc(doc(db, 'consents', c.id), c, { merge: true });
    consentsCount++;
  }
  // Ensure consents exist for each patient
  for (const patient of BACKEND_PATIENTS) {
    if (!BACKEND_CONSENTS.some((c) => c.patientId === patient.id)) {
      const consentId = `CON-AUTO-${patient.id}`;
      const consentDoc = {
        id: consentId,
        patientId: patient.id,
        granteeName: patient.primaryDoctorName || 'Dr. Sarah Mathew, MD',
        granteeRole: 'Doctor (Internal Medicine)',
        hospitalName: patient.hospitalName || 'Apex City Multi-Specialty Hospital',
        scope: 'Full Medical Record',
        status: 'ACTIVE',
        grantedDate: patient.registeredDate || '2025-01-01',
        expiryDate: '2028-01-01'
      };
      await setDoc(doc(db, 'consents', consentId), consentDoc, { merge: true });
      consentsCount++;
    }
  }
  console.log(`[Firebase Seed] Successfully seeded ${consentsCount} consent agreements.`);

  // 5. Seed Audit Logs
  let auditLogsCount = 0;
  for (const a of BACKEND_AUDIT_LOGS) {
    await setDoc(doc(db, 'auditLogs', a.id), a, { merge: true });
    auditLogsCount++;
  }
  console.log(`[Firebase Seed] Successfully seeded ${auditLogsCount} compliance audit entries.`);

  // 6. Seed System Users
  const systemUsers = [
    {
      id: 'DOC-201',
      name: 'Dr. Sarah Mathew, MD',
      email: 'sarah.mathew@apexhospital.org',
      role: 'DOCTOR',
      hospitalId: 'HOSP-01',
      hospitalName: 'Apex City Multi-Specialty Hospital',
      specialty: 'Endocrinology & Internal Medicine',
      licenseNumber: 'MCI-REG-84920'
    },
    {
      id: 'PAT-USER-1001',
      name: 'Arun Kumar',
      email: 'arun.kumar@gmail.com',
      role: 'PATIENT',
      patientId: 'PAT-1001',
      hospitalId: 'HOSP-01',
      hospitalName: 'Apex City Multi-Specialty Hospital'
    },
    {
      id: 'HOSP-ADMIN-01',
      name: 'Marcus Vance',
      email: 'marcus.vance@apexhospital.org',
      role: 'HOSPITAL_ADMIN',
      hospitalId: 'HOSP-01',
      hospitalName: 'Apex City Multi-Specialty Hospital'
    },
    {
      id: 'SYS-ADMIN-01',
      name: 'Dr. Clara Chen',
      email: 'clara.chen@mediintel.org',
      role: 'SYSTEM_ADMIN'
    }
  ];

  for (const u of systemUsers) {
    await setDoc(doc(db, 'users', u.id), u, { merge: true });
  }
  console.log(`[Firebase Seed] Successfully seeded ${systemUsers.length} system users.`);

  console.log('[Firebase Seed] Completed Firestore seeding successfully.');

  return {
    patients: patientsCount,
    timelineEvents: eventsCount,
    documents: docsCount,
    consents: consentsCount,
    auditLogs: auditLogsCount,
    users: systemUsers.length
  };
}
