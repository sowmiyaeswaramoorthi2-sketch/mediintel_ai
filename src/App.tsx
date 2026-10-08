import React, { useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Patient,
  MedicalDocument,
  TimelineEvent,
  ConsentRecord,
  AuditLog,
  ExtractedEntity,
  Hospital
} from './types/healthcare';
import {
  INITIAL_PATIENTS,
  INITIAL_DOCUMENTS,
  INITIAL_TIMELINE_EVENTS,
  INITIAL_CONSENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_HOSPITALS
} from './data/mockData';
import { Navbar } from './components/common/Navbar';
import { AccessDenied } from './components/common/AccessDenied';
import { LoginView } from './components/auth/LoginView';
import { SplashScreen } from './components/common/SplashScreen';
import { DoctorDashboard } from './components/doctor/DoctorDashboard';
import { PatientDetailView } from './components/doctor/PatientDetailView';
import { PatientPortal } from './components/patient/PatientPortal';
import { HospitalAdminDashboard } from './components/hospital/HospitalAdminDashboard';
import { SystemAdminDashboard } from './components/admin/SystemAdminDashboard';
import { api } from './services/api';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { logoutFromFirebase } from './services/firebaseAuth';

export default function App() {
  // Splash screen state (shows when application first opens)
  const [showSplash, setShowSplash] = useState(true);

  // Current active user (starts null so user sees the login site first)
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Core application data collections
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [documents, setDocuments] = useState<MedicalDocument[]>(INITIAL_DOCUMENTS);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(INITIAL_TIMELINE_EVENTS);
  const [consents, setConsents] = useState<ConsentRecord[]>(INITIAL_CONSENTS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [hospitals, setHospitals] = useState<Hospital[]>(INITIAL_HOSPITALS);

  // Selected patient for Doctor detail view and active tab
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedPatientTab, setSelectedPatientTab] = useState<'TIMELINE' | 'GRAPHS' | 'DOCUMENTS' | 'CLINICAL' | 'ADHERENCE' | 'AUDIT'>('CLINICAL');

  // Security violation state (triggers the ACCESS DENIED boundary)
  const [unauthorizedAttempt, setUnauthorizedAttempt] = useState<{
    targetId: string;
    reason: string;
  } | null>(null);

  // Check Firebase Auth and retrieve profile directly from Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          // Fetch real profile registered in Firestore
          const userDocRef = doc(db, 'users', fbUser.uid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            const loadedUser: User = {
              id: fbUser.uid,
              name: data.name || fbUser.email?.split('@')[0] || 'User',
              email: data.email || fbUser.email || '',
              role: data.role as UserRole,
              hospitalId: data.hospitalId || 'HOSP-01',
              hospitalName: data.hospitalName || 'Apex City Multi-Specialty Hospital',
              patientId: data.patientId,
              specialty: data.specialty
            };
            setCurrentUser(loadedUser);
            // Sync with server session
            await fetch('/api/auth/sync-session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ user: loadedUser })
            }).catch(() => {});
            return;
          }
        } catch (err) {
          console.warn('[Firebase Auth] Firestore document fetch error:', err);
        }
      }

      // Fallback check existing session from API
      api.getMe().then((res) => {
        if (res.user) {
          setCurrentUser(res.user);
        }
      });
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await logoutFromFirebase().catch(() => {});
    await api.logout().catch(() => {});
    setCurrentUser(null);
    setSelectedPatient(null);
    setUnauthorizedAttempt(null);
  };

  // When patient attempts unauthorized access to another patient's record
  const handleAttemptUnauthorizedAccess = async (targetId: string) => {
    try {
      // Direct call to backend endpoint - backend will strictly enforce RBAC and return 403
      await api.getPatientById(targetId);
    } catch (err: any) {
      setUnauthorizedAttempt({
        targetId,
        reason:
          err.message ||
          'A patient must never access another patient\'s data. This incident has been logged in the immutable security audit trail.'
      });
    }
  };

  // Doctor saves extracted document
  const handleSaveExtractedDocument = async (
    docTitle: string,
    docType: MedicalDocument['documentType'],
    ocrText: string,
    verifiedEntities: ExtractedEntity[]
  ) => {
    if (!selectedPatient) return;

    try {
      const res = await api.confirmExtraction({
        patientId: selectedPatient.id,
        docTitle,
        docType,
        ocrText,
        verifiedEntities
      });

      setDocuments((prev) => [res.document, ...prev]);
      setTimelineEvents((prev) => [res.timelineEvent, ...prev]);
    } catch (err) {
      console.error(err);
    }
  };

  // If splash screen is active on app open, render SplashScreen
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} durationMs={2200} />;
  }

  // If user is not logged in, show Login Landing Site
  if (!currentUser) {
    return <LoginView onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Global Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        onSelectPatientDirectly={() => setSelectedPatient(patients[0])}
        onTriggerUnauthorizedAccess={() =>
          handleAttemptUnauthorizedAccess('PAT-1002 (Ananya Roy)')
        }
      />

      {/* Main Content Viewport */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1">
        {/* ACCESS DENIED SECURITY BOUNDARY OVERLAY */}
        {unauthorizedAttempt ? (
          <AccessDenied
            currentUser={currentUser}
            attemptedTargetId={unauthorizedAttempt.targetId}
            reason={unauthorizedAttempt.reason}
            onReturnToAuthorized={() => setUnauthorizedAttempt(null)}
          />
        ) : (
          <>
            {/* DOCTOR VIEW */}
            {currentUser.role === 'DOCTOR' && (
              <>
                {selectedPatient ? (
                  <PatientDetailView
                    patient={selectedPatient}
                    currentUser={currentUser}
                    timelineEvents={timelineEvents}
                    documents={documents}
                    auditLogs={auditLogs}
                    initialTab={selectedPatientTab}
                    onBack={() => setSelectedPatient(null)}
                    onSaveNewDocument={handleSaveExtractedDocument}
                    onRequestUnauthorizedTest={() =>
                      handleAttemptUnauthorizedAccess('PAT-1003')
                    }
                  />
                ) : (
                  <DoctorDashboard
                    currentUser={currentUser}
                    onSelectPatient={(patient, tab = 'CLINICAL') => {
                      setSelectedPatient(patient);
                      setSelectedPatientTab(tab);
                    }}
                  />
                )}
              </>
            )}

            {/* PATIENT VIEW */}
            {currentUser.role === 'PATIENT' && (
              <PatientPortal
                currentUser={currentUser}
                onAttemptUnauthorizedAccess={handleAttemptUnauthorizedAccess}
                onLogout={handleLogout}
              />
            )}

            {/* HOSPITAL ADMIN VIEW */}
            {currentUser.role === 'HOSPITAL_ADMIN' && (
              <HospitalAdminDashboard
                currentUser={currentUser}
                hospital={hospitals[0]}
                patients={patients}
                documents={documents}
                auditLogs={auditLogs}
              />
            )}

            {/* SYSTEM ADMIN VIEW */}
            {currentUser.role === 'SYSTEM_ADMIN' && (
              <SystemAdminDashboard
                currentUser={currentUser}
                hospitals={hospitals}
                patients={patients}
                documents={documents}
                auditLogs={auditLogs}
              />
            )}
          </>
        )}
      </main>

      {/* Clinical Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800">MediIntel</span>
            <span>•</span>
            <span>Healthcare Medical Record Intelligence Platform</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px]">
            <span>Role-Based Access Control (RBAC)</span>
            <span>•</span>
            <span>Longitudinal Health Records</span>
            <span>•</span>
            <span>Context & Negation Assertion Model</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
