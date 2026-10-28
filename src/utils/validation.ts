/** Validaciones de formularios. Cada función devuelve el mensaje de error o null si el valor es válido. */

export const MIN_PASSWORD = 8;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function required(value: string, label = 'Este campo'): string | null {
  return value.trim() ? null : `${label} es obligatorio.`;
}

export function validateEmail(value: string): string | null {
  if (!value.trim()) return 'Ingresa tu correo electrónico.';
  return EMAIL_RE.test(value.trim()) ? null : 'Ingresa un correo válido.';
}

export function validatePassword(value: string): string | null {
  if (!value) return 'Ingresa una contraseña.';
  return value.length >= MIN_PASSWORD ? null : `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`;
}

export function validatePasswordConfirm(password: string, confirm: string): string | null {
  if (!confirm) return 'Confirma tu contraseña.';
  return password === confirm ? null : 'Las contraseñas no coinciden.';
}

/** Teléfono: dígitos con +, espacios, guiones o paréntesis opcionales; entre 7 y 15 dígitos. */
export function validatePhone(value: string): string | null {
  if (!value.trim()) return 'El teléfono es obligatorio.';
  if (!/^\+?[\d\s()-]+$/.test(value.trim())) return 'El teléfono solo puede tener números, espacios y +.';
  const digits = value.replace(/\D/g, '').length;
  return digits >= 7 && digits <= 15 ? null : 'Ingresa un teléfono válido (7 a 15 dígitos).';
}

export interface ProfileFormValues {
  nombre: string;
  apellido: string;
  telefono: string;
  nacionalidad: string;
}

export type FormErrors<T> = Partial<Record<keyof T, string>>;

export function validateProfile(v: ProfileFormValues): FormErrors<ProfileFormValues> {
  return compact({
    nombre: required(v.nombre, 'El nombre'),
    apellido: required(v.apellido, 'El apellido'),
    telefono: validatePhone(v.telefono),
    nacionalidad: v.nacionalidad ? null : 'Selecciona tu nacionalidad.',
  });
}

export interface RegisterFormValues extends ProfileFormValues {
  email: string;
  password: string;
  confirm: string;
}

export function validateRegister(v: RegisterFormValues): FormErrors<RegisterFormValues> {
  return compact({
    ...validateProfile(v),
    email: validateEmail(v.email),
    password: validatePassword(v.password),
    confirm: validatePasswordConfirm(v.password, v.confirm),
  });
}

export interface LoginFormValues {
  email: string;
  password: string;
}

/** En el login no se exige el mínimo de 8: solo que haya contraseña (las cuentas antiguas podrían ser más cortas). */
export function validateLogin(v: LoginFormValues): FormErrors<LoginFormValues> {
  return compact({
    email: validateEmail(v.email),
    password: v.password ? null : 'Ingresa tu contraseña.',
  });
}

export interface ChangePasswordValues {
  current: string;
  password: string;
  confirm: string;
}

export function validateChangePassword(v: ChangePasswordValues): FormErrors<ChangePasswordValues> {
  const password =
    validatePassword(v.password) ??
    (v.current && v.password === v.current ? 'La nueva contraseña debe ser distinta de la actual.' : null);
  return compact({
    current: v.current ? null : 'Ingresa tu contraseña actual.',
    password,
    confirm: validatePasswordConfirm(v.password, v.confirm),
  });
}

export interface ChangeEmailValues {
  current: string;
  email: string;
}

export function validateChangeEmail(v: ChangeEmailValues, currentEmail: string | null): FormErrors<ChangeEmailValues> {
  const email =
    validateEmail(v.email) ??
    (currentEmail && v.email.trim().toLowerCase() === currentEmail.toLowerCase()
      ? 'Ese ya es tu correo actual.'
      : null);
  return compact({
    current: v.current ? null : 'Ingresa tu contraseña actual.',
    email,
  });
}

export function hasErrors(errors: object): boolean {
  return Object.keys(errors).length > 0;
}

function compact<T>(obj: Record<string, string | null | undefined>): FormErrors<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, msg]) => !!msg)) as FormErrors<T>;
}
