"use client";

import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { listenToAuth } from "@/lib/auth";

export default function CharacterCreatePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = listenToAuth((u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const [about, setAbout] = useState("");
  const [clan, setClan] = useState("");
  const [village, setVillage] = useState("");
  const [gender, setGender] = useState("");
  const [birthday, setBirthday] = useState("");
  const [height, setHeight] = useState("");
  const [personality, setPersonality] = useState("");
  const [likes, setLikes] = useState("");
  const [dislikes, setDislikes] = useState("");
  const [history, setHistory] = useState("");
  const [nindo, setNindo] = useState("");

  if (loading) return <p>Loading...</p>;
  if (!user) {
    return <p>Please log in first.</p>;
  }

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create Your Shinobi</h1>

      <section className="space-y-4">
        <input
          placeholder="Clan"
          value={clan}
          onChange={(e) => setClan(e.target.value)}
          className="w-full border p-2"
        />

        <input
          placeholder="Village"
          value={village}
          onChange={(e) => setVillage(e.target.value)}
          className="w-full border p-2"
        />

        <input
          placeholder="Gender"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="w-full border p-2"
        />

        <input
          placeholder="Birthday"
          value={birthday}
          onChange={(e) => setBirthday(e.target.value)}
          className="w-full border p-2"
        />

        <input
          placeholder="Height"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          className="w-full border p-2"
        />

        <textarea
          placeholder="Personality"
          value={personality}
          onChange={(e) => setPersonality(e.target.value)}
          className="w-full border p-2"
        />

        <textarea
          placeholder="Likes"
          value={likes}
          onChange={(e) => setLikes(e.target.value)}
          className="w-full border p-2"
        />

        <textarea
          placeholder="Dislikes"
          value={dislikes}
          onChange={(e) => setDislikes(e.target.value)}
          className="w-full border p-2"
        />

        <textarea
          placeholder="History"
          value={history}
          onChange={(e) => setHistory(e.target.value)}
          className="w-full border p-2"
        />

        <textarea
          placeholder="Nindo (Your Ninja Way)"
          value={nindo}
          onChange={(e) => setNindo(e.target.value)}
          className="w-full border p-2"
        />
      </section>
    </main>
  );
}
