"use client"

import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { listenToAuth } from "@/lib/auth";
import { ensurePlayerExists } from "@/lib/player";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, collection, query, where, getDocs, onSnapshot, orderBy } from "firebase/firestore";
import { useRouter } from "next/navigation";   // ✅ Added

export default function DashboardPage() {
  const router = useRouter();                  // ✅ Added

  const [posts, setPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState("");
  const [currentUsername, setCurrentUsername] = useState("");
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameMsg, setUsernameMsg] = useState("");

  useEffect(() => {
    const unsubscribe = listenToAuth(async (u) => {
      setUser(u);
      if (u) {
        try {
          await ensurePlayerExists(u.uid, u.email);
          const userDoc = await getDoc(doc(db, "users", u.uid));
          if (userDoc.exists()) {
            setCurrentUsername(userDoc.data().username || "");
          } else {
            setCurrentUsername("");
          }
        } catch (err) {
          console.error("ensurePlayerExists error:", err);
        }
      }
    });

    const postsRef = collection(db, "posts");
    const q = query(postsRef, orderBy("createdAt", "desc"));
    const unsubPosts = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setPostsLoading(false);
    });

    return () => { unsubscribe(); unsubPosts(); };
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

      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setUsernameMsg("Username is already in use.");
        setUsernameLoading(false);
        return;
      }

      await setDoc(doc(db, "users", user!.uid), {
        uid: user!.uid,
        email: user!.email,
        username: username,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      setCurrentUsername(username);
      setUsername("");
      setUsernameMsg("Username updated!");
    } catch (err: any) {
      setUsernameMsg(err.message || "Error updating username.");
    } finally {
      setUsernameLoading(false);
    }
  }

  if (!user) return <p className="p-8">Loading...</p>;

  return (
    <main className="p-4 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
      <aside className="md:col-span-1 flex flex-col gap-4">
        <section className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4">
          <h2 className="font-semibold mb-2">Locations</h2>
          <ul className="space-y-1">
            <li><button className="hover:underline text-blue-700 dark:text-blue-300">Konoha Village</button></li>
            <li><button className="hover:underline text-blue-700 dark:text-blue-300">Training Grounds</button></li>
            <li><button className="hover:underline text-blue-700 dark:text-blue-300">Forest of Death</button></li>
            <li><button className="hover:underline text-blue-700 dark:text-blue-300">Marketplace</button></li>
            <li><button className="hover:underline text-blue-700 dark:text-blue-300">More...</button></li>
          </ul>
        </section>

        <section className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4">
          <h2 className="font-semibold mb-2">Quick Links</h2>
          <ul className="space-y-1">
            <li><button className="hover:underline text-orange-700 dark:text-orange-400">Game Rules</button></li>
            <li><button className="hover:underline text-orange-700 dark:text-orange-400">Resources</button></li>
          </ul>
        </section>
      </aside>

      <section className="md:col-span-3 flex flex-col gap-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Shinobi Dashboard</h1>
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-sm">Welcome, </span>
            <a
              href={currentUsername ? `/user/${encodeURIComponent(currentUsername)}` : '#'}
              className="font-bold text-orange-700 dark:text-orange-400 text-base hover:underline"
            >
              {currentUsername || "Shinobi"}
            </a>
          </div>

          <div className="flex justify-end mb-2">
            <a href="/create-post" className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded shadow font-semibold">
              Create Post
            </a>
          </div>
        </header>

        <section className="bg-yellow-100 dark:bg-yellow-900 rounded-lg p-4 mb-2">
          <h2 className="font-semibold mb-2">Alerts & Featured Posts</h2>
          <ul className="space-y-2">
            <li className="font-medium">[Pinned] Welcome to the Naruto RPG! Check the #rules before playing.</li>
            <li>Event: Chūnin Exams begin next week! #event</li>
          </ul>
        </section>

        <section className="flex flex-col md:flex-row gap-2 items-center mb-2">
          <input
            className="border p-2 rounded w-full md:w-1/2"
            placeholder="Search posts or tags (e.g. #Fire #jutsu)"
            disabled
          />
          <button className="bg-orange-600 text-white px-4 py-2 rounded disabled:opacity-60" disabled>
            Search
          </button>
        </section>

        <section className="bg-white dark:bg-zinc-900 rounded-lg p-4 min-h-[200px]">
          <h2 className="font-semibold mb-2">Posts & Discussions</h2>

          {postsLoading ? (
            <div className="text-zinc-400">Loading posts...</div>
          ) : posts.length === 0 ? (
            <div className="text-zinc-400">No posts yet.</div>
          ) : (
            <ul className="space-y-4">
             {posts.map(post => (
  <li
    key={post.id}
    className="border-b pb-4 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded p-2"

  >

                  <div className="flex items-center gap-2 mb-1">
                    <a
  href={`/post/${post.id}`}
  className="font-bold text-orange-700 hover:underline"
>
  {post.title}
</a>
                    {post.tags && post.tags.length > 0 && (
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

                  <div className="mb-2 text-zinc-800 dark:text-zinc-200">{post.body}</div>

                  <div className="flex gap-2 items-center text-xs text-zinc-500 mb-1">
                    <span>
                      By{" "}
                     <a
  href={post.authorUsername ? `/user/${encodeURIComponent(post.authorUsername)}` : "#"}
  className="underline"
  onClick={(e) => e.stopPropagation()}
>
                        {post.authorUsername || "Unknown"}
                      </a>
                    </span>

                    {post.createdAt && (
                      <span className="ml-2">
                        {post.createdAt.seconds
                          ? new Date(post.createdAt.seconds * 1000).toLocaleString()
                          : ""}
                      </span>
                    )}
                  </div>

                  <div className="mt-2">
                    <h3 className="font-semibold text-sm mb-1">Comments</h3>
                    <div className="text-zinc-400 text-xs">(Comments coming soon...)</div>
                  </div>

                  <div className="flex gap-2">
                    {user && post.authorUid === user.uid && (
                      <>
                      <button
  className="text-blue-600 hover:underline"
  onClick={(e) => {
    e.stopPropagation();
    router.push(`/edit-post/${post.id}`);
  }}
>
  Edit
</button>


                        <button
  className="text-red-600 hover:underline"
  onClick={async (e) => {
    e.stopPropagation();

                            if (confirm("Delete this post?")) {
                              await import("firebase/firestore").then(async ({ doc, deleteDoc }) => {
                                await deleteDoc(doc(db, "posts", post.id));
                              });
                            }
                          }}
                        >
                          Delete
                        </button>
                      </>
                    )}

                    {user && post.authorUid !== user.uid && (
                      <button className="text-pink-600 hover:underline">Favorite</button>
                    )}

                    <button className="text-yellow-600 hover:underline">Report</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  );
}
