import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read JSON file manually (instead of using assert)
const serviceAccountKey = JSON.parse(
  fs.readFileSync(path.join(__dirname, "serviceAccountKey.json"), "utf-8")
);

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert(serviceAccountKey),
});

// Get Auth instance
const auth = getAuth(app);

export default auth;