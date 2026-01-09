"use client";



import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { listenToAuth } from "@/lib/auth";
import { ensurePlayerExists } from "@/lib/player";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  const [posts, setPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [currentUsername, setCurrentUsername] = useState("");

  useEffect(() => {
    const unsubscribeAuth = listenToAuth(async (u) => {
      setUser(u);

      if (!u) return;

      try {
        await ensurePlayerExists(u.uid, u.email || "");
        const userSnap = await getDoc(doc(db, "users", u.uid));

        if (userSnap.exists()) {
          setCurrentUsername(userSnap.data().username || "");
        }
      } catch (err) {
        console.error("ensurePlayerExists failed:", err);
      }
    });

    const q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc")
    );

    const unsubscribePosts = onSnapshot(q, (snap) => {
      setPosts(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );
      setPostsLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribePosts();
    };
  }, []);

  if (!user) {
    return <main className="p-8">Loading...</main>;
  }

  return (
    <main className="p-4 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* SIDEBAR */}
      <aside className="md:col-span-1 flex flex-col gap-4">
        <section className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4">
          <h2 className="font-semibold mb-2">Locations</h2>
          <ul className="space-y-1">
            {["Konoha Village", "Training Grounds", "Forest of Death", "Marketplace", "More..."].map(
              (loc) => (
                <li key={loc}>
                  <button className="hover:underline text-blue-700 dark:text-blue-300">
                    {loc}
                  </button>
                </li>
              )
            )}
          </ul>
        </section>

        <section className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4">
          <h2 className="font-semibold mb-2">Quick Links</h2>
          <ul className="space-y-1">
            <li className="text-orange-700 dark:text-orange-400">Game Rules</li>
            <li className="text-orange-700 dark:text-orange-400">Resources</li>
          </ul>
        </section>
      </aside>

      {/* MAIN */}
      <section className="md:col-span-3 flex flex-col gap-6">
        {/* HEADER */}
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Shinobi Dashboard</h1>

          <div className="flex items-center gap-4">
            <span className="text-sm">
              Welcome,{" "}
              <a
                href={`/user/${encodeURIComponent(currentUsername)}`}
                className="font-bold text-orange-600 hover:underline"
              >
                {currentUsername || "Shinobi"}
              </a>
            </span>

            <button
              onClick={() => router.push("/create-post")}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded shadow"
            >
              Create Post
            </button>
          </div>
        </header>

        {/* POSTS */}
        <section className="bg-white dark:bg-zinc-900 rounded-lg p-4">
          <h2 className="font-semibold mb-3">Posts & Discussions</h2>

          {postsLoading ? (
            <div className="text-zinc-400">Loading posts...</div>
          ) : posts.length === 0 ? (
            <div className="text-zinc-400">No posts yet.</div>
          ) : (
            <ul className="space-y-6">
              {posts.map((post) => (
                <li key={post.id} className="border-b pb-4">
                  {/* TITLE */}
                  <a
                    href={`/post/${post.id}`}
                    className="block text-lg font-bold text-orange-700 hover:underline"
                  >
                    {post.title}
                  </a>

                  {/* THUMBNAIL */}
                  {post.thumbnailUrl && (
                    <img
                      src={post.thumbnailUrl}
                      alt="thumbnail"
                      className="w-24 h-24 object-cover rounded my-2"
                    />
                  )}

                  {/* BODY */}
                  <p className="text-sm mb-2 text-zinc-700 dark:text-zinc-200">
                    {post.body}
                  </p>

                  {/* META */}
                  <div className="text-xs text-zinc-500">
                    By{" "}
                    <a
                      href={`/user/${encodeURIComponent(
                        post.authorUsername || "unknown"
                      )}`}
                      className="underline"
                    >
                      {post.authorUsername || "Unknown"}
                    </a>
                    {post.createdAt?.seconds && (
                      <span className="ml-2">
                        {new Date(
                          post.createdAt.seconds * 1000
                        ).toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* ACTIONS */}
                  <div className="mt-2 flex gap-3 text-sm">
                    {user.uid === post.authorUid && (
                      <>
                        <button
                          className="text-blue-600 hover:underline"
                          onClick={() =>
                            router.push(`/edit-post/${post.id}`)
                          }
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-600 hover:underline"
                          onClick={async () => {
                            if (confirm("Delete this post?")) {
                              const { deleteDoc } = await import(
                                "firebase/firestore"
                              );
                              await deleteDoc(doc(db, "posts", post.id));
                            }
                          }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                    <span className="text-zinc-400">(Click title to view & comment)</span>
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
