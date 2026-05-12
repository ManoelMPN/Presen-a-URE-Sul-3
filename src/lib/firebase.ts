import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result;
  } catch (error: any) {
    console.error("Erro ao fazer login:", error.code, error.message);
    if (error.code === 'auth/unauthorized-domain') {
      alert("Erro: Domínio não autorizado. Adicione este domínio no Console do Firebase (Authentication > Settings > Authorized Domains).");
    } else if (error.code === 'auth/popup-blocked') {
      alert("Erro: O popup de login foi bloqueado pelo navegador. Por favor, permita popups para este site.");
    } else {
      alert("Erro ao fazer login: " + error.message);
    }
    throw error;
  }
};

// Connection test
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('offline')) {
      console.error("Please check your Firebase configuration or internet connection.");
    }
  }
}
testConnection();
