// lib/api.ts

import type { CrearTarea, Tarea } from '@/lib/tareas.schema';

export const API =
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:4000';

export async function traerTareas(): Promise<Tarea[]> {
  const respuesta = await fetch(`${API}/tareas`, {
    cache: 'no-store',
  });

  if (!respuesta.ok)
    throw new Error('La API no respondió. ¿Está corriendo en el 4000?');

  return respuesta.json();
}

/** POST /tareas — la usa useMutation para crear. */
export async function crearTareaApi(datos: CrearTarea): Promise<Tarea> {
  const respuesta = await fetch(`${API}/tareas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });

  if (!respuesta.ok) throw (await respuesta.json()) as ErrorApi;
  return respuesta.json();
}

/** PATCH /tareas/:id — marca o desmarca una tarea. */
export async function alternarTarea(id: string): Promise<Tarea> {
  const respuesta = await fetch(`${API}/tareas/${id}`, { method: 'PATCH' });

  if (!respuesta.ok) throw (await respuesta.json()) as ErrorApi;
  return respuesta.json();
}

/** Lo que la API devuelve cuando algo sale mal. */
export type ErrorApi = {
  mensaje: string;
  errores: Record<string, string>;
};
