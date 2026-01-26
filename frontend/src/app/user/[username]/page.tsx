"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy,
  doc,
  deleteDoc,
} from "firebase/firestore";
// Character slot and clan/cross-clan limits
const MAX_CHARACTERS = 12;
const MAX_PER_CLAN = 2;
const MAX_CROSS_CLAN = 3;
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
// Character slot and clan/cross-clan limits
const MAX_CHARACTERS = 12;
const MAX_PER_CLAN = 2;
const MAX_CROSS_CLAN = 3;
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy,
  doc,
  deleteDoc,
} from "firebase/firestore";

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const username = params.username as string;

  const [characters, setCharacters] = useState<any[]>([]);

  // Fetch characters for this user
  async function fetchCharacters(uid: string) {
    const charsRef = collection(db, "characters");
    const charsQ = query(charsRef, where("ownerUid", "==", uid));
    const charsSnap = await getDocs(charsQ);
    setCharacters(charsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }

export default function UserProfilePage() {
  const router = useRouter(); // ✅ THIS WAS MISSING
  const params = useParams();
  const username = params.username as string;

  const [posts, setPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  useEffect(() => {
    if (!username) return;

    let unsubPosts: (() => void) | null = null;

    async function fetchUser() {
      setLoading(true);

      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setUserData(null);
        setLoading(false);
        return;
      }

      const user = querySnapshot.docs[0].data();
      setUserData(user);

      onAuthStateChanged(auth, (u) => {
        setIsCurrentUser(!!(u && user.uid === u.uid));
        if (u && user.uid === u.uid) {
          fetchCharacters(user.uid);
        }
      });

      const postsRef = collection(db, "posts");
      const postsQ = query(
        postsRef,
        where("authorUsername", "==", username),
        orderBy("createdAt", "desc")
      );

      unsubPosts = onSnapshot(postsQ, (snapshot) => {
        setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setPostsLoading(false);
      });

      setLoading(false);
    }

    fetchUser();

    return () => {
      if (unsubPosts) unsubPosts();
    };
  }, [username]);

  if (loading) return <main className="p-8">Loading...</main>;
  if (!userData) return <main className="p-8">User not found.</main>;

  // Count per-clan and cross-clan
  const clanCounts: Record<string, number> = {};
  let crossClanCount = 0;
  characters.forEach((char) => {
    if (Array.isArray(char.clan)) {
      crossClanCount++;
      char.clan.forEach((c: string) => {
        clanCounts[c] = (clanCounts[c] || 0) + 1;
      });
    } else if (char.clan) {
      clanCounts[char.clan] = (clanCounts[char.clan] || 0) + 1;
    }
  });
  const remainingSlots = MAX_CHARACTERS - characters.length;

  return (
    <main className="p-8 max-w-2xl mx-auto">
      {/* Character List and Slot Info */}
      <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900 rounded-lg">
        <h2 className="font-bold text-lg mb-2 text-orange-700">Characters</h2>
        <div className="mb-2">You have <b>{characters.length}</b> / {MAX_CHARACTERS} characters. Remaining slots: <b>{remainingSlots}</b></div>
        <div className="mb-2">No more than <b>{MAX_PER_CLAN}</b> per clan, and <b>{MAX_CROSS_CLAN}</b> cross-clan characters allowed.</div>
        <ul className="space-y-2">
          {characters.map((char) => (
            <li key={char.id} className="border-b pb-2">
              <span className="font-semibold">{char.name}</span> — Clan: {Array.isArray(char.clan) ? char.clan.join(" / ") : char.clan || "Unknown"}
              {Array.isArray(char.clan) && <span className="ml-2 text-xs text-pink-600">(Cross-clan)</span>}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex items-center gap-4 mb-4">
        <h1 className="text-2xl font-bold text-orange-700 dark:text-orange-400">
          {userData.username}
        </h1>

        {isCurrentUser && (
          <a
            href="/profile"
            className="ml-2 underline text-blue-700 dark:text-blue-300 text-xs"
          >
            Profile Settings
          </a>
        )}
      </div>

      <div className="mb-6 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex justify-between items-center">
        <span className="font-semibold">User Content</span>
        <a
          href="/create-post"
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded shadow font-semibold"
        >
          Create Post
        </a>
      </div>

      <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
        <h2 className="font-semibold mb-2">Posts</h2>

        {postsLoading ? (
          <div className="text-zinc-400">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="text-zinc-400">No posts yet.</div>
        ) : (
          <ul className="space-y-4">
            {posts.map(post => (
              <li key={post.id} className="border-b pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-orange-700">{post.title}</span>
                  {post.tags?.length > 0 && (
                    <span className="ml-2 text-xs text-blue-600">
                      {post.tags.map((t: string) => `#${t}`).join(" ")}
                    </span>
                  )}
                </div>

                {post.thumbnailUrl && (
                  <img
                    src={post.thumbnailUrl}
                    alt="thumbnail"
                    className="w-24 h-24 object-cover rounded mb-2"
                  />
                )}

                <div className="mb-2 text-zinc-800 dark:text-zinc-200">
                  {post.body}
                </div>

                <div className="text-xs text-zinc-500 mb-2">
                  {post.createdAt?.seconds &&
                    new Date(post.createdAt.seconds * 1000).toLocaleString()}
                </div>

                <div className="flex gap-3 text-sm">
                  {isCurrentUser ? (
                    <>
                      <button
                        className="text-blue-600 hover:underline"
                        onClick={() => router.push(`/edit-post/${post.id}`)}
                      >
                        Edit
                      </button>

                      <button
                        className="text-red-600 hover:underline"
                        onClick={async () => {
                          if (confirm("Delete this post?")) {
                            await deleteDoc(doc(db, "posts", post.id));
                          }
                        }}
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <button className="text-pink-600 hover:underline">
                      Favorite
                    </button>
                  )}

                  <button className="text-yellow-600 hover:underline">
                    Report
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
