import React, { useState } from 'react';

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
  traits: {
    intelligence: 0,
    strength: 0,
    speed: 0,
    stamina: 0,
    will: 0,
  },
  jutsuSkill: {
    ninjutsu: 0,
    genjutsu: 0,
    taijutsu: 0,
    fuinjutsu: 0,
    iryojutsu: 0,
    bukijutsu: 0,
    kenjutsu: 0,
  },
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
          <input type="text" className="input" value={form.clan} onChange={e => setForm(f => ({ ...f, clan: e.target.value }))} />
        </div>
        <div>
          <label>Village</label>
          <input type="text" className="input" value={form.village} onChange={e => setForm(f => ({ ...f, village: e.target.value }))} />
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
      {/* Traits and Jutsu Skill would go here */}
      {/* TODO: Add traits, jutsu skill, derived stats, and inventory sections */}
      <button type="submit" className="btn btn-primary">Create Character</button>
    </form>
  );
}
