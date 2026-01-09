"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function Navbar() {
  const pathname = usePathname();
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUsername(null);
        setLoading(false);
        return;
      }

      const userDoc = await getDoc(doc(db, "users", user.uid));
      setUsername(userDoc.exists() ? userDoc.data().username : null);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading || !username) return null;

  return (
    <div className="fixed top-4 left-4 z-50 flex items-center gap-3">
      {pathname !== "/dashboard" && (
        <Link
          href="/dashboard"
          className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-full shadow text-sm font-semibold"
          title="Home"
        >
          🏠
        </Link>
      )}

      <Link
        href={`/user/${encodeURIComponent(username)}`}
        className="text-sm font-semibold text-orange-700 dark:text-orange-400 hover:underline"
        title="View profile"
      >
        Welcome, {username}
      </Link>
    </div>
  );
}
