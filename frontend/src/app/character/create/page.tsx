"use client";


import { useEffect } from 'react';

  useEffect(() => {}, []); // Dummy client-only hook to force client rendering
  return (
    <main className="p-6 max-w-3xl mx-auto">
      <CharacterCreationForm />
    </main>
  );
}
