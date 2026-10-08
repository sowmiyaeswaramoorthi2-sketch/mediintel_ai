import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import config from '../firebase-applet-config.json';

async function testWrite() {
  console.log('Testing write with default db vs named db...');
  console.log('config:', JSON.stringify(config, null, 2));

  const app = initializeApp(config);

  // Test 1: getFirestore(app)
  try {
    console.log('Attempting write to getFirestore(app)...');
    const defaultDb = getFirestore(app);
    await setDoc(doc(defaultDb, 'system', 'testDefault'), { time: Date.now() });
    console.log('SUCCESS with defaultDb!');
  } catch (err: any) {
    console.log('defaultDb failed:', err.message);
  }

  // Test 2: getFirestore(app, config.firestoreDatabaseId)
  if (config.firestoreDatabaseId) {
    try {
      console.log(`Attempting write to getFirestore(app, "${config.firestoreDatabaseId}")...`);
      const namedDb = getFirestore(app, config.firestoreDatabaseId);
      await setDoc(doc(namedDb, 'system', 'testNamed'), { time: Date.now() });
      console.log('SUCCESS with namedDb!');
    } catch (err: any) {
      console.log('namedDb failed:', err.message);
    }
  }
}

testWrite();
