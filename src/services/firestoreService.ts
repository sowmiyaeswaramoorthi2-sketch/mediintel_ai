import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  onSnapshot,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from './firebase';
import {
  Patient,
  TimelineEvent,
  MedicalDocument,
  ConsentRecord,
  AuditLog,
  User
} from '../types/healthcare';

/**
 * Service to directly read and write to the seeded Firebase Firestore database
 */
export const firestoreService = {
  /**
   * Fetch all 15 seeded patients directly from Firestore
   */
  async getPatients(): Promise<Patient[]> {
    try {
      const snap = await getDocs(collection(db, 'patients'));
      if (snap.empty) {
        return [];
      }
      return snap.docs.map((d) => d.data() as Patient);
    } catch (err) {
      console.warn('[Firestore] Error fetching patients:', err);
      return [];
    }
  },

  /**
   * Fetch a specific patient record
   */
  async getPatientById(patientId: string): Promise<Patient | null> {
    try {
      const snap = await getDoc(doc(db, 'patients', patientId));
      if (!snap.exists()) return null;
      return snap.data() as Patient;
    } catch (err) {
      console.warn(`[Firestore] Error fetching patient ${patientId}:`, err);
      return null;
    }
  },

  /**
   * Fetch timeline events for a patient from Firestore
   */
  async getTimelineEvents(patientId: string): Promise<TimelineEvent[]> {
    try {
      const snap = await getDocs(collection(db, 'timelineEvents'));
      const events = snap.docs
        .map((d) => d.data() as TimelineEvent)
        .filter((e) => e.patientId === patientId);
      return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (err) {
      console.warn(`[Firestore] Error fetching events for ${patientId}:`, err);
      return [];
    }
  },

  /**
   * Fetch medical documents for a patient from Firestore
   */
  async getDocuments(patientId: string): Promise<MedicalDocument[]> {
    try {
      const snap = await getDocs(collection(db, 'documents'));
      return snap.docs
        .map((d) => d.data() as MedicalDocument)
        .filter((d) => d.patientId === patientId);
    } catch (err) {
      console.warn(`[Firestore] Error fetching documents for ${patientId}:`, err);
      return [];
    }
  },

  /**
   * Fetch consent records for a patient from Firestore
   */
  async getConsents(patientId: string): Promise<ConsentRecord[]> {
    try {
      const snap = await getDocs(collection(db, 'consents'));
      return snap.docs
        .map((d) => d.data() as ConsentRecord)
        .filter((c) => c.patientId === patientId);
    } catch (err) {
      console.warn(`[Firestore] Error fetching consents for ${patientId}:`, err);
      return [];
    }
  },

  /**
   * Fetch system audit logs from Firestore
   */
  async getAuditLogs(patientId?: string): Promise<AuditLog[]> {
    try {
      const snap = await getDocs(collection(db, 'auditLogs'));
      const logs = snap.docs.map((d) => d.data() as AuditLog);
      if (patientId) {
        return logs.filter((l) => l.targetPatientId === patientId);
      }
      return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (err) {
      console.warn('[Firestore] Error fetching audit logs:', err);
      return [];
    }
  },

  /**
   * Save or update an audit log directly to Firestore
   */
  async recordAuditLog(log: AuditLog): Promise<void> {
    try {
      await setDoc(doc(db, 'auditLogs', log.id), log);
    } catch (err) {
      console.warn('[Firestore] Error recording audit log:', err);
    }
  }
};
