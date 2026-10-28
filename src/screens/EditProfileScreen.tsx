import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usersApi } from '../api/usersApi';
import { useAuth } from '../auth/AuthContext';
import { hasPasswordProvider } from '../auth/authService';
import { Alert } from '../components/Alert';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { ProfileFields } from '../components/ProfileFields';
import { ReadOnlyField } from '../components/ReadOnlyField';
import { Screen } from '../components/Screen';
import { Spinner } from '../components/Spinner';
import { TopBar } from '../components/TopBar';
import { useForm } from '../hooks/useForm';
import { errorMessage } from '../utils/errorMessage';
import { changedFields, profileToForm } from '../utils/profileDiff';
import { validateProfile, type ProfileFormValues } from '../utils/validation';

/** Datos personales: precarga con GET /api/users/:uid y guarda con PUT solo lo que cambió. */
export function EditProfileScreen() {
  const { user } = useAuth();
  const [loaded, setLoaded] = useState<ProfileFormValues | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!user) return;
    setLoadError(null);
    setLoaded(null);
    usersApi
      .get(user.uid)
      .then((profile) => setLoaded(profileToForm(profile)))
      .catch((err) => setLoadError(errorMessage(err)));
  }, [user]);

  useEffect(load, [load]);

  return (
    <>
      <TopBar title="Datos personales" backTo="/" />
      <Screen withTopBar className="pb-8">
        {loaded ? (
          <EditProfileForm initial={loaded} />
        ) : loadError ? (
          <div className="pt-space-lg">
            <Alert
              action={
                <button type="button" onClick={load} className="font-semibold text-air hover:underline">
                  Reintentar
                </button>
              }
            >
              No pudimos cargar tus datos. {loadError}
            </Alert>
          </div>
        ) : (
          <div role="status" className="flex flex-1 items-center justify-center gap-2 text-body-md text-on-surface-variant">
            <Spinner className="h-4 w-4 text-navy" />
            Cargando tus datos…
          </div>
        )}
      </Screen>
    </>
  );
}

function EditProfileForm({ initial }: { initial: ProfileFormValues }) {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [original, setOriginal] = useState(initial);
  const { values, setValues, errors, bind, validateNow } = useForm<ProfileFormValues>(initial, validateProfile);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changes = changedFields(original, values);
  const hasChanges = Object.keys(changes).length > 0;
  const canEditCredentials = hasPasswordProvider(user);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    if (!hasChanges || !validateNow()) return;
    setSaving(true);
    try {
      await updateProfile(changes);
      const next = { ...original, ...changes };
      setOriginal(next);
      setValues(next);
      setSaved(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-space-md pb-space-lg pt-space-sm">
      {saved && (
        <Alert tone="success" onDismiss={() => setSaved(false)}>
          Datos actualizados correctamente
        </Alert>
      )}

      <div className="flex flex-col items-center pb-space-sm pt-space-xs">
        <Avatar nombre={original.nombre} apellido={original.apellido} />
        <p className="mt-space-sm text-body-sm text-on-surface-variant">
          {`${original.nombre} ${original.apellido}`.trim() || user?.email}
        </p>
      </div>

      <form className="flex flex-col gap-space-md" onSubmit={onSubmit} noValidate>
        {error && <Alert>No pudimos guardar tus cambios. {error}</Alert>}
        <ProfileFields part="names" variant="edit" bind={bind} errors={errors} disabled={saving} />
        <ProfileFields part="contact" variant="edit" bind={bind} errors={errors} disabled={saving} />
        <ReadOnlyField
          label="Correo electrónico"
          value={user?.email ?? ''}
          labelAction={
            canEditCredentials ? (
              <Link to="/perfil/correo" className="text-label-md text-navy hover:underline">
                Cambiar correo
              </Link>
            ) : undefined
          }
        />
        <div className="pt-space-sm">
          <Button type="submit" loading={saving} loadingText="Guardando…" disabled={!hasChanges}>
            Guardar cambios
          </Button>
        </div>
      </form>

      {canEditCredentials && (
        <section className="mt-space-sm flex flex-col gap-space-xs">
          <h2 className="px-1 text-label-caps uppercase text-on-surface-variant">Seguridad</h2>
          <div className="overflow-hidden rounded-card bg-card shadow-card">
            <button
              type="button"
              onClick={() => navigate('/perfil/contrasena')}
              className="flex w-full items-center justify-between px-space-md py-4 text-left transition-colors hover:bg-field active:bg-field-focus"
            >
              <span className="flex min-w-0 items-center gap-space-md">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-field text-navy">
                  <Icon name="key" className="text-[20px]" />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-title-md text-on-surface">Cambiar contraseña</span>
                  <span className="text-body-sm text-on-surface-variant">Protege el acceso a tu cuenta</span>
                </span>
              </span>
              <Icon name="chevron_right" className="ml-2 shrink-0 text-[22px] text-on-surface-variant" />
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
