"use client";
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
import React, { useState, useMemo } from 'react';
import { useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

// Load clans and villages from JSON

// Dynamic data loading must be inside the component
import { useRef } from 'react';

export default function CharacterCreationForm() {
  // ...existing state declarations...
  const [clansData, setClansData] = useState<any[]>([]);
  const [villagesData, setVillagesData] = useState<any[]>([]);
  useEffect(() => {
    fetch('/data/seeds/clans.json').then(res => res.json()).then(setClansData);
    fetch('/data/seeds/villages.json').then(res => res.json()).then(setVillagesData);
  }, []);
  // ...rest of the component...

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

// ...rest of the file unchanged...
// (Copy the rest of the file content here)
