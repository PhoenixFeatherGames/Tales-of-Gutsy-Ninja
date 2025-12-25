"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import {
  onAuthStateChanged,
  updatePassword,
  type User
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";

export default function ProfilePage() {
  // FIXED: user must be typed as User | null
  const [user, setUser] = useState<User | null>(null);

  const [username, setUsername] = useState("");
  const [currentUsername, setCurrentUsername] = useState("");
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameMsg, setUsernameMsg] = useState("");

  const [password, setPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);

      if (u) {
        const userDoc = await getDoc(doc(db, "users", u.uid));
        if (userDoc.exists()) {
          setCurrentUsername(userDoc.data().username || "");
        }
      }
    });

    return () => unsubscribe();
  }, []);

  async function handleUsernameChange(e: React.FormEvent) {
    e.preventDefault();
    setUsernameMsg("");
    setUsernameLoading(true);

    try {
      if (!username || username.length < 3) {
        setUsernameMsg("Username must be at least 3 characters.");
        setUsernameLoading(false);
        return;
      }

      // Check uniqueness
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setUsernameMsg("Username is already in use.");
        setUsernameLoading(false);
        return;
      }

      if (!user) {
        setUsernameMsg("You must be logged in.");
        setUsernameLoading(false);
        return;
      }

      // Update username
      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          email: user.email,
          username: username,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      setCurrentUsername(username);
      setUsername("");
      setUsernameMsg("Username updated!");
    } catch (err: any) {
      setUsernameMsg(err.message || "Error updating username.");
    } finally {
      setUsernameLoading(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMsg("");

    if (!password || password.length < 6) {
      setPasswordMsg("Password must be at least 6 characters.");
      return;
    }

    try {
      if (!auth.currentUser) {
        setPasswordMsg("You must be logged in.");
        return;
      }

      await updatePassword(auth.currentUser, password);
      setPassword("");
      setPasswordMsg("Password updated!");
    } catch (err: any) {
      setPasswordMsg(err.message || "Error updating password.");
    }
  }

  if (!user) return <p className="p-8">Loading...</p>;

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl mb-4">Profile</h1>

      {/* Username Section */}
      <div className="mb-6 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
        <h2 className="font-semibold mb-2">Username</h2>
        <p className="mb-2">
          Current:{" "}
          <span className="font-mono text-orange-700 dark:text-orange-400">
            {currentUsername || <em>none set</em>}
          </span>
        </p>

        <form onSubmit={handleUsernameChange} className="flex flex-col gap-2 max-w-xs">
          <input
            className="border p-2 w-full"
            placeholder="Set or change username"
            value={username}
            minLength={3}
            maxLength={20}
            onChange={(e) => setUsername(e.target.value)}
            disabled={usernameLoading}
          />

          <button
            type="submit"
            className="bg-black text-white px-4 py-2 rounded disabled:opacity-60"
            disabled={usernameLoading}
          >
            {usernameLoading ? "Saving..." : "Save Username"}
          </button>

          {usernameMsg && (
            <p className="text-sm mt-1 text-orange-700 dark:text-orange-400">
              {usernameMsg}
            </p>
          )}
        </form>
      </div>

      {/* Password Section */}
      <div className="mb-6 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
        <h2 className="font-semibold mb-2">Change Password</h2>

        <form onSubmit={handlePasswordChange} className="flex flex-col gap-2 max-w-xs">
          <input
            type="password"
            className="border p-2 w-full"
            placeholder="New password"
            value={password}
            minLength={6}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="bg-black text-white px-4 py-2 rounded disabled:opacity-60"
          >
            Change Password
          </button>

          {passwordMsg && (
            <p className="text-sm mt-1 text-orange-700 dark:text-orange-400">
              {passwordMsg}
            </p>
          )}
        </form>
      </div>

      {/* Content Section */}
      <div className="mb-6 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex justify-between items-center">
        <span className="font-semibold">Your Content</span>
        <a
          href="/create-post"
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded shadow font-semibold"
        >
          Create Post
        </a>
      </div>

      <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
        <h2 className="font-semibold mb-2">Posts & Folders</h2>
        <p className="text-zinc-500">(Posts, folders, and characters will appear here.)</p>
      </div>
    </main>
  );
}
