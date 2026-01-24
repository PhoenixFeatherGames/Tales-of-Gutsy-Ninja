// ...existing code...
// Utility to get clan modifiers (stub for now, can be expanded)
function getClanModifiers(clan) {
  // Example: Kaguya gets -5 Ninjutsu, +2 Taijutsu, etc.
  // This should be replaced with a lookup from the loaded clan data
  return {};
}

function calculateDerivedStats(traits, clanMods = {}) {
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
"use client";
import React, { useState, useMemo } from 'react';

// Example data, replace with dynamic fetch if needed
const CLANS = [
  "Kaguya", "Hoshigaki", "Hyūga", "Senju", "Kaguya/Hozuki", "Kaguya/Samurai"
];
const VILLAGES = [
  "The Hidden Lightning Village", "The Hidden Mist Village", "The Hidden Sand Village", "The Hidden Stone Village"
];
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
};

export default function CharacterCreationForm() {
  const [form, setForm] = useState(initialState);

  // TODO: Add handlers, validation, and derived stat calculations

  // Calculate derived stats live
  const clanMods = getClanModifiers(form.clan);
  const derived = calculateDerivedStats(form.traits, clanMods);

  return (
    <form className="max-w-2xl mx-auto p-4 bg-white rounded shadow space-y-4">
      <h1 className="text-2xl font-bold mb-4">Ninja Info Card - Character Creation</h1>
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label>About</label>
          <input type="text" className="input" value={form.about} onChange={e => setForm(f => ({ ...f, about: e.target.value }))} />
        </div>
        <div>
          <label>Clan</label>
          <select className="input" value={form.clan} onChange={e => setForm(f => ({ ...f, clan: e.target.value }))}>
            <option value="">Select Clan</option>
            {CLANS.map(clan => (
              <option key={clan} value={clan}>{clan}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Village</label>
          <select className="input" value={form.village} onChange={e => setForm(f => ({ ...f, village: e.target.value }))}>
            <option value="">Select Village</option>
            {VILLAGES.map(village => (
              <option key={village} value={village}>{village}</option>
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
              setForm(f => ({ ...f, chakraNatures: options.slice(0, 2) }));
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
                const spent = TRAIT_NAMES.reduce((sum, t) => sum + f.traits[t], 0);
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
                const spent = JUTSU_SKILL_NAMES.reduce((sum, t) => sum + f.jutsuSkill[t], 0);
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
