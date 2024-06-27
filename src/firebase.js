import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: ' GCP API key ',
  authDomain: 'weddingapp-87496.firebaseapp.com',
  projectId: 'weddingapp-87496',
  storageBucket: 'weddingapp-87496.appspot.com',
  messagingSenderId: '264345558375',
  appId: '1:264345558375:web:561d67bc0e2c48fbdba3c2',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const db = getFirestore(app);
