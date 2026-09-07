import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  FirebaseUser,
  db,
  doc,
  setDoc,
  deleteDoc,
  getDocFromServer,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp
} from '../lib/firebase';

export interface CustomUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isPasscodeSession?: boolean;
}

interface AuthContextType {
  user: CustomUser | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  getUserPasscode: () => Promise<string | null>;
  generateDevicePasscode: () => Promise<string>;
  loginWithPasscode: (code: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const PAIRED_USER_KEY = 'midnightplay_paired_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [pairedUser, setPairedUser] = useState<CustomUser | null>(() => {
    try {
      const saved = localStorage.getItem(PAIRED_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setFirebaseUser(currentUser);
      if (currentUser) {
        setPairedUser(null);
        localStorage.removeItem(PAIRED_USER_KEY);

        // Sync/ensure User Document in Firestore
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          await setDoc(userRef, {
            email: currentUser.email || '',
            displayName: currentUser.displayName || 'User',
            photoURL: currentUser.photoURL || '',
            createdAt: serverTimestamp()
          }, { merge: true });
        } catch (err) {
          console.error('Error syncing user profile to Firestore:', err);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Effective current user (either Firebase Auth or Paired Device Session)
  const user: CustomUser | null = firebaseUser ? {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL
  } : pairedUser;

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setIsAuthModalOpen(false);
    } catch (error: any) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      setIsAuthModalOpen(false);
    } catch (error: any) {
      console.error('Email sign in error:', error);
      throw error;
    }
  };

  const signupWithEmail = async (email: string, pass: string, name: string) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      if (res.user) {
        await updateProfile(res.user, { displayName: name });
      }
      setIsAuthModalOpen(false);
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  // Get existing permanent Passcode for logged in user
  const getUserPasscode = async (): Promise<string | null> => {
    if (!user) return null;
    try {
      const passcodesRef = collection(db, 'devicePasscodes');
      const q = query(passcodesRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data().passcode || null;
      }
    } catch (err) {
      console.error('Error fetching user passcode:', err);
    }
    return null;
  };

  // Generate a permanent 4-digit Passcode for pairing on TV or secondary devices
  const generateDevicePasscode = async (): Promise<string> => {
    if (!user) throw new Error('Must be logged in to generate a passcode.');
    
    // Clean up any previous passcodes for this user to avoid database clutter
    try {
      const passcodesRef = collection(db, 'devicePasscodes');
      const q = query(passcodesRef, where('userId', '==', user.uid));
      const existingDocs = await getDocs(q);
      for (const d of existingDocs.docs) {
        await deleteDoc(d.ref);
      }
    } catch (err) {
      console.error('Error cleaning up previous passcodes:', err);
    }

    // Generate random 4-digit number
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    const passcodeRef = doc(db, 'devicePasscodes', code);
    await setDoc(passcodeRef, {
      passcode: code,
      userId: user.uid,
      userEmail: user.email || '',
      displayName: user.displayName || 'User',
      photoURL: user.photoURL || '',
      isPermanent: true,
      createdAt: new Date().toISOString()
    });

    return code;
  };

  // Log in using a 4-digit Passcode
  const loginWithPasscode = async (code: string): Promise<boolean> => {
    const trimmedCode = code.trim();
    if (trimmedCode.length !== 4) {
      throw new Error('Passcode must be a 4-digit number.');
    }

    const passcodeRef = doc(db, 'devicePasscodes', trimmedCode);
    const snap = await getDocFromServer(passcodeRef);

    if (!snap.exists()) {
      throw new Error('Invalid passcode. Please check and try again.');
    }

    const data = snap.data();
    if (!data) {
      throw new Error('Invalid passcode session data.');
    }

    // Set paired user session
    const paired: CustomUser = {
      uid: data.userId,
      email: data.userEmail,
      displayName: data.displayName,
      photoURL: data.photoURL,
      isPasscodeSession: true
    };

    setPairedUser(paired);
    localStorage.setItem(PAIRED_USER_KEY, JSON.stringify(paired));
    
    // Note: Passcode is permanent and remains valid until user regenerates it
    setIsAuthModalOpen(false);
    return true;
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
    setPairedUser(null);
    localStorage.removeItem(PAIRED_USER_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthModalOpen,
        setIsAuthModalOpen,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        getUserPasscode,
        generateDevicePasscode,
        loginWithPasscode,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
