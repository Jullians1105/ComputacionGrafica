import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, type AuthStatus } from '../auth/AuthContext';
import { FullScreenLoader } from '../components/FullScreenLoader';
import { ProfileErrorScreen } from '../screens/ProfileErrorScreen';
import { roleStorage } from '../utils/roleStorage';

/** Pantalla que corresponde a cada estado de sesión cuando la ruta actual no está permitida. */
function useEntryPath(): string {
  const { status, user } = useAuth();
  switch (status) {
    case 'ready': {
      const rol = user ? roleStorage.get(user.uid) : null;
      // Con rol guardado (app reabierta) va directo a su home; recién logueado, a elegir rol.
      return rol ? `/home/${rol}` : '/rol';
    }
    case 'needsProfile':
    case 'registering':
      return '/completar-perfil';
    default:
      return '/login';
  }
}

/**
 * Guardia única: deja pasar si el estado de sesión está en `allow`;
 * si no, muestra carga/error o redirige a la pantalla que toca.
 */
export function Gate({ allow }: { allow: AuthStatus[] }) {
  const { status } = useAuth();
  const entry = useEntryPath();

  if (allow.includes(status)) return <Outlet />;
  if (status === 'loading') return <FullScreenLoader message="Cargando…" />;
  if (status === 'checkingProfile') return <FullScreenLoader message="Cargando tu perfil…" />;
  if (status === 'profileError') return <ProfileErrorScreen />;
  return <Navigate to={entry} replace />;
}

/** Ruta "/" y rutas desconocidas: lleva a donde corresponda según la sesión. */
export function EntryRedirect() {
  const { status } = useAuth();
  const entry = useEntryPath();
  if (status === 'loading') return <FullScreenLoader message="Cargando…" />;
  if (status === 'checkingProfile') return <FullScreenLoader message="Cargando tu perfil…" />;
  if (status === 'profileError') return <ProfileErrorScreen />;
  return <Navigate to={entry} replace />;
}
