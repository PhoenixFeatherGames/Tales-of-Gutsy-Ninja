"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  orderBy,
  query,
} from "firebase/firestore";

export default function PostDetailPage() {
  const params = useParams();
  const postId = params.id as string;

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);

  // Fetch post + listen to comments
  useEffect(() => {
    if (!postId) return;

    async function fetchPost() {
      const snap = await getDoc(doc(db, "posts", postId));
      if (snap.exists()) {
        setPost({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    }

    fetchPost();

    // 🔥 SUBCOLLECTION — NO INDEX REQUIRED
    const commentsRef = collection(db, "posts", postId, "comments");
    const q = query(commentsRef, orderBy("createdAt", "asc"));

    const unsub = onSnapshot(q, (snapshot) => {
      setComments(
        snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
    });

    return () => unsub();
  }, [postId]);

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim() || !auth.currentUser) return;

    setCommentLoading(true);

    const userSnap = await getDoc(
      doc(db, "users", auth.currentUser.uid)
    );

    const authorUsername = userSnap.exists()
      ? userSnap.data().username
      : null;

    const commentData = {
      body: comment,
      authorUid: auth.currentUser.uid,
      authorUsername,
      createdAt: serverTimestamp(),
    };
    console.log("Comment data to Firestore:", commentData);
    await addDoc(
      collection(db, "posts", postId, "comments"),
      commentData
    );

    setComment("");
    setCommentLoading(false);
  }

  if (loading) return <main className="p-8">Loading...</main>;
  if (!post) return <main className="p-8">Post not found.</main>;

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">{post.title}</h1>

      <div className="text-sm text-zinc-500 mb-4">
        By{" "}
        <a
          href={`/user/${encodeURIComponent(post.authorUsername || "")}`}
          className="underline"
        >
          {post.authorUsername || "Unknown"}
        </a>
      </div>

      {post.thumbnailUrl && (
        <img
          src={post.thumbnailUrl}
          className="w-full max-h-64 object-cover rounded mb-4"
        />
      )}

      <div className="mb-6">{post.body}</div>

      <hr className="my-6" />

      {/* COMMENTS */}
      <section>
        <h2 className="font-semibold mb-3">Comments</h2>

        {auth.currentUser && (
          <form onSubmit={handleComment} className="flex gap-2 mb-4">
            <input
              className="border p-2 flex-1"
              placeholder="Write a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={commentLoading}
              maxLength={300}
            />
            <button
              type="submit"
              disabled={commentLoading}
              className="bg-orange-600 text-white px-4 py-2 rounded"
            >
              {commentLoading ? "Posting..." : "Comment"}
            </button>
          </form>
        )}

        <ul className="space-y-3">
          {comments.length === 0 && (
            <li className="text-zinc-400">No comments yet.</li>
          )}

          {comments.map((c) => (
            <li key={c.id} className="border-b pb-2">
              <div>{c.body}</div>
              <div className="text-xs text-zinc-500">
                By{" "}
                <a
                  href={`/user/${encodeURIComponent(c.authorUsername || "")}`}
                  className="underline"
                >
                  {c.authorUsername || "Unknown"}
                </a>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
