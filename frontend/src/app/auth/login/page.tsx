"use client"

import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  async function handleLogin() {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push("/dashboard")
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <main className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl mb-4">Shinobi Login</h1>

      <input
        className="border p-2 w-full mb-2"
        placeholder="Email"
        onChange={e => setEmail(e.target.value)}
      />

      <input
        type="password"
        className="border p-2 w-full mb-4"
        placeholder="Password"
        onChange={e => setPassword(e.target.value)}
      />

      <button
        onClick={handleLogin}
        className="bg-black text-white px-4 py-2 w-full"
      >
        Enter Village
      </button>
    </main>
  )
}
