import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import config from '../firebase-applet-config.json';

async function testNamedDb() {
  console.log('Testing setDoc on named database with firestore.rules deployed...');
  const app = getApps().length === 0 ? initializeApp(config) : getApp();
  const db = getFirestore(app, config.firestoreDatabaseId);

  try {
    await setDoc(doc(db, 'system', 'ping'), { time: new Date().toISOString() });
    console.log('SETDOC SUCCESS ON NAMED DB!');
  } catch (err: any) {
    console.error('SETDOC ERROR:', err);
  }
}

testNamedDb();
