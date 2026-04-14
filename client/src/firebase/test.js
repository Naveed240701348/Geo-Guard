import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAjt8Bg2FVAbCodh5NQX3cVXqf_PDjw94Q",
  authDomain: "geo-guard-d9df8.firebaseapp.com",
  projectId: "geo-guard-d9df8",
  storageBucket: "geo-guard-d9df8.firebasestorage.app",
  messagingSenderId: "951871249804",
  appId: "1:951871249804:web:f11db015ada30536d04aa9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Test authentication
console.log('Firebase app initialized');
console.log('Auth object:', auth);

export { auth };
