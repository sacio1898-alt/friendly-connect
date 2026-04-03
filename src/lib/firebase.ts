import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDEW222BZz2cUG4Dt8Chdj-UKegsHcnHQ0",
  authDomain: "e-productx.firebaseapp.com",
  projectId: "e-productx",
  storageBucket: "e-productx.firebasestorage.app",
  messagingSenderId: "825113324827",
  appId: "1:825113324827:web:e4b4bd18f53ef8161ab7be"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
