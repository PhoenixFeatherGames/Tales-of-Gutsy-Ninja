"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db, storage } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function CreatePostPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [background, setBackground] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // 🔒 HARD AUTH GUARD
    if (!auth.currentUser) {
      alert("You must be logged in to create a post.");
      return;
    }

    setLoading(true);

    try {
      // 🔹 Load user profile
      const userSnap = await getDoc(
        doc(db, "users", auth.currentUser.uid)
      );

      if (!userSnap.exists()) {
        throw new Error("User profile not found.");
      }

      const { username } = userSnap.data();

      if (!username) {
        throw new Error("Username missing on profile.");
      }

      // 🔹 Upload images
      let thumbnailUrl = "";
      let backgroundUrl = "";

      if (thumbnail) {
        const thumbRef = ref(
          storage,
          `post-thumbnails/${crypto.randomUUID()}`
        );
        await uploadBytes(thumbRef, thumbnail);
        thumbnailUrl = await getDownloadURL(thumbRef);
      }

      if (background) {
        const bgRef = ref(
          storage,
          `post-backgrounds/${crypto.randomUUID()}`
        );
        await uploadBytes(bgRef, background);
        backgroundUrl = await getDownloadURL(bgRef);
      }

      // 🔹 Create post (ALL required indexed fields present)
      await addDoc(collection(db, "posts"), {
        title: title.trim(),
        body: body.trim(),
        tags,
        thumbnailUrl,
        backgroundUrl,
        authorUid: auth.currentUser.uid,
        authorUsername: username,
        createdAt: serverTimestamp(),
      });

      // ✅ Success
      router.push(`/user/${encodeURIComponent(username)}`);
    } catch (err: any) {
      console.error("Create post error:", err);
      alert(err.message || "Failed to create post.");
    } finally {
      // ⛔ Prevent infinite spinner
      setLoading(false);
    }
  }

  return (
    <main className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl mb-4">Create New Post</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="border p-2 w-full"
          placeholder="Post Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          maxLength={100}
        />

        <textarea
          className="border p-2 w-full min-h-[120px]"
          placeholder="Write your post..."
          value={body}
          onChange={e => setBody(e.target.value)}
          required
        />

        {/* Tags */}
        <div>
          <div className="flex gap-2 mb-2">
            <input
              className="border p-2 flex-1"
              placeholder="Add tag"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              maxLength={20}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="bg-gray-200 px-3 py-1 rounded"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <span
                key={tag}
                className="bg-blue-100 px-2 py-1 rounded flex items-center"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 text-red-500"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Images */}
        <div>
          <label className="block mb-1">Thumbnail Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={e =>
              setThumbnail(e.target.files?.[0] || null)
            }
          />
        </div>

        <div>
          <label className="block mb-1">Background Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={e =>
              setBackground(e.target.files?.[0] || null)
            }
          />
        </div>

        <button
          type="submit"
          className="bg-black text-white px-4 py-2 w-full disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Posting..." : "Create Post"}
        </button>
      </form>
    </main>
  );
}
