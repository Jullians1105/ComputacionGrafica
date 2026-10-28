import type { ProfileFormValues } from './validation';

export const PROFILE_FIELDS = ['nombre', 'apellido', 'telefono', 'nacionalidad'] as const;

/** Valores del formulario a partir del perfil del backend (los campos que falten quedan vacíos). */
export function profileToForm(profile: Record<string, unknown> | null | undefined): ProfileFormValues {
  const read = (key: string) => (typeof profile?.[key] === 'string' ? (profile[key] as string) : '');
  return { nombre: read('nombre'), apellido: read('apellido'), telefono: read('telefono'), nacionalidad: read('nacionalidad') };
}

/** Solo los campos que cambiaron respecto al original (comparando sin espacios sobrantes). */
export function changedFields(original: ProfileFormValues, current: ProfileFormValues): Partial<ProfileFormValues> {
  const changes: Partial<ProfileFormValues> = {};
  for (const field of PROFILE_FIELDS) {
    const next = current[field].trim();
    if (next !== original[field].trim()) changes[field] = next;
  }
  return changes;
}
