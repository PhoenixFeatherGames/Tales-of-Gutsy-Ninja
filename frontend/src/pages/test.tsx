import { useState } from 'react';

export default function TestPage() {
  const [count, setCount] = useState(0);
  return (
    <main style={{ padding: 40 }}>
      <h1>Test Page</h1>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
    </main>
  );
}
