import express from 'express';
import cors from 'cors';
import { randomUUID } from 'node:crypto';

type Tarea = {
  id: string;
  titulo: string;
  materia: string;
  hecha: boolean;
};

const MATERIAS = ['Programación IV', 'Base de Datos', 'Redes'];

const tareas: Tarea[] = [
  { id: randomUUID(), titulo: 'Leer sobre TanStack Query', materia: 'Programación IV', hecha: true },
  { id: randomUUID(), titulo: 'Normalizar la base de la biblioteca', materia: 'Base de Datos', hecha: false },
  { id: randomUUID(), titulo: 'Subnetear la red del laboratorio', materia: 'Redes', hecha: false },
  { id: randomUUID(), titulo: 'Probar useMutation con la API', materia: 'Programación IV', hecha: false },
];

const app = express();

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Un poco de espera para que se note el estado de carga y el caché.
const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

app.get('/tareas', async (_req, res) => {
  await esperar(600);
  res.json(tareas);
});

app.post('/tareas', async (req, res) => {
  await esperar(400);
  const { titulo, materia } = req.body ?? {};
  const errores: Record<string, string> = {};

  if (typeof titulo !== 'string' || titulo.trim().length < 3)
    errores.titulo = 'Escribe al menos 3 caracteres';
  else if (titulo.trim().length > 80) errores.titulo = 'Máximo 80 caracteres';
  if (!MATERIAS.includes(materia)) errores.materia = 'Elige una materia de la lista';

  if (Object.keys(errores).length > 0) {
    res.status(400).json({ mensaje: 'Revisa los campos', errores });
    return;
  }

  const tarea: Tarea = { id: randomUUID(), titulo: titulo.trim(), materia, hecha: false };
  tareas.unshift(tarea);
  res.status(201).json(tarea);
});

app.patch('/tareas/:id', async (req, res) => {
  await esperar(300);
  const tarea = tareas.find((t) => t.id === req.params.id);
  if (!tarea) {
    res.status(404).json({ mensaje: 'No existe esa tarea', errores: {} });
    return;
  }
  tarea.hecha = !tarea.hecha;
  res.json(tarea);
});

app.listen(4000, () => console.log('API lista en http://localhost:4000'));
