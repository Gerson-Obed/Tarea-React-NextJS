// app/error.tsx
'use client'; // ← obligatorio

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main>
      <h1>Algo se rompió</h1>
      <p>{error.message}</p>

      <button onClick={reset}>
        Intentar de nuevo
      </button>
    </main>
  );
}