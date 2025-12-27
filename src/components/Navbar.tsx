"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { auth } from "@/lib/firebase";

export default function Navbar() {
  const pathname = usePathname();

  if (!auth.currentUser) return null;

  return (
    <div className="fixed top-4 left-4 z-50">
      {pathname !== "/dashboard" && (
        <Link
          href="/dashboard"
          className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-full shadow text-sm font-semibold"
          title="Home"
        >
          🏠
        </Link>
      )}
    </div>
  );
}
