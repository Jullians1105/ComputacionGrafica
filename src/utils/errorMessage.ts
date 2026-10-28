import { firebaseErrorMessage } from '../auth/firebaseErrors';

/** Código de error de Firebase (auth/...), si el error lo trae. */
export function errorCode(err: unknown): string | undefined {
  const code = (err as { code?: unknown } | null)?.code;
  return typeof code === 'string' ? code : undefined;
}

/**
 * Mensaje amigable en español para cualquier error (Firebase, ApiError u otro).
 * `overrides` reemplaza mensajes de códigos de Firebase concretos para una pantalla.
 */
export function errorMessage(err: unknown, overrides?: Record<string, string>): string {
  const code = errorCode(err);
  if (code?.startsWith('auth/')) return firebaseErrorMessage(code, overrides);
  if (err instanceof Error && err.name === 'ApiError') return err.message;
  return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
}
