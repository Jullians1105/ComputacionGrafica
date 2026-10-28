import { useAuth } from '../auth/AuthContext';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { Logo } from '../components/Logo';
import { Screen } from '../components/Screen';

/** No se pudo consultar el perfil (sin red, timeout, 5xx…): se ofrece reintentar sin cerrar la sesión. */
export function ProfileErrorScreen() {
  const { profileError, retryProfileLookup, logout, user } = useAuth();
  return (
    <Screen className="justify-center gap-space-lg py-6">
      <Logo className="self-center" />
      <section className="flex flex-col gap-space-md rounded-card bg-card p-space-lg shadow-raised">
        <div>
          <h1 className="text-headline-sm text-on-surface">No pudimos cargar tu perfil</h1>
          {user?.email && <p className="mt-0.5 text-body-sm text-on-surface-variant">{user.email}</p>}
        </div>
        <Alert>{profileError ?? 'Ocurrió un error inesperado.'}</Alert>
        <Button trailingIcon="refresh" onClick={retryProfileLookup}>
          Reintentar
        </Button>
      </section>
      <div className="text-center">
        <button
          type="button"
          onClick={() => void logout()}
          className="px-3 py-2 text-body-sm text-muted underline-offset-2 hover:underline"
        >
          Cerrar sesión
        </button>
      </div>
    </Screen>
  );
}
