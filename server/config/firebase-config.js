import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

console.log("AVAILABLE ENV VARS:", Object.keys(process.env));
if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT is missing");
}

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

const app = initializeApp({
  credential: cert(serviceAccount),
});

const auth = getAuth(app);

export default auth;