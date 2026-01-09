import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyB2DtOdBtAjgdNFsELpqyf3FY2cG7jiDoI",
  authDomain: "naruto-rpg-93707.firebaseapp.com",
  projectId: "naruto-rpg-93707",
  storageBucket: "naruto-rpg-93707.firebasestorage.app",
  messagingSenderId: "818478097172",
  appId: "1:818478097172:web:e62ee2f8c14a72a8ce9801",
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)

export const storage = getStorage(app)
