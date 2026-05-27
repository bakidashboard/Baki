import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getDatabase } from 'firebase-admin/database';

export function getFirebaseAdmin() {
  if (getApps().length === 0) {
    if (process.env.FIREBASE_PRIVATE_KEY) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // Replace escaped newlines if they exist
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || process.env.VITE_FIREBASE_DATABASE_URL || "https://baki-ofiicial-default-rtdb.firebaseio.com"
      });
    } else {
      console.warn('Initializing Firebase Admin without credentials. Fallback for environments with implicit Google credentials.');
      initializeApp({
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || process.env.VITE_FIREBASE_DATABASE_URL || "https://baki-ofiicial-default-rtdb.firebaseio.com"
      });
    }
  }

  return {
    auth: getAuth(),
    firestore: getFirestore(),
    database: getDatabase()
  };
}
