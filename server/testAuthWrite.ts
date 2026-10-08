import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import config from '../firebase-applet-config.json';

async function testWithAnonAuth() {
  console.log('Testing with anonymous sign in...');
  const app = getApps().length === 0 ? initializeApp(config) : getApp();
  const auth = getAuth(app);
  const db = config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)'
    ? getFirestore(app, config.firestoreDatabaseId)
    : getFirestore(app);

  try {
    const cred = await signInAnonymously(auth);
    console.log('Anonymous sign-in SUCCESS! UID:', cred.user.uid);
    await setDoc(doc(db, 'system', 'testAuthWrite'), { time: Date.now(), uid: cred.user.uid });
    console.log('Document write SUCCESS with auth!');
  } catch (err: any) {
    console.log('Error during auth or write:', err.message);
  }
}

testWithAnonAuth();
