import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  updateDoc, 
  addDoc, 
  serverTimestamp,
  orderBy,
  limit,
  setDoc,
  getDocs
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { Coordinator, AttendanceLog } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const subscribeCoordinators = (callback: (data: Coordinator[]) => void) => {
  const q = query(collection(db, 'coordinators'));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Coordinator));
    callback(data);
  }, (error) => handleFirestoreError(error, OperationType.LIST, 'coordinators'));
};

export const registerPresence = async (coordinatorId: string, name: string) => {
  const now = new Date().toISOString();
  try {
    // 1. Update coordinator status
    await updateDoc(doc(db, 'coordinators', coordinatorId), {
      presenceStatus: 'present',
      presenceDate: now,
      updatedAt: now
    });

    // 2. Add log entry
    await addDoc(collection(db, 'logs'), {
      coordinatorId,
      coordinatorName: name,
      scannedAt: serverTimestamp(),
      deviceInfo: navigator.userAgent
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `coordinators/${coordinatorId}`);
  }
};

export const resetPresence = async (coordinatorId: string) => {
  try {
    await updateDoc(doc(db, 'coordinators', coordinatorId), {
      presenceStatus: 'absent',
      presenceDate: null,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `coordinators/${coordinatorId}`);
  }
};

export const seedCoordinators = async (coordinators: Omit<Coordinator, 'id' | 'presenceStatus' | 'updatedAt'>[]) => {
  try {
    for (const coord of coordinators) {
      const id = coord.code; // Use code as ID for easy URL creation
      await setDoc(doc(db, 'coordinators', id), {
        ...coord,
        presenceStatus: 'absent',
        updatedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'coordinators');
  }
};
