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

// ...rest of the file copied from backup...
[full content from CharacterCreationForm.client.bak.tsx]
