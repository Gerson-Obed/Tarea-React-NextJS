// app/page.tsx
// sin "use client": esta parte corre en el servidor

import { traerTareas } from '@/lib/api';
import { ListaViva } from './lista-viva';

export default async function Home() {
  // El servidor trae la primera versión de la lista...
  const tareas = await traerTareas();

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <h1 className="text-3xl font-bold">Tareas</h1>
      <p className="mt-1 text-sm opacity-60">Programación IV · React Query</p>

      {/* ...y se la pasa al cliente como datos iniciales del caché */}
      <ListaViva iniciales={tareas} />
    </main>
  );
}
