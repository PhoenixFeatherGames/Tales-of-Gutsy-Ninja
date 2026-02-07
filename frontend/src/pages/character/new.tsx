import CharacterCreationForm from '@/components/CharacterCreationForm';
import { useEffect } from 'react';

export default function CharacterCreatePage() {
  useEffect(() => {}, []); // Dummy client-only hook to force client rendering
  return (
    <main className="p-6 max-w-3xl mx-auto">
      <CharacterCreationForm />
    </main>
  );
}
