import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// Read Firebase config from environment variable
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert(serviceAccount),
});

// Get Auth instance
const auth = getAuth(app);

export default auth;