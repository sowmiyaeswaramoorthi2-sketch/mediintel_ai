import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import config from '../firebase-applet-config.json';

async function testWithEmailAuth() {
  console.log('Testing with email/password auth...');
  const app = getApps().length === 0 ? initializeApp(config) : getApp();
  const auth = getAuth(app);
  const db = config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)'
    ? getFirestore(app, config.firestoreDatabaseId)
    : getFirestore(app);

  const testEmail = `admin_seed_${Date.now()}@mediintel.org`;
  const testPass = 'AdminSeedPass123!';

  let userCred;
  try {
    userCred = await createUserWithEmailAndPassword(auth, testEmail, testPass);
    console.log('User created:', userCred.user.uid);
  } catch (createErr: any) {
    console.log('Create error, trying sign in:', createErr.message);
    userCred = await signInWithEmailAndPassword(auth, testEmail, testPass);
  }

  try {
    await setDoc(doc(db, 'system', 'testEmailWrite'), { time: Date.now(), uid: userCred.user.uid });
    console.log('WRITE SUCCESS WITH AUTHENTICATED USER!');
  } catch (err: any) {
    console.log('Write failed even with auth:', err.message);
  }
}

testWithEmailAuth();
