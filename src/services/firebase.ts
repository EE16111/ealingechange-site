// Firebase configuration for Ealing Exchange
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';

const firebaseConfig = {
    projectId: "ealingexchange",
    appId: "1:1063994697298:web:772ded61484dcc6d4e618b",
    storageBucket: "ealingexchange.firebasestorage.app",
    apiKey: "AIzaSyBcSsbg9RmrZF1Epdxb6eRtuMuiekNAcb0",
    authDomain: "ealingexchange.firebaseapp.com",
    messagingSenderId: "1063994697298",
    measurementId: "G-87T6M1D0Z3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Auth functions
export const firebaseLogin = async (email: string, password: string): Promise<User> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
};

export const firebaseLogout = async (): Promise<void> => {
    await signOut(auth);
};

export const onAuthChange = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};

export default app;
