import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { User, UserRole } from '../types/healthcare';

export interface FirebaseRegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  hospitalId?: string;
  specialty?: string;
}

/**
 * Register a new user in Firebase Auth and persist profile in Firestore 'users' collection
 */
export async function registerWithFirebase(data: FirebaseRegisterData): Promise<User> {
  const cleanEmail = data.email.trim().toLowerCase();
  const cleanName = data.name.trim();

  // 1. Create user in Firebase Authentication
  const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, data.password);
  const fbUser = userCredential.user;

  // 2. Prepare structured User profile for Firestore
  const isDoctor = data.role === 'DOCTOR';
  const isPatient = data.role === 'PATIENT';
  const displayName = isDoctor && !cleanName.startsWith('Dr.') ? `Dr. ${cleanName}, MD` : cleanName;

  const newUserProfile: User = {
    id: fbUser.uid,
    name: displayName,
    email: cleanEmail,
    role: data.role,
    hospitalId: data.hospitalId || 'HOSP-01',
    hospitalName: 'Apex City Multi-Specialty Hospital',
    patientId: isPatient ? `PAT-${fbUser.uid.slice(0, 5).toUpperCase()}` : undefined,
    specialty: isDoctor ? (data.specialty || 'Internal Medicine & Clinical Care') : undefined
  };

  // 3. Persist in Firestore 'users' collection
  try {
    const userDocRef = doc(db, 'users', fbUser.uid);
    await setDoc(userDocRef, {
      ...newUserProfile,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('[Firebase Auth] Notice saving to Firestore doc, continuing with authenticated state:', err);
  }

  // Also sync with server session proxy
  await fetch('/api/auth/sync-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user: newUserProfile })
  }).catch(() => {});

  return newUserProfile;
}

/**
 * Sign in existing user with Firebase Auth and retrieve profile from Firestore
 */
export async function loginWithFirebase(
  email: string,
  pass: string,
  expectedRole?: UserRole
): Promise<User> {
  const cleanEmail = email.trim().toLowerCase();

  // 1. Authenticate against Firebase Auth
  const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, pass);
  const fbUser = userCredential.user;

  // 2. Retrieve user record from Firestore
  let userProfile: User | null = null;

  try {
    const userDocRef = doc(db, 'users', fbUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const data = userDocSnap.data();
      userProfile = {
        id: fbUser.uid,
        name: data.name || cleanEmail.split('@')[0],
        email: cleanEmail,
        role: (data.role as UserRole) || expectedRole || 'PATIENT',
        hospitalId: data.hospitalId || 'HOSP-01',
        hospitalName: data.hospitalName || 'Apex City Multi-Specialty Hospital',
        patientId: data.patientId,
        specialty: data.specialty
      };
    }
  } catch (err) {
    console.warn('[Firebase Auth] Firestore fetch fallback:', err);
  }

  // If no document existed in Firestore yet, create it from the authenticated Firebase identity
  if (!userProfile) {
    const fallbackName = cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const finalRole: UserRole = expectedRole || 'PATIENT';
    const finalName = finalRole === 'DOCTOR' && !fallbackName.startsWith('Dr.') ? `Dr. ${fallbackName}, MD` : fallbackName;

    userProfile = {
      id: fbUser.uid,
      name: finalName,
      email: cleanEmail,
      role: finalRole,
      hospitalId: 'HOSP-01',
      hospitalName: 'Apex City Multi-Specialty Hospital',
      patientId: finalRole === 'PATIENT' ? `PAT-${fbUser.uid.slice(0, 5).toUpperCase()}` : undefined,
      specialty: finalRole === 'DOCTOR' ? 'Internal Medicine & Clinical Care' : undefined
    };

    // Attempt to write the missing document
    try {
      await setDoc(doc(db, 'users', fbUser.uid), {
        ...userProfile,
        createdAt: new Date().toISOString()
      });
    } catch {}
  }

  // Also sync with server session proxy
  await fetch('/api/auth/sync-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user: userProfile })
  }).catch(() => {});

  return userProfile;
}

/**
 * Fetch currently logged in user profile from Firestore using Firebase Auth state
 */
export async function getFirebaseCurrentUser(): Promise<User | null> {
  const fbUser = auth.currentUser;
  if (!fbUser) return null;

  try {
    const userDocRef = doc(db, 'users', fbUser.uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      const data = userDocSnap.data();
      return {
        id: fbUser.uid,
        name: data.name || fbUser.email?.split('@')[0] || 'Healthcare User',
        email: fbUser.email || '',
        role: data.role as UserRole,
        hospitalId: data.hospitalId,
        hospitalName: data.hospitalName,
        patientId: data.patientId,
        specialty: data.specialty
      };
    }
  } catch (err) {
    console.error('[Firebase Auth] Error reading user doc:', err);
  }

  return null;
}

/**
 * Log out from Firebase Auth
 */
export async function logoutFromFirebase(): Promise<void> {
  await signOut(auth);
  await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
}
