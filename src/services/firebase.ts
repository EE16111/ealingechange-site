// Firebase configuration for Ealing Exchange
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyAlxitHqa4qDj5Ogvh4ibsVi2cfwMedY7g",
    authDomain: "ealing-exchange-484820.firebaseapp.com",
    projectId: "ealing-exchange-484820",
    storageBucket: "ealing-exchange-484820.firebasestorage.app",
    messagingSenderId: "286893104325",
    appId: "1:286893104325:web:83d897db4318c68c50a4ac"
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
