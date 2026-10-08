import { seedFirestoreDatabase } from './firebaseSeeder';

async function run() {
  try {
    const results = await seedFirestoreDatabase();
    console.log('Seeding finished successfully:', JSON.stringify(results));
    process.exit(0);
  } catch (err) {
    console.error('Seeding encountered an error:', err);
    process.exit(1);
  }
}

run();
