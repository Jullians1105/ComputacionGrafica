import {
  EmailAuthProvider,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getRedirectResult,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updatePassword,
  updateProfile,
  verifyBeforeUpdateEmail,
  type User,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { errorCode } from '../utils/errorMessage';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/** El usuario actual o un error con código de Firebase (lo traduce firebaseErrors). */
function currentUser(): User {
  const user = auth.currentUser;
  if (!user || !user.email) throw Object.assign(new Error('Sin sesión'), { code: 'auth/user-token-expired' });
  return user;
}

/** Confirma la contraseña actual (Firebase exige un login reciente para cambiar contraseña o correo). */
async function reauthenticate(currentPassword: string): Promise<User> {
  const user = currentUser();
  await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email!, currentPassword));
  return user;
}

/** true si la cuenta tiene contraseña (aunque también use Google): puede cambiar contraseña y correo. */
export function hasPasswordProvider(user: User | null): boolean {
  return !!user?.providerData.some((p) => p.providerId === EmailAuthProvider.PROVIDER_ID);
}

export const authService = {
  loginWithEmail: (email: string, password: string) => signInWithEmailAndPassword(auth, email.trim(), password),

  async registerWithEmail(email: string, password: string, displayName: string) {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    // No bloquea el registro si falla: el nombre real vive en el perfil del backend.
    await updateProfile(cred.user, { displayName }).catch(() => undefined);
    return cred;
  },

  /** Popup en navegador; si el navegador lo bloquea (común en PWA instalada) se usa redirección. */
  async loginWithGoogle() {
    try {
      return await signInWithPopup(auth, googleProvider);
    } catch (err) {
      if (errorCode(err) === 'auth/popup-blocked' || errorCode(err) === 'auth/operation-not-supported-in-this-environment') {
        await signInWithRedirect(auth, googleProvider);
        return null;
      }
      throw err;
    }
  },

  /** Recoge el resultado (o el error) de un login con Google por redirección. */
  completeGoogleRedirect: () => getRedirectResult(auth),

  sendPasswordReset: (email: string) => sendPasswordResetEmail(auth, email.trim()),

  /** Reautentica con la contraseña actual y luego cambia la contraseña. */
  async changePassword(currentPassword: string, newPassword: string) {
    const user = await reauthenticate(currentPassword);
    await updatePassword(user, newPassword);
  },

  /**
   * Reautentica y envía un enlace de verificación al correo nuevo. El correo de Firebase
   * solo cambia cuando el usuario abre ese enlace (y entonces Firebase cierra la sesión).
   */
  async requestEmailChange(currentPassword: string, newEmail: string) {
    const user = await reauthenticate(currentPassword);
    await verifyBeforeUpdateEmail(user, newEmail.trim());
  },

  /** Reenvío del enlace sin pedir de nuevo la contraseña (vale mientras el login reciente siga vigente). */
  resendEmailChange: (newEmail: string) => verifyBeforeUpdateEmail(currentUser(), newEmail.trim()),

  logout: () => signOut(auth),
};
