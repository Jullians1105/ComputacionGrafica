import { useState, type FormEvent } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { Icon } from '../components/Icon';
import { ProfileFields } from '../components/ProfileFields';
import { Screen } from '../components/Screen';
import { TopBar } from '../components/TopBar';
import { useForm } from '../hooks/useForm';
import { errorMessage } from '../utils/errorMessage';
import { validateProfile, type ProfileFormValues } from '../utils/validation';

/** Divide "Nombre Apellido(s)" de Google en nombre + apellido para precargar el formulario. */
function splitDisplayName(displayName: string | null | undefined) {
  const parts = (displayName ?? '').trim().split(/\s+/).filter(Boolean);
  return { nombre: parts[0] ?? '', apellido: parts.slice(1).join(' ') };
}

/** Para usuarios con sesión de Firebase pero sin perfil en el backend (p. ej. primer ingreso con Google). */
export function CompleteProfileScreen() {
  const { user, completeProfile, logout } = useAuth();
  const { values, errors, bind, validateNow } = useForm<ProfileFormValues>(
    { ...splitDisplayName(user?.displayName), telefono: '', nacionalidad: '' },
    validateProfile,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validateNow()) return;
    setSaving(true);
    try {
      await completeProfile({
        nombre: values.nombre.trim(),
        apellido: values.apellido.trim(),
        telefono: values.telefono.trim(),
        nacionalidad: values.nacionalidad,
      });
    } catch (err) {
      setError(errorMessage(err));
      setSaving(false);
    }
  };

  return (
    <>
      <TopBar
        title={
          <span className="inline-flex items-center gap-space-xs">
            <Icon name="flight_takeoff" className="text-[22px] text-wine" />
            Registro
          </span>
        }
        onBack={() => void logout()}
      />
      <Screen withTopBar className="pb-8">
        <div className="pb-6 pt-4">
          <div className="mb-3">
            <Chip icon="flight_takeoff">Comunidad Lapticon</Chip>
          </div>
          <h1 className="mb-2 text-headline-md text-navy">Completa tu perfil</h1>
          <p className="text-body-md text-on-surface-variant">
            Solo faltan algunos datos para terminar de crear tu cuenta en Lapticon.
          </p>
          {user?.email && (
            <p className="mt-3 flex items-center gap-1.5 text-body-sm text-on-surface-variant">
              <Icon name="mail" className="text-[16px]" />
              {user.email}
            </p>
          )}
        </div>

        <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
          {error && (
            <Alert>
              No pudimos guardar tus datos. {error} Toca «Reintentar».
            </Alert>
          )}
          <ProfileFields part="names" bind={bind} errors={errors} disabled={saving} />
          <ProfileFields part="contact" bind={bind} errors={errors} disabled={saving} />
          <div className="pt-2">
            <Button
              type="submit"
              trailingIcon={error ? 'refresh' : 'arrow_forward'}
              loading={saving}
              loadingText="Guardando tus datos…"
            >
              {error ? 'Reintentar' : 'Guardar y continuar'}
            </Button>
          </div>
        </form>

        <p className="mt-8 text-center text-body-md text-on-surface-variant">
          ¿No eres tú?
          <button type="button" onClick={() => void logout()} className="ml-1 text-label-lg text-navy hover:underline">
            Cerrar sesión
          </button>
        </p>
      </Screen>
    </>
  );
}
