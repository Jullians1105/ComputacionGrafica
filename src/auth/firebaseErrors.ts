/** Traducción de códigos de error de Firebase Auth a mensajes en español. */

const MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'Correo o contraseña incorrectos.',
  'auth/wrong-password': 'Correo o contraseña incorrectos.',
  'auth/user-not-found': 'Correo o contraseña incorrectos.',
  'auth/invalid-email': 'Ingresa un correo válido.',
  'auth/missing-email': 'Ingresa tu correo electrónico.',
  'auth/missing-password': 'Ingresa tu contraseña.',
  'auth/email-already-in-use': 'Ya existe una cuenta con este correo. Inicia sesión o recupera tu contraseña.',
  'auth/weak-password': 'La contraseña es muy débil. Usa al menos 8 caracteres combinando letras y números.',
  'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.',
  'auth/network-request-failed': 'Sin conexión. Revisa tu internet e inténtalo de nuevo.',
  'auth/user-disabled': 'Esta cuenta está deshabilitada. Contacta al soporte de Lapticon.',
  'auth/popup-blocked': 'El navegador bloqueó la ventana de Google. Permite las ventanas emergentes e inténtalo de nuevo.',
  'auth/account-exists-with-different-credential':
    'Ya existe una cuenta con este correo usando otro método de acceso. Inicia sesión con correo y contraseña.',
  'auth/operation-not-allowed': 'Este método de inicio de sesión no está habilitado.',
  'auth/unauthorized-domain': 'Este dominio no está autorizado para iniciar sesión con Google.',
  'auth/internal-error': 'Ocurrió un error inesperado. Inténtalo de nuevo.',
  'auth/requires-recent-login': 'Por seguridad, vuelve a ingresar tu contraseña actual e inténtalo de nuevo.',
  'auth/invalid-new-email': 'Ingresa un correo nuevo válido.',
  'auth/user-token-expired': 'Tu sesión expiró. Inicia sesión de nuevo.',
  'auth/user-mismatch': 'La contraseña no corresponde a la cuenta con la que iniciaste sesión.',
};

/** Mensajes al reautenticar con la contraseña actual (Cambiar contraseña / Cambiar correo). */
export const REAUTH_MESSAGES: Record<string, string> = {
  'auth/wrong-password': 'La contraseña actual es incorrecta',
  'auth/invalid-credential': 'La contraseña actual es incorrecta',
  'auth/missing-password': 'Ingresa tu contraseña actual.',
};

/** Códigos que se muestran junto al campo "Contraseña actual" en vez de en un aviso general. */
export function isWrongCurrentPassword(code: string | undefined): boolean {
  return code === 'auth/wrong-password' || code === 'auth/invalid-credential';
}

/** Errores que el usuario provocó a propósito (p. ej. cerrar la ventana de Google): no se muestran. */
const SILENT = new Set(['auth/popup-closed-by-user', 'auth/cancelled-popup-request', 'auth/user-cancelled']);

export function isSilentAuthError(code: string | undefined): boolean {
  return !!code && SILENT.has(code);
}

/** Traduce un código; `overrides` permite mensajes propios de una pantalla (tienen prioridad). */
export function firebaseErrorMessage(code: string | undefined, overrides?: Record<string, string>): string {
  return (code && (overrides?.[code] ?? MESSAGES[code])) || 'No pudimos completar la operación. Inténtalo de nuevo.';
}
