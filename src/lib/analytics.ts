'use client';

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAnalytics, logEvent, Analytics } from 'firebase/analytics';

let app: FirebaseApp | null = null;
let analytics: Analytics | null = null;

function initFirebase() {
  if (typeof window === 'undefined') return null;

  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };

  // If any key missing, disable analytics gracefully
  if (!config.apiKey || !config.projectId || !config.appId) return null;

  if (!getApps().length) {
    app = initializeApp(config);
  }

  try {
    analytics = getAnalytics(app!);
    return analytics;
  } catch {
    return null;
  }
}

export function trackEvent(name: string, params?: Record<string, any>) {
  try {
    if (!analytics) initFirebase();
    if (!analytics) return;
    logEvent(analytics, name, params || {});
  } catch {
    // no-op
  }
}
