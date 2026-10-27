import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInAnonymously } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  onSnapshot,
  getDocFromServer,
  addDoc,
  orderBy,
  limit,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  UserProfile,
  RideRequest,
  DriverOffer,
  ChatMessage,
  WalletTransaction,
} from '../types/ride';

// Initialize Firebase safely
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

/* CRITICAL: Must use firestoreDatabaseId specified in configuration */
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

// Test connectivity on initial boot
export async function testConnection(): Promise<boolean> {
  try {
    // If not authenticated, ensure anonymous auth or session
    if (!auth.currentUser) {
      try {
        await signInAnonymously(auth);
      } catch {
        // Ignore fallback
      }
    }
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase Firestore is in offline mode or connecting...');
      return false;
    }
    // Document might not exist which is fine
    return true;
  }
}

// ----------------- Real-time Firestore Service Functions ----------------- //

/**
 * Syncs user profile in Firestore
 */
export async function syncUserToFirestore(profile: UserProfile): Promise<void> {
  const path = `users/${profile.id}`;
  try {
    const userRef = doc(db, 'users', profile.id);
    await setDoc(userRef, {
      ...profile,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}
export const saveUserToFirestore = syncUserToFirestore;

/**
 * Creates or updates a Ride in Firestore
 */
export async function saveRideToFirestore(ride: RideRequest): Promise<void> {
  const path = `rides/${ride.id}`;
  try {
    const rideRef = doc(db, 'rides', ride.id);
    await setDoc(rideRef, {
      ...ride,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Real-time listener for a specific Ride
 */
export function subscribeToRide(
  rideId: string,
  onUpdate: (ride: RideRequest | null) => void
): () => void {
  const path = `rides/${rideId}`;
  return onSnapshot(
    doc(db, 'rides', rideId),
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as RideRequest);
      } else {
        onUpdate(null);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

/**
 * Real-time listener for driver offers under a ride
 */
export function subscribeToRideOffers(
  rideId: string,
  onUpdate: (offers: DriverOffer[]) => void
): () => void {
  const path = `rides/${rideId}/offers`;
  const offersColl = collection(db, 'rides', rideId, 'offers');
  return onSnapshot(
    offersColl,
    (snapshot) => {
      const offers: DriverOffer[] = [];
      snapshot.forEach((d) => offers.push(d.data() as DriverOffer));
      onUpdate(offers);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

/**
 * Post an offer to a ride in Firestore
 */
export async function saveOfferToFirestore(offer: DriverOffer): Promise<void> {
  const path = `rides/${offer.rideId}/offers/${offer.id}`;
  try {
    const offerRef = doc(db, 'rides', offer.rideId, 'offers', offer.id);
    await setDoc(offerRef, {
      ...offer,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Real-time listener for messages under a ride
 */
export function subscribeToRideMessages(
  rideId: string,
  onUpdate: (messages: ChatMessage[]) => void
): () => void {
  const path = `rides/${rideId}/messages`;
  const messagesColl = collection(db, 'rides', rideId, 'messages');
  return onSnapshot(
    messagesColl,
    (snapshot) => {
      const msgs: ChatMessage[] = [];
      snapshot.forEach((d) => msgs.push(d.data() as ChatMessage));
      onUpdate(msgs);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

/**
 * Send chat message in Firestore
 */
export async function saveMessageToFirestore(
  rideId: string,
  message: ChatMessage
): Promise<void> {
  const path = `rides/${rideId}/messages/${message.id}`;
  try {
    const msgRef = doc(db, 'rides', rideId, 'messages', message.id);
    await setDoc(msgRef, {
      ...message,
      rideId,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Save driver KYC submission in Firestore
 */
export async function saveKycSubmission(data: any): Promise<void> {
  const path = `kyc_applications/${data.id || 'kyc_' + Date.now()}`;
  try {
    const kycRef = doc(db, 'kyc_applications', data.id || 'kyc_' + Date.now());
    await setDoc(kycRef, {
      ...data,
      submittedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Record a wallet transaction
 */
export async function saveTransactionToFirestore(
  userId: string,
  tx: WalletTransaction
): Promise<void> {
  const path = `users/${userId}/transactions/${tx.id}`;
  try {
    const txRef = doc(db, 'users', userId, 'transactions', tx.id);
    await setDoc(txRef, tx);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}
