import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { ServiceAccount } from 'firebase-admin/app';

function loadServiceAccount(): ServiceAccount {
  const inline = process.env.FIREBASE_SERVICE_ACCOUNT || (import.meta as any).env?.FIREBASE_SERVICE_ACCOUNT;
  if (inline) return JSON.parse(inline);

  const filePath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
    || (import.meta as any).env?.FIREBASE_SERVICE_ACCOUNT_PATH
    || resolve(process.cwd(), '.firebase-service-account.json');

  const raw = readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

const app = getApps().length === 0
  ? initializeApp({ credential: cert(loadServiceAccount()) })
  : getApps()[0];

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
