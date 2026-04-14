import { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth } from '../firebase/auth';
import { db }   from '../firebase/firestore';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      console.log('Auth state changed:', { fbUser: !!fbUser, uid: fbUser?.uid });
      if (fbUser) {
        setUser(fbUser);
        const snap = await getDoc(doc(db, 'users', fbUser.uid));
        if (snap.exists()) {
          const profileData = snap.data();
          console.log('Profile loaded:', profileData);
          setProfile(profileData);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const register = async ({ name, email, phone, aadhaar_last4, password }) => {
    try {
      console.log('Starting registration for:', email);
      const { user: fbUser } =
        await createUserWithEmailAndPassword(auth, email, password);
      console.log('Firebase auth successful, user UID:', fbUser.uid);
      
      await setDoc(doc(db, 'users', fbUser.uid), {
        name, email, phone, aadhaar_last4,
        role: 'citizen',
        created_at: new Date().toISOString()
      });
      console.log('User document created successfully');
    } catch (error) {
      console.error('AuthContext registration error:', error);
      throw error;
    }
  };

  const login    = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);
  const logout   = () => signOut(auth);
  const getToken = async () => user ? await user.getIdToken() : null;

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      register, login, logout, getToken
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
