import { ordenarPaises } from '../utils/paises';
import { apiClient } from './apiClient';

let cache: Promise<string[]> | null = null;

/** GET /api/ciudades/paises (pública, sin token). Se cachea en memoria durante la sesión. */
export function getPaises(): Promise<string[]> {
  if (!cache) {
    cache = apiClient.get<unknown>('/api/ciudades/paises', { auth: false }).then(ordenarPaises);
    cache.catch(() => {
      cache = null; // Si falla, el siguiente intento vuelve a pedirla.
    });
  }
  return cache;
}
