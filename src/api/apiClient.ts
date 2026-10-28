import { auth } from '../config/firebase';
import { serverWake } from './serverWake';

/**
 * Cliente HTTP único para el backend de Lapticon.
 * - Agrega `Authorization: Bearer <idToken>` usando getIdToken() (el SDK lo renueva solo).
 * - Timeout largo (60 s) porque Render gratis puede tardar en despertar.
 * - Convierte cualquier fallo en ApiError con un mensaje en español listo para mostrar.
 */

// Por defecto se llama a /api en el mismo origen: en desarrollo lo reenvía el proxy de Vite y en
// producción las reglas de vercel.json / public/_redirects (Netlify). Así se evita el CORS del backend.
// VITE_API_BASE_URL permite apuntar directo a otro backend si su CORS lo admite.
const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
const TIMEOUT_MS = 60_000;

export type ApiErrorKind = 'http' | 'network' | 'timeout' | 'no-session';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly kind: ApiErrorKind,
    readonly status: number | null = null,
    readonly detail?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function messageForStatus(status: number): string {
  if (status === 400) return 'Algunos datos no son válidos. Revísalos e inténtalo de nuevo.';
  if (status === 401) return 'Tu sesión expiró o no es válida. Inicia sesión de nuevo.';
  if (status === 403) return 'No tienes permiso para realizar esta acción.';
  if (status === 404) return 'No encontramos la información solicitada.';
  if (status === 409) return 'Estos datos ya están registrados.';
  if (status === 429) return 'Demasiadas solicitudes. Espera un momento e inténtalo de nuevo.';
  if (status >= 500) return 'El servidor tuvo un problema. Inténtalo de nuevo en unos minutos.';
  return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
}

let onUnauthorized: (() => void) | null = null;

/** El AuthProvider registra aquí qué hacer cuando el backend rechaza la sesión (401). */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  /** false para rutas públicas (sin token). */
  auth?: boolean;
}

async function send(path: string, { method = 'GET', body, auth: withAuth = true }: RequestOptions, forceRefresh: boolean) {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  if (withAuth) {
    const user = auth.currentUser;
    if (!user) throw new ApiError('Inicia sesión para continuar.', 'no-session', 401);
    headers.Authorization = `Bearer ${await user.getIdToken(forceRefresh)}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const endWake = serverWake.begin();
  try {
    return await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    if (controller.signal.aborted) {
      throw new ApiError('El servidor está tardando demasiado en responder. Inténtalo de nuevo.', 'timeout');
    }
    if (!navigator.onLine) {
      throw new ApiError('Sin conexión a internet. Revisa tu red e inténtalo de nuevo.', 'network', null, err);
    }
    throw new ApiError('No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.', 'network', null, err);
  } finally {
    clearTimeout(timer);
    endWake();
  }
}

async function readBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let res = await send(path, options, false);

  // Render dormido: el proxy del hosting puede cortar antes de que despierte (502/503/504).
  // Para entonces el backend ya está arrancando, así que un reintento suele bastar.
  if (res.status === 502 || res.status === 503 || res.status === 504) {
    res = await send(path, options, false);
  }

  // Un 401 con token puede deberse a un token recién vencido: se renueva una vez y se reintenta.
  if (res.status === 401 && options.auth !== false) {
    res = await send(path, options, true);
  }

  const data = await readBody(res);
  if (res.ok) return data as T;

  if (res.status === 401 && options.auth !== false) onUnauthorized?.();
  throw new ApiError(messageForStatus(res.status), 'http', res.status, data);
}

export const apiClient = {
  get: <T>(path: string, opts?: Omit<RequestOptions, 'method' | 'body'>) => apiRequest<T>(path, { ...opts, method: 'GET' }),
  post: <T>(path: string, body: unknown) => apiRequest<T>(path, { method: 'POST', body }),
  put: <T>(path: string, body: unknown) => apiRequest<T>(path, { method: 'PUT', body }),
};
