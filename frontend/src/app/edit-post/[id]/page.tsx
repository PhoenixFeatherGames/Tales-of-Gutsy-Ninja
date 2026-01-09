"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function EditPostPage({ params }: { params: { id: string } }) {
  const id = params.id; // guaranteed string
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      const postDoc = await getDoc(doc(db, "posts", id));
      if (postDoc.exists()) {
        const data = postDoc.data();
        setTitle(data.title || "");
        setBody(data.body || "");
        setTags(data.tags || []);
      }
      setLoading(false);
    }

    fetchPost();
  }, [id]);

  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updateDoc(doc(db, "posts", id), {
        title,
        body,
        tags,
      });
      router.push("/dashboard");
    } catch (err: any) {
      alert(err.message);
    }
  }

  if (loading) return <main className="p-8">Loading...</main>;

  return (
    <main className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl mb-4">Edit Post</h1>
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
        <div>
          <div className="flex gap-2 mb-2">
            <input
              className="border p-2 flex-1"
              placeholder="Add tag"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              maxLength={20}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
            />
            <button type="button" onClick={handleAddTag} className="bg-gray-200 px-3 py-1 rounded">Add</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <span key={tag} className="bg-blue-100 px-2 py-1 rounded flex items-center">
                {tag}
                <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-1 text-red-500">×</button>
              </span>
            ))}
          </div>
        </div>
        <button
          type="submit"
          className="bg-black text-white px-4 py-2 w-full"
        >
          Save Changes
        </button>
      </form>
    </main>
  );
}
