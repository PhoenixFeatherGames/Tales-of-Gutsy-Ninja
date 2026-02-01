
"use client";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

export default function CharacterCreationForm() {
  // Utility to get clan modifiers (stub for now, can be expanded)
  function getClanModifiers(clan: string) {
    // Example: Kaguya gets -5 Ninjutsu, +2 Taijutsu, etc.
    // This should be replaced with a lookup from the loaded clan data
    return {};
  }

  function calculateDerivedStats(traits: Record<string, number>, clanMods: Record<string, number> = {}) {
    // Apply clanMods to traits if needed
    const t = { ...traits, ...clanMods };
    // HP = (Str + Sta) * 2
    const HP = (t.strength + t.stamina) * 2;
    // DP = Int + Sta
    const DP = t.intelligence + t.stamina;
    // EP = Int + Speed
    const EP = t.intelligence + t.speed;
    // OP = (Speed + Stamina) / 2
    const OP = Math.floor((t.speed + t.stamina) / 2);
    // Initiative = EP + OP
    const Initiative = EP + OP;
    // ROP = (Int + Sta) / 2
    const ROP = Math.floor((t.intelligence + t.stamina) / 2);
    return { HP, DP, EP, OP, Initiative, ROP };
  }

  // --- State and utility declarations restored from backup ---
  const [clansData, setClansData] = useState<any[]>([]);
  const [villagesData, setVillagesData] = useState<any[]>([]);
  useEffect(() => {
    fetch('/data/seeds/clans.json')
      .then(res => res.ok ? res.json() : [])
      .then(data => setClansData(Array.isArray(data) ? data : []));
    fetch('/data/seeds/villages.json')
      .then(res => res.ok ? res.json() : [])
      .then(data => setVillagesData(Array.isArray(data) ? data : []));
  }, []);

  function getVillagesForClan(clanName: string) {
    const clan = clansData.find((c: any) => c.name === clanName);
    if (!clan) return [];
    if (Array.isArray(clan.village)) return clan.village;
    if (typeof clan.village === 'string') return [clan.village];
    return [];
  }
  function getClansForVillage(villageName: string) {
    const village = villagesData.find((v: any) => v.name === villageName);
    if (!village) return [];
    return village.clans || [];
  }
  function getVillagesForCrossClan(clanA: string, clanB: string) {
    const villagesA = getVillagesForClan(clanA);
    const villagesB = getVillagesForClan(clanB);
    return villagesA.filter((v: string) => villagesB.includes(v));
  }
  const CROSS_CLANS = clansData.filter((c: any) => c.name.includes('/')).map((c: any) => c.name);
  const PURE_CLANS = clansData.filter((c: any) => !c.name.includes('/')).map((c: any) => c.name);
  const ELEMENTAL_AFFINITIES = [
    "Fire", "Wind", "Lightning", "Earth", "Water", "Yin", "Yang"
  ];

  const TRAIT_NAMES = ["intelligence", "strength", "speed", "stamina", "will"];
  const JUTSU_SKILL_NAMES = ["ninjutsu", "genjutsu", "taijutsu", "fuinjutsu", "iryojutsu", "bukijutsu", "kenjutsu"];
  const TRAIT_POINTS = 30;
  const JUTSU_SKILL_POINTS = 5;

  const initialState = {
    about: '',
    clan: '',
    village: '',
    gender: '',
    birthday: '',
    age: '',
    height: '',
    chakraNatures: [''],
    personality: '',
    likes: '',
    dislikes: '',
    history: '',
    nindo: '',
    traits: Object.fromEntries(TRAIT_NAMES.map(t => [t, 0])),
    jutsuSkill: Object.fromEntries(JUTSU_SKILL_NAMES.map(j => [j, 0])),
    shinobiTitle: 'Genin',
    shinobiRank: 'D',
    experience: 0,
    chakraControl: 0,
    missions: { D: 0, C: 0, B: 0, A: 0, S: 0 },
    confirmedKills: 0,
    equipment: '',
    ryo: 10000,
    items: '',
    weapons: '',
    gear: '',
    thumbnailUrl: '',
    backgroundUrl: '',
  };

  const MAX_CHARACTERS = 12;
  const MAX_PER_CLAN = 2;
  const MAX_CROSS_CLAN = 3;

  const [form, setForm] = useState(initialState);
  const [user, setUser] = useState<any>(null);
  const [characters, setCharacters] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [crossClanA, setCrossClanA] = useState('');
  const [crossClanB, setCrossClanB] = useState('');
  const isCrossClan = form.clan && form.clan.includes('/');
  // --- End restored declarations ---
  // Restore filteredClans logic
  let filteredClans: string[] = PURE_CLANS;
  if (form.village) {
    const clansInVillage = getClansForVillage(form.village);
    filteredClans = [
      ...clansInVillage,
      ...CROSS_CLANS.filter((crossName: string) => {
        const [a, b] = crossName.split('/').map((s: string) => s.trim());
        return clansInVillage.includes(a) && clansInVillage.includes(b);
      })
    ];
  } else {
    filteredClans = [...PURE_CLANS, ...CROSS_CLANS];
  }

  // Add missing state for file uploads
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);

  let filteredVillages: string[] = villagesData.map((v: any) => v.name);
  if (form.clan) {
    if (isCrossClan) {
      const [a, b] = form.clan.split('/').map((s: string) => s.trim());
      filteredVillages = getVillagesForCrossClan(a, b);
    } else {
      filteredVillages = getVillagesForClan(form.clan);
    }
  }

  // Fetch user and their characters
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (u) {
        const charsRef = collection(db, 'characters');
        const charsQ = query(charsRef, where('ownerUid', '==', u.uid));
        const charsSnap = await getDocs(charsQ);
        setCharacters(charsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    });
    return () => unsub();
  }, []);

  // Calculate derived stats live
  const clanMods = getClanModifiers(form.clan);
  const derived = calculateDerivedStats(form.traits, clanMods);

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

  // Submission handler
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!user) {
      setError('You must be logged in to create a character.');
      return;
    }
    if (characters.length >= MAX_CHARACTERS) {
      setError(`You have reached the maximum of ${MAX_CHARACTERS} characters.`);
      return;
    }
    // Determine if this is a cross-clan character
    const isCrossClan = Array.isArray(form.clan) || (typeof form.clan === 'string' && form.clan.includes('/'));
    // For select, split by /
    const clans = isCrossClan ? (Array.isArray(form.clan) ? form.clan : form.clan.split('/').map(s => s.trim())) : [form.clan];
    // Check per-clan limit
    for (const c of clans) {
      if (clanCounts[c] && clanCounts[c] >= MAX_PER_CLAN) {
        setError(`You already have ${MAX_PER_CLAN} characters from the ${c} clan.`);
        return;
      }
    }
    // Check cross-clan limit
    if (isCrossClan && crossClanCount >= MAX_CROSS_CLAN) {
      setError(`You already have ${MAX_CROSS_CLAN} cross-clan characters.`);
      return;
    }
    // Handle image uploads
    let thumbnailUrl = '';
    let backgroundUrl = '';
    try {
      if (thumbnailFile) {
        const thumbRef = ref(storage, `character-thumbnails/${user.uid}_${Date.now()}_${thumbnailFile.name}`);
        await uploadBytes(thumbRef, thumbnailFile);
        thumbnailUrl = await getDownloadURL(thumbRef);
      }
      if (backgroundFile) {
        const bgRef = ref(storage, `character-backgrounds/${user.uid}_${Date.now()}_${backgroundFile.name}`);
        await uploadBytes(bgRef, backgroundFile);
        backgroundUrl = await getDownloadURL(bgRef);
      }
      await addDoc(collection(db, 'characters'), {
        ...form,
        thumbnailUrl,
        backgroundUrl,
        ownerUid: user.uid,
        createdAt: new Date().toISOString(),
      });
      setError(null);
      alert('Character created!');
      // Optionally, redirect or reset form
    } catch (err) {
      setError('Failed to create character.');
    }
  }

  return (
    <form className="max-w-2xl mx-auto p-4 bg-white rounded shadow space-y-4" onSubmit={handleSubmit}>
      {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-2">{error}</div>}
      <h1 className="text-2xl font-bold mb-4">Ninja Info Card - Character Creation</h1>
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Thumbnail Image Upload */}
        <div>
          <label>Thumbnail Image</label>
          <input type="file" accept="image/*" onChange={e => setThumbnailFile(e.target.files?.[0] || null)} />
          {form.thumbnailUrl && <img src={form.thumbnailUrl} alt="Thumbnail" className="w-24 h-24 object-cover mt-2 rounded" />}
        </div>
        {/* Background Image Upload */}
        <div>
          <label>Background Image</label>
          <input type="file" accept="image/*" onChange={e => setBackgroundFile(e.target.files?.[0] || null)} />
          {form.backgroundUrl && <img src={form.backgroundUrl} alt="Background" className="w-32 h-16 object-cover mt-2 rounded" />}
        </div>
        <div>
          <label>About</label>
          <input type="text" className="input" value={form.about} onChange={e => setForm(f => ({ ...f, about: e.target.value }))} />
        </div>
        <div>
          <label>Clan</label>
          <select
            className="input"
            value={form.clan}
            onChange={e => {
              setForm(f => ({ ...f, clan: e.target.value }));
              // Reset village if new clan doesn't support current village
              let validVillages: string[] = [];
              if (e.target.value.includes('/')) {
                const parts = e.target.value.split('/').map((s: string) => s.trim());
                validVillages = getVillagesForCrossClan(parts[0], parts[1]);
              } else {
                validVillages = getVillagesForClan(e.target.value);
              }
              if (!validVillages.includes(form.village)) {
                setForm(f => ({ ...f, village: '' }));
              }
            }}
          >
            <option value="">Select Clan</option>
            {clansData.length === 0 && <option disabled>Loading clans...</option>}
            {clansData.length > 0 && clansData.map((c: any) => (
              <option key={c.name} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
        {isCrossClan && (
          <div>
            <label>Choose Cross Clan Components</label>
            <div className="flex gap-2">
              <select
                className="input"
                value={crossClanA}
                onChange={e => {
                  setCrossClanA(e.target.value);
                  setForm(f => ({ ...f, clan: e.target.value && crossClanB ? `${e.target.value}/${crossClanB}` : '' }));
                }}
              >
                <option value="">Select Clan A</option>
                {PURE_CLANS.map((clan: string) => (
                  <option key={clan} value={clan}>{clan}</option>
                ))}
              </select>
              <span>/</span>
              <select
                className="input"
                value={crossClanB}
                onChange={e => {
                  setCrossClanB(e.target.value);
                  setForm(f => ({ ...f, clan: crossClanA && e.target.value ? `${crossClanA}/${e.target.value}` : '' }));
                }}
              >
                <option value="">Select Clan B</option>
                {PURE_CLANS.filter((clan: string) => clan !== crossClanA).map((clan: string) => (
                  <option key={clan} value={clan}>{clan}</option>
                ))}
              </select>
            </div>
            <div className="text-xs text-gray-500">Choose two clans to form a cross clan.</div>
          </div>
        )}
        <div>
          <label>Village</label>
          <select
            className="input"
            value={form.village}
            onChange={e => {
              setForm(f => ({ ...f, village: e.target.value }));
              // Reset clan if new village doesn't support current clan
              const validClans = getClansForVillage(e.target.value);
              if (!validClans.includes(form.clan)) {
                setForm(f => ({ ...f, clan: '' }));
              }
            }}
          >
            <option value="">Select Village</option>
            {villagesData.length === 0 && <option disabled>Loading villages...</option>}
            {villagesData.length > 0 && villagesData.map((v: any) => (
              <option key={v.name} value={v.name}>{v.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Elemental Affinities (max 2)</label>
          <select
            className="input"
            value={form.chakraNatures}
            onChange={e => {
              const options = Array.from(e.target.selectedOptions).map(o => o.value);
              setForm(f => ({ ...f, chakraNatures: options.filter(Boolean).slice(0, 2) }));
            }}
            multiple
            size={ELEMENTAL_AFFINITIES.length}
          >
            {ELEMENTAL_AFFINITIES.map(aff => (
              <option key={aff} value={aff}>{aff}</option>
            ))}
          </select>
          <div className="text-xs text-gray-500">Hold Ctrl (Windows) or Cmd (Mac) to select up to 2.</div>
        </div>
        <div>
          <label>Gender</label>
          <select className="input" value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
            <option value="">Select</option>
            <option value="M">M</option>
            <option value="F">F</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label>Birthday</label>
          <input type="text" className="input" value={form.birthday} onChange={e => setForm(f => ({ ...f, birthday: e.target.value }))} placeholder="MM/DD/YYYY" />
        </div>
        <div>
          <label>Age</label>
          <input type="number" className="input" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} />
        </div>
        <div>
          <label>Height</label>
          <input type="text" className="input" value={form.height} onChange={e => setForm(f => ({ ...f, height: e.target.value }))} placeholder={'5\'7"'} />
        </div>
        <div>
          <label>Chakra Natures (max 2)</label>
          <input type="text" className="input" value={form.chakraNatures.join(', ')} onChange={e => setForm(f => ({ ...f, chakraNatures: e.target.value.split(',').map(s => s.trim()).slice(0,2) }))} placeholder="Fire, Wind" />
        </div>
        <div>
          <label>Personality</label>
          <input type="text" className="input" value={form.personality} onChange={e => setForm(f => ({ ...f, personality: e.target.value }))} />
        </div>
        <div>
          <label>Likes</label>
          <input type="text" className="input" value={form.likes} onChange={e => setForm(f => ({ ...f, likes: e.target.value }))} />
        </div>
        <div>
          <label>Dislikes</label>
          <input type="text" className="input" value={form.dislikes} onChange={e => setForm(f => ({ ...f, dislikes: e.target.value }))} />
        </div>
        <div className="md:col-span-2">
          <label>History</label>
          <textarea className="input" value={form.history} onChange={e => setForm(f => ({ ...f, history: e.target.value }))} />
        </div>
        <div className="md:col-span-2">
          <label>Nindo (Ninja Way)</label>
          <input type="text" className="input" value={form.nindo} onChange={e => setForm(f => ({ ...f, nindo: e.target.value }))} />
        </div>
      </div>
      {/* Derived Stats */}
      <div className="mt-6">
        <h2 className="font-bold">Derived Stats</h2>
        <div className="grid grid-cols-2 gap-2">
          <div>HP: <span className="font-mono">{derived.HP}</span></div>
          <div>DP: <span className="font-mono">{derived.DP}</span></div>
          <div>EP: <span className="font-mono">{derived.EP}</span></div>
          <div>OP: <span className="font-mono">{derived.OP}</span></div>
          <div>Initiative: <span className="font-mono">{derived.Initiative}</span></div>
          <div>ROP: <span className="font-mono">{derived.ROP}</span></div>
        </div>
        <div className="text-xs text-gray-500 mt-1">These update automatically as you assign trait points.</div>
      </div>
      <div className="mt-6">
        <h2 className="font-bold">Traits (Point Buy)</h2>
        <div className="text-xs text-gray-500 mb-2">Distribute {TRAIT_POINTS} points among the traits below.</div>
        <div className="grid grid-cols-2 gap-2">
          {TRAIT_NAMES.map(trait => (
            <div key={trait} className="flex items-center gap-2">
              <label className="capitalize w-24">{trait}</label>
              <button type="button" className="px-2" onClick={() => setForm(f => ({ ...f, traits: { ...f.traits, [trait]: Math.max(0, f.traits[trait] - 1) } }))} disabled={form.traits[trait] <= 0}>-</button>
              <span>{form.traits[trait]}</span>
              <button type="button" className="px-2" onClick={() => {
                const spent = TRAIT_NAMES.reduce((sum, t) => sum + form.traits[t], 0);
                if (spent < TRAIT_POINTS) setForm(f => ({ ...f, traits: { ...f.traits, [trait]: f.traits[trait] + 1 } }));
              }} disabled={TRAIT_NAMES.reduce((sum, t) => sum + form.traits[t], 0) >= TRAIT_POINTS}>+</button>
            </div>
          ))}
        </div>
        <div className="text-xs text-gray-500 mt-1">Points remaining: {TRAIT_POINTS - TRAIT_NAMES.reduce((sum, t) => sum + form.traits[t], 0)}</div>
      </div>

      {/* Jutsu Skill Point Buy */}
      <div className="mt-6">
        <h2 className="font-bold">Jutsu Skills (Point Buy)</h2>
        <div className="text-xs text-gray-500 mb-2">Distribute {JUTSU_SKILL_POINTS} points among the jutsu skills below.</div>
        <div className="grid grid-cols-2 gap-2">
          {JUTSU_SKILL_NAMES.map(skill => (
            <div key={skill} className="flex items-center gap-2">
              <label className="capitalize w-24">{skill}</label>
              <button type="button" className="px-2" onClick={() => setForm(f => ({ ...f, jutsuSkill: { ...f.jutsuSkill, [skill]: Math.max(0, f.jutsuSkill[skill] - 1) } }))} disabled={form.jutsuSkill[skill] <= 0}>-</button>
              <span>{form.jutsuSkill[skill]}</span>
              <button type="button" className="px-2" onClick={() => {
                const spent = JUTSU_SKILL_NAMES.reduce((sum, t) => sum + form.jutsuSkill[t], 0);
                if (spent < JUTSU_SKILL_POINTS) setForm(f => ({ ...f, jutsuSkill: { ...f.jutsuSkill, [skill]: f.jutsuSkill[skill] + 1 } }));
              }} disabled={JUTSU_SKILL_NAMES.reduce((sum, t) => sum + form.jutsuSkill[t], 0) >= JUTSU_SKILL_POINTS}>+</button>
            </div>
          ))}
        </div>
        <div className="text-xs text-gray-500 mt-1">Points remaining: {JUTSU_SKILL_POINTS - JUTSU_SKILL_NAMES.reduce((sum, t) => sum + form.jutsuSkill[t], 0)}</div>
      </div>
      <button type="submit" className="btn btn-primary">Create Character</button>

    </form>
  );
}

