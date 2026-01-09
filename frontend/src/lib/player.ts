import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "./firebase"

export async function ensurePlayerExists(uid: string, email: string | null) {
  const ref = doc(db, "players", uid)
  const snap = await getDoc(ref)

  if (!snap.exists()) {
    await setDoc(ref, {
      email,
      createdAt: serverTimestamp(),
      village: null,
      clan: null,
      rank: "Genin",
      shinobiTitle: "Genin",
      stats: {
        intelligence: 0,
        strength: 0,
        speed: 0,
        stamina: 0,
        will: 0,
      },
      chakra: {
        current: 0,
        max: 0,
      },
      jutsuBank: [],
      missionsCompleted: {
        D: 0,
        C: 0,
        B: 0,
        A: 0,
        S: 0,
      },
    })
  }
}
