import { onAuthStateChanged, type User } from 'firebase/auth';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { setUnauthorizedHandler } from '../api/apiClient';
import { lookupProfile, usersApi, type ProfileData, type UserProfile } from '../api/usersApi';
import { auth } from '../config/firebase';
import { errorCode, errorMessage } from '../utils/errorMessage';
import { roleStorage } from '../utils/roleStorage';
import { authService } from './authService';
import { isSilentAuthError } from './firebaseErrors';

/**
 * Estados de la sesión:
 * - loading:         esperando a que Firebase restaure la sesión guardada
 * - signedOut:       sin sesión
 * - registering:     cuenta de Firebase creada desde el formulario de registro; falta (o falló) guardar el perfil
 * - checkingProfile: con sesión, consultando GET /api/users/:uid
 * - needsProfile:    con sesión pero sin perfil en el backend (p. ej. primer login con Google)
 * - profileError:    no se pudo consultar el perfil (red, timeout, 5xx…)
 * - ready:           sesión y perfil completos
 */
export type AuthStatus =
  | 'loading'
  | 'signedOut'
  | 'registering'
  | 'checkingProfile'
  | 'needsProfile'
  | 'profileError'
  | 'ready';

/** El registro creó la cuenta de Firebase pero falló el POST del perfil: se puede reintentar solo ese paso. */
export class ProfileSaveError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProfileSaveError';
  }
}

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  profile: UserProfile | null;
  profileError: string | null;
  /** Aviso global para mostrar en el login (p. ej. sesión expirada). */
  notice: string | null;
  clearNotice: () => void;
  registerWithEmail: (email: string, password: string, data: ProfileData) => Promise<void>;
  completeProfile: (data: ProfileData) => Promise<void>;
  /** PUT /api/users/:uid con los campos cambiados; actualiza el perfil en memoria. */
  updateProfile: (changes: Partial<ProfileData>) => Promise<void>;
  retryProfileLookup: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Mientras el formulario de registro está creando la cuenta, no se consulta el perfil
  // (todavía no existe): el propio registro hará el POST.
  const registeringRef = useRef(false);
  // Evita que una consulta vieja pise el resultado de una más nueva.
  const lookupIdRef = useRef(0);

  const checkProfile = useCallback(async (uid: string) => {
    const lookupId = ++lookupIdRef.current;
    setStatus('checkingProfile');
    setProfileError(null);
    try {
      const result = await lookupProfile(uid);
      if (lookupId !== lookupIdRef.current) return;
      if (result.status === 'complete') {
        setProfile(result.profile);
        setStatus('ready');
      } else {
        setProfile(null);
        setStatus('needsProfile');
      }
    } catch (err) {
      if (lookupId !== lookupIdRef.current || !auth.currentUser) return;
      setProfileError(errorMessage(err));
      setStatus('profileError');
    }
  }, []);

  useEffect(() => {
    // Recoge errores de un login con Google por redirección (si lo hubo).
    authService.completeGoogleRedirect().catch((err) => {
      if (!isSilentAuthError(errorCode(err))) setNotice(errorMessage(err));
    });

    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        lookupIdRef.current++;
        setProfile(null);
        setStatus('signedOut');
        return;
      }
      if (registeringRef.current) {
        setStatus('registering');
        return;
      }
      void checkProfile(u.uid);
    });
  }, [checkProfile]);

  const logout = useCallback(async () => {
    if (auth.currentUser) roleStorage.clear(auth.currentUser.uid);
    registeringRef.current = false;
    await authService.logout();
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setNotice('Tu sesión expiró. Inicia sesión de nuevo.');
      void logout();
    });
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const completeProfile = useCallback(async (data: ProfileData) => {
    const saved = await usersApi.register(data);
    registeringRef.current = false;
    lookupIdRef.current++;
    // Si el backend no devuelve el perfil en la respuesta, se usa lo que se envió.
    setProfile(saved && typeof saved === 'object' && Object.keys(saved).length > 0 ? saved : { ...data });
    setStatus('ready');
  }, []);

  const updateProfile = useCallback(async (changes: Partial<ProfileData>) => {
    const uid = auth.currentUser?.uid;
    if (!uid) throw Object.assign(new Error('Sin sesión'), { code: 'auth/user-token-expired' });
    const saved = await usersApi.update(uid, changes);
    // Si el backend no devuelve el perfil completo, se mezclan los cambios con el perfil actual.
    setProfile((prev) => ({ ...prev, ...changes, ...(saved && typeof saved === 'object' ? saved : {}) }));
  }, []);

  const registerWithEmail = useCallback(
    async (email: string, password: string, data: ProfileData) => {
      if (!auth.currentUser) {
        registeringRef.current = true;
        try {
          await authService.registerWithEmail(email, password, `${data.nombre} ${data.apellido}`.trim());
        } catch (err) {
          registeringRef.current = false;
          throw err;
        }
      }
      try {
        await completeProfile(data);
      } catch (err) {
        throw new ProfileSaveError(errorMessage(err));
      }
    },
    [completeProfile],
  );

  const retryProfileLookup = useCallback(() => {
    if (auth.currentUser) void checkProfile(auth.currentUser.uid);
  }, [checkProfile]);

  const clearNotice = useCallback(() => setNotice(null), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      profile,
      profileError,
      notice,
      clearNotice,
      registerWithEmail,
      completeProfile,
      updateProfile,
      retryProfileLookup,
      logout,
    }),
    [
      status,
      user,
      profile,
      profileError,
      notice,
      clearNotice,
      registerWithEmail,
      completeProfile,
      updateProfile,
      retryProfileLookup,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
