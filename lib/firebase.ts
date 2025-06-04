// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';
import { getFunctions, type Functions } from 'firebase/functions';
import { firebaseConfig } from './firebaseConfig';

let app: FirebaseApp;
let db: Firestore;
let authInstance: Auth; // Renamed from 'auth' to avoid conflict with getAuth import
let functionsInstance: Functions;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

db = getFirestore(app);
authInstance = getAuth(app); // Use renamed variable
functionsInstance = getFunctions(app);
// Optionally, specify a region for functions if not us-central1, e.g.:
// functionsInstance = getFunctions(app, 'europe-west1');

export { app, db, authInstance as auth, functionsInstance as functions };
