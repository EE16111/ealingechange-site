// Firebase configuration for Ealing Exchange
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyBL2NVY-kDF0kIUaZoLL_ERf5YN-hthxko",
    authDomain: "sys-34584539868966162311959642.firebaseapp.com",
    projectId: "sys-34584539868966162311959642",
    storageBucket: "sys-34584539868966162311959642.firebasestorage.app",
    messagingSenderId: "59413213434",
    appId: "1:59413213434:web:de1b8169b233b510201943"
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
