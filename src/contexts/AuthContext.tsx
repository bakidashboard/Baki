import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getRandomAvatar } from '../data/avatars';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { auth, database, firestore } from '../firebase/config';
import { ref, set, get, serverTimestamp, onDisconnect, onValue } from 'firebase/database';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  error: Error | null;
  isAdmin: boolean;
  isModerator: boolean;
  isTeacher: boolean;
  isPremium: boolean;
  isSuspended: boolean;
  isMaintenanceMode: boolean;
  tokenClaims: Record<string, any>;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, name: string, gender?: 'male' | 'female' | 'other') => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshClaims: () => Promise<void>;
  updateUserAvatar: (photoURL: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [claims, setClaims] = useState<Record<string, any>>({});
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

  const fetchClaims = async (currentUser: User) => {
    try {
      const idTokenResult = await currentUser.getIdTokenResult(true); // force refresh
      let claimsObj = idTokenResult.claims;

      // Check Realtime Database for role override (so you can easily make yourself admin in Firebase Console)
      try {
        const userRef = ref(database, `users/${currentUser.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
           const data = snapshot.val();
           if (data.role === 'admin' || data.isAdmin === true) {
              claimsObj = { ...claimsObj, admin: true };
           }
           if (data.role === 'moderator' || data.isModerator === true) {
              claimsObj = { ...claimsObj, moderator: true };
           }
           if (data.role === 'premium' || data.isPremium === true) {
              claimsObj = { ...claimsObj, premium: true };
           }
           if (data.suspended === true || data.status === 'suspended') {
              claimsObj = { ...claimsObj, suspended: true };
           }
        }
      } catch (dbErr) {
        console.error('Error fetching RTDB role', dbErr);
      }

      // Check Firestore as requested
      try {
        const userDocRef = doc(firestore, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          if (userData) {
            if (userData.isAdmin === true || userData.role === 'admin') {
              claimsObj = { ...claimsObj, admin: true };
              console.log("مرحباً أيها المدير، تم إظهار لوحة التحكم.");
            }
            if (userData.isModerator === true || userData.role === 'moderator') {
              claimsObj = { ...claimsObj, moderator: true };
            }
            if (userData.isSuspended === true || userData.suspended === true) {
              claimsObj = { ...claimsObj, suspended: true };
            }
          }
        }
      } catch (fsErr) {
        console.error('Error fetching Firestore role', fsErr);
      }

      setClaims(claimsObj);
    } catch (err) {
      console.error('Error fetching claims', err);
      setClaims({});
    }
  };

  const refreshClaims = async () => {
    if (user) {
      await fetchClaims(user);
    }
  };

  useEffect(() => {
    // Listen to Maintenance Mode state in Realtime DB
    const maintenanceRef = ref(database, 'settings/global/maintenanceMode');
    const unsubMaintenance = onValue(maintenanceRef, (snapshot) => {
      setIsMaintenanceMode(!!snapshot.val());
    });

    let unsubProfile: (() => void) | undefined;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        await fetchClaims(currentUser);

        // REAL-TIME PROFILE LISTENER
        const userRef = ref(database, `users/${currentUser.uid}`);
        unsubProfile = onValue(userRef, (snapshot) => {
          if (snapshot.exists()) {
            setProfile(snapshot.val());
          } else {
            setProfile(null);
          }
        });

        // Setup Realtime Database Presence
        const userStatusRef = ref(database, `/presence/${currentUser.uid}`);
        
        // When disconnected, set to offline
        onDisconnect(userStatusRef).set({
          status: 'offline',
          last_seen: serverTimestamp()
        });

        // Set to online
        set(userStatusRef, {
          status: 'online',
          last_seen: serverTimestamp()
        });
      } else {
         setClaims({});
         setProfile(null);
         if (unsubProfile) unsubProfile();
      }
      setLoading(false);
    }, (err) => {
      setError(err);
      setLoading(false);
    });

    return () => {
      unsubMaintenance();
      unsubscribe();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  const login = async (email: string, pass: string) => {
    setError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const currentUser = cred.user;

      // جلب مستند المستخدم من مجموعة users في Firestore باستخدام الـ uid
      let isAdminUser = false;
      try {
        const userDocRef = doc(firestore, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          if (userData && (userData.isAdmin === true || userData.role === 'admin')) {
            isAdminUser = true;
            console.log("مرحباً أيها المدير، تم إظهار لوحة التحكم.");
          } else {
            console.log("المستخدم ليس مديراً، تم إخفاء لوحة التحكم.");
          }
        } else {
          console.log("مستند المستخدم غير موجود في Firestore، تم إخفاء لوحة التحكم.");
        }
      } catch (fsErr) {
        console.error("حدث خطأ أثناء فحص صلاحيات الأدمن من Firestore:", fsErr);
      }

      // Refresh additional claims (such as RTDB checks)
      await fetchClaims(currentUser);

      // Force immediate claims/isAdmin updates to ensure the UI updates instantly
      setClaims(prev => {
        const updated = { ...prev };
        if (isAdminUser) {
          updated.admin = true;
        } else {
          delete updated.admin;
        }
        return updated;
      });

    } catch (err: any) {
      setError(err);
      throw err;
    }
  };

  const signup = async (email: string, pass: string, name: string, gender?: 'male' | 'female' | 'other') => {
    setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const initialPhotoURL = getRandomAvatar(name, gender);
      await updateProfile(cred.user, { displayName: name, photoURL: initialPhotoURL });
      
      // Initialize user node in Realtime DB
      await set(ref(database, `users/${cred.user.uid}`), {
        email: cred.user.email,
        displayName: name,
        photoURL: initialPhotoURL,
        gender: gender || 'other',
        createdAt: serverTimestamp(),
        role: 'student'
      });
      // Force refresh user
      setUser({ ...cred.user, photoURL: initialPhotoURL } as User);
    } catch (err: any) {
      setError(err);
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Initialize or update user node in Realtime DB
      await set(ref(database, `users/${result.user.uid}`), {
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        lastLogin: serverTimestamp(),
      });
      
    } catch (err: any) {
      setError(err);
      throw err;
    }
  };

  const updateUserAvatar = async (photoURL: string) => {
    if (!user) return;
    try {
      // 1. Update Auth Profile
      await updateProfile(user, { photoURL });
      
      // 2. Update Realtime DB
      await set(ref(database, `users/${user.uid}/photoURL`), photoURL);
      
      // 3. Update Firestore (optional but recommended)
      try {
        await setDoc(doc(firestore, 'users', user.uid), { photoURL }, { merge: true });
      } catch (e) { console.warn("Firestore photo sync warning", e); }
      
      toast.success('Avatar updated everywhere! ✨');
    } catch (err: any) {
      toast.error('Failed to sync avatar: ' + err.message);
    }
  };

  const logout = async () => {
    if (user) {
      const userStatusRef = ref(database, `/presence/${user.uid}`);
      await set(userStatusRef, {
        status: 'offline',
        last_seen: serverTimestamp()
      });
    }
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile,
      loading, 
      error, 
      isAdmin: !!claims.admin,
      isModerator: !!claims.moderator,
      isTeacher: !!claims.teacher,
      isPremium: !!claims.premium,
      isSuspended: !!claims.suspended,
      isMaintenanceMode,
      tokenClaims: claims,
      login, 
      signup, 
      loginWithGoogle, 
      logout,
      refreshClaims,
      updateUserAvatar
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
