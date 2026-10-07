// app/lista-viva.tsx
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { alternarTarea, crearTareaApi, traerTareas, type ErrorApi } from '@/lib/api';
import { crearTarea, MATERIAS, type Tarea } from '@/lib/tareas.schema';

// La llave con la que se guarda la lista en el caché.
const LLAVE = ['tareas'];

export function ListaViva({ iniciales }: { iniciales: Tarea[] }) {
  const queryClient = useQueryClient();

  // ── useQuery: leer ──
  // Arranca con lo que trajo el servidor (initialData) y después
  // React Query se encarga de mantenerlo fresco desde el caché.
  const { data: tareas, isFetching, error } = useQuery({
    queryKey: LLAVE,
    queryFn: traerTareas,
    initialData: iniciales,
  });

  // ── useMutation: crear ──
  const [titulo, setTitulo] = useState('');
  const [materia, setMateria] = useState<string>(MATERIAS[0]);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const crear = useMutation({
    mutationFn: crearTareaApi,
    onSuccess: () => {
      setTitulo('');
      setErrores({});
      // Marca la lista como vieja: useQuery la vuelve a pedir sola.
      queryClient.invalidateQueries({ queryKey: LLAVE });
    },
    onError: (e: ErrorApi) => setErrores(e.errores ?? {}),
  });

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    // Validamos con el mismo esquema de zod antes de molestar a la API.
    const r = crearTarea.safeParse({ titulo, materia });
    if (!r.success) {
      const errs: Record<string, string> = {};
      for (const issue of r.error.issues) errs[String(issue.path[0])] = issue.message;
      setErrores(errs);
      return;
    }
    crear.mutate(r.data);
  }

  // ── useMutation: marcar / desmarcar (actualización optimista) ──
  const marcar = useMutation({
    mutationFn: alternarTarea,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: LLAVE });
      const antes = queryClient.getQueryData<Tarea[]>(LLAVE);
      // Cambiamos el caché YA, sin esperar a la API.
      queryClient.setQueryData<Tarea[]>(LLAVE, (lista = []) =>
        lista.map((t) => (t.id === id ? { ...t, hecha: !t.hecha } : t)),
      );
      return { antes };
    },
    // Si la API falla, regresamos el caché a como estaba.
    onError: (_e, _id, ctx) => queryClient.setQueryData(LLAVE, ctx?.antes),
    onSettled: () => queryClient.invalidateQueries({ queryKey: LLAVE }),
  });

  const pendientes = tareas.filter((t) => !t.hecha).length;

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between text-sm">
        <span className="opacity-70">
          {pendientes} pendiente{pendientes === 1 ? '' : 's'} de {tareas.length}
        </span>
        <span
          className={`rounded-full px-3 py-1 font-medium ${
            isFetching ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
          }`}
        >
          {isFetching ? 'Actualizando…' : 'Al día (desde el caché)'}
        </span>
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-800">
          {error.message}
        </p>
      )}

      <form onSubmit={enviar} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <div className="flex-1">
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Nueva tarea"
            className="w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2"
          />
          {errores.titulo && <p className="mt-1 text-sm text-red-600">{errores.titulo}</p>}
        </div>
        <div>
          <select
            value={materia}
            onChange={(e) => setMateria(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2"
          >
            {MATERIAS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
          {errores.materia && <p className="mt-1 text-sm text-red-600">{errores.materia}</p>}
        </div>
        <button
          type="submit"
          disabled={crear.isPending}
          className="h-[42px] rounded-lg bg-neutral-900 px-4 font-medium text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
        >
          {crear.isPending ? 'Guardando…' : 'Agregar'}
        </button>
      </form>

      <ul className="mt-6 space-y-2">
        {tareas.map((t) => (
          <li
            key={t.id}
            className="flex items-center gap-3 rounded-xl border border-neutral-200 px-4 py-3 dark:border-neutral-800"
          >
            <input
              type="checkbox"
              checked={t.hecha}
              onChange={() => marcar.mutate(t.id)}
              className="size-5"
            />
            <div className="min-w-0 flex-1">
              <p className={t.hecha ? 'line-through opacity-50' : 'font-medium'}>{t.titulo}</p>
              <p className="text-xs opacity-60">{t.materia}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
