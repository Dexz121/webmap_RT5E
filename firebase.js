import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  getAuth,
  initializeAuth,
  GoogleAuthProvider,
  signInWithPopup,
  getReactNativePersistence,
} from "firebase/auth";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  getBytes,
} from "firebase/storage";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyBZwp0LClcaWb7guHWuS2whP7D8p-yzDs0",
  authDomain: "estrellas-fd5fd.firebaseapp.com",
  projectId: "estrellas-fd5fd",
  storageBucket: "estrellas-fd5fd.firebasestorage.app",
  messagingSenderId: "311708590865",
  appId: "1:311708590865:web:7ef087892e89cb1fada2b0",
  measurementId: "G-GZFDGMTQP1",
};

// Inicializar app
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    const userDoc = await getUserInfo(user.uid);
    if (!userDoc) {
      await registerNewUser({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: 1, // Rol por defecto
      });
    }

    return { user };
  } catch (error) {
    console.error("Error al iniciar sesión con Google:", error);
    throw error;
  }
}

export async function logout() {
  await auth.signOut();
}

export async function registerNewUser(user) {
  try {
    const usersRef = collection(db, "users");
    await setDoc(doc(usersRef, user.uid), {
      ...user,
      role: 1, // Rol por defecto
    });
    console.log("Usuario registrado en Firestore:", user);
  } catch (e) {
    console.error("Error registrando usuario:", e);
    throw e;
  }
}

export async function getUserInfo(uid) {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  return docSnap.data();
}

export async function userExists(uid) {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists();
}

export async function updateUser(user) {
  try {
    const usersRef = collection(db, "users");
    await setDoc(doc(usersRef, user.uid), user);
  } catch (e) {
    console.error("Error actualizando usuario:", e);
  }
}

export async function existsUsername(username) {
  const users = [];
  const q = query(collection(db, "users"), where("username", "==", username));
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((doc) => {
    console.log(doc.id, " => ", doc.data());
    users.push(doc.data());
  });

  return users.length > 0 ? users[0].uid : null;
}
