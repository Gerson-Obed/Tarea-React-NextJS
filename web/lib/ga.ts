// lib/ga.ts
// Manda un evento a GA4. Si GA no está cargado (sin ID o bloqueado), no hace nada.

type Gtag = (comando: 'event', nombre: string, parametros?: Record<string, unknown>) => void;

export function enviarEvento(nombre: string, parametros?: Record<string, unknown>) {
  const gtag = (globalThis as unknown as { gtag?: Gtag }).gtag;
  gtag?.('event', nombre, parametros);
}
