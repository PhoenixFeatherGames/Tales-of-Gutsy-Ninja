"use client"

import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { collection, query, where, getDocs, setDoc, doc } from "firebase/firestore"
import { useState } from "react"
import { useRouter } from "next/navigation"


export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleRegister() {
    setLoading(true)
    try {
      // Check if username is already taken
      const usersRef = collection(db, "users")
      const q = query(usersRef, where("username", "==", username))
      const querySnapshot = await getDocs(q)
      if (!username || username.length < 3) {
        alert("Username must be at least 3 characters.")
        setLoading(false)
        return
      }
      if (!email || !password) {
        alert("Email and password are required.")
        setLoading(false)
        return
      }
      if (!querySnapshot.empty) {
        alert("Username is already in use.")
        setLoading(false)
        return
      }
      // Create user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      // Save username to Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        username: username,
        createdAt: new Date().toISOString()
      })
      router.push("/dashboard")
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl mb-4">Create Shinobi Account</h1>

      <input
        className="border p-2 w-full mb-2"
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        minLength={3}
        maxLength={20}
      />

      <input
        className="border p-2 w-full mb-2"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <input
        type="password"
        className="border p-2 w-full mb-4"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      <button
        onClick={handleRegister}
        className="bg-black text-white px-4 py-2 w-full disabled:opacity-60"
        disabled={loading}
      >
        {loading ? "Registering..." : "Begin Ninja Path"}
      </button>
    </main>
  )
}

