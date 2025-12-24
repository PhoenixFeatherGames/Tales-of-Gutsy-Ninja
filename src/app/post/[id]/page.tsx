"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";

export default function PostDetailPage() {
  const params = useParams();
  const id = params?.id as string | undefined;

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const postId = id;

    async function fetchPost() {
      const postDoc = await getDoc(doc(db, "posts", postId));
      if (postDoc.exists()) {
        setPost({ id: postDoc.id, ...postDoc.data() });
      }
      setLoading(false);
    }

    fetchPost();

    const commentsRef = collection(db, "comments");
    const q = query(
      commentsRef,
      where("postId", "==", postId),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setComments(
        snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }))
      );
    });

    return () => unsub();
  }, [id]);

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    if (!comment.trim()) return;

    const postId = id;
    setCommentLoading(true);

    let authorUsername: string | null = null;

    if (auth.currentUser?.uid) {
      const userDoc = await getDoc(
        doc(db, "users", auth.currentUser.uid)
      );
      authorUsername = userDoc.exists()
        ? userDoc.data().username
        : null;
    }

    await addDoc(collection(db, "comments"), {
      postId,
      body: comment,
      authorUid: auth.currentUser?.uid || null,
      authorUsername,
      createdAt: serverTimestamp(),
    });

    setComment("");
    setCommentLoading(false);
  }

  if (loading) {
    return <main className="p-8">Loading...</main>;
  }

  if (!post) {
    return <main className="p-8">Post not found.</main>;
  }

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">{post.title}</h1>

      <div className="mb-2 text-zinc-800 dark:text-zinc-200">
        {post.body}
      </div>

      {post.thumbnailUrl && (
        <img
          src={post.thumbnailUrl}
          alt="thumbnail"
          className="w-32 h-32 object-cover rounded mb-2"
        />
      )}

      <div className="text-xs text-zinc-500 mb-4">
        By{" "}
        <a
          href={
            post.authorUsername
              ? `/user/${encodeURIComponent(post.authorUsername)}`
              : "#"
          }
          className="underline"
        >
          {post.authorUsername || "Unknown"}
        </a>

        {post.createdAt?.seconds && (
          <span className="ml-2">
            {new Date(post.createdAt.seconds * 1000).toLocaleString()}
          </span>
        )}
      </div>

      <section className="mt-6">
        <h2 className="font-semibold mb-2">Comments</h2>

        <form onSubmit={handleComment} className="mb-4 flex gap-2">
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
            className="bg-orange-600 text-white px-4 py-2 rounded"
            disabled={commentLoading}
          >
            {commentLoading ? "Posting..." : "Comment"}
          </button>
        </form>

        <ul className="space-y-2">
          {comments.length === 0 && (
            <li className="text-zinc-400">No comments yet.</li>
          )}

          {comments.map((c) => (
            <li key={c.id} className="border-b pb-2">
              <div className="text-sm">{c.body}</div>
              <div className="text-xs text-zinc-500">
                By{" "}
                <a
                  href={
                    c.authorUsername
                      ? `/user/${encodeURIComponent(c.authorUsername)}`
                      : "#"
                  }
                  className="underline"
                >
                  {c.authorUsername || "Unknown"}
                </a>

                {c.createdAt?.seconds && (
                  <span className="ml-2">
                    {new Date(
                      c.createdAt.seconds * 1000
                    ).toLocaleString()}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
