// Run this once to create the admin user in Firebase
// Usage: node setup_admin.mjs

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getDatabase, ref, set } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBNANAedfLG3Pm91lgMbSZLMv2U8VrqHbo",
  authDomain: "cfms-3e57a.firebaseapp.com",
  projectId: "cfms-3e57a",
  databaseURL: "https://cfms-3e57a-default-rtdb.firebaseio.com",
  storageBucket: "cfms-3e57a.firebasestorage.app",
  messagingSenderId: "596883715211",
  appId: "1:596883715211:web:647849d40107ab7a7f108e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

async function setup() {
  try {
    console.log('Creating admin user...');
    const cred = await createUserWithEmailAndPassword(auth, 'admin@local.community', 'admin123!');
    const uid = cred.user.uid;
    console.log('✅ User created, UID:', uid);

    console.log('Setting role in Realtime Database...');
    await set(ref(db, `users/${uid}`), {
      uid,
      name: 'Administrator',
      role: 'National Director',
      email: 'admin@local.community',
    });
    console.log('✅ Role set to National Director');
    console.log('');
    console.log('🎉 Done! You can now log in with:');
    console.log('   Username: admin');
    console.log('   Password: admin123!');
    process.exit(0);
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') {
      console.log('ℹ️  Admin user already exists — nothing to do.');
    } else {
      console.error('❌ Error:', err.message);
    }
    process.exit(1);
  }
}

setup();
