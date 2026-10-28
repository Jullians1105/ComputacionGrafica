import { ApiError, apiClient } from './apiClient';

export interface ProfileData {
  nombre: string;
  apellido: string;
  telefono: string;
  nacionalidad: string;
}

/** Perfil tal como lo devuelve el backend (puede traer campos extra). */
export type UserProfile = Partial<ProfileData> & Record<string, unknown>;

export const usersApi = {
  /** POST /api/users/register — el backend lo trata como "registrar/actualizar", así que reintentar es seguro. */
  register: (data: ProfileData) => apiClient.post<UserProfile>('/api/users/register', data),
  get: (uid: string) => apiClient.get<UserProfile>(`/api/users/${encodeURIComponent(uid)}`),
  update: (uid: string, data: Partial<ProfileData>) =>
    apiClient.put<UserProfile>(`/api/users/${encodeURIComponent(uid)}`, data),
};

export type ProfileLookup = { status: 'complete'; profile: UserProfile } | { status: 'missing' };

/**
 * Interpreta la respuesta de GET /api/users/:uid.
 * AISLADO A PROPÓSITO: aún no está verificado qué responde el backend cuando el
 * usuario existe en Firebase pero no tiene perfil. Supuesto actual:
 *   - 404                      → falta el perfil ("completar perfil")
 *   - 200 con cuerpo vacío     → falta el perfil
 *   - 200 con datos            → perfil completo
 *   - cualquier otro error     → se propaga (la UI ofrece "Reintentar")
 * Si el backend responde distinto, ajusta solo esta función.
 */
export async function lookupProfile(uid: string): Promise<ProfileLookup> {
  try {
    const profile = await usersApi.get(uid);
    const isEmpty = !profile || (typeof profile === 'object' && Object.keys(profile).length === 0);
    return isEmpty ? { status: 'missing' } : { status: 'complete', profile };
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return { status: 'missing' };
    throw err;
  }
}
