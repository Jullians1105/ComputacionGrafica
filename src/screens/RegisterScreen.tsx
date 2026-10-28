import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ProfileSaveError, useAuth } from '../auth/AuthContext';
import { authService } from '../auth/authService';
import { isSilentAuthError } from '../auth/firebaseErrors';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { Divider } from '../components/Divider';
import { Icon } from '../components/Icon';
import { PasswordField } from '../components/PasswordField';
import { ProfileFields } from '../components/ProfileFields';
import { Screen } from '../components/Screen';
import { TextField } from '../components/TextField';
import { TopBar } from '../components/TopBar';
import { useForm } from '../hooks/useForm';
import { errorCode, errorMessage } from '../utils/errorMessage';
import { validateProfile, validateRegister, type RegisterFormValues } from '../utils/validation';

const EMPTY: RegisterFormValues = {
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  nacionalidad: '',
  password: '',
  confirm: '',
};

export function RegisterScreen() {
  const { status, registerWithEmail, logout } = useAuth();
  // 'registering' tras un fallo = la cuenta de Firebase ya existe; solo falta guardar el perfil.
  const accountCreated = status === 'registering';
  const { values, errors, bind, validateNow } = useForm<RegisterFormValues>(EMPTY, (v) =>
    accountCreated ? validateProfile(v) : validateRegister(v),
  );
  const [pending, setPending] = useState<'email' | 'google' | null>(null);
  const [error, setError] = useState<{ message: string; profileOnly: boolean } | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validateNow()) return;
    setPending('email');
    try {
      await registerWithEmail(values.email, values.password, {
        nombre: values.nombre.trim(),
        apellido: values.apellido.trim(),
        telefono: values.telefono.trim(),
        nacionalidad: values.nacionalidad,
      });
      // Éxito: la guardia lleva a Selección de rol.
    } catch (err) {
      setError(
        err instanceof ProfileSaveError
          ? { message: err.message, profileOnly: true }
          : { message: errorMessage(err), profileOnly: false },
      );
      setPending(null);
    }
  };

  const onGoogle = async () => {
    setError(null);
    setPending('google');
    try {
      await authService.loginWithGoogle();
      // Si es nuevo en el backend, la guardia lo lleva a Completar perfil.
    } catch (err) {
      if (!isSilentAuthError(errorCode(err))) setError({ message: errorMessage(err), profileOnly: false });
      setPending(null);
    }
  };

  const busy = !!pending;
  const credentialsLocked = busy || accountCreated;

  return (
    <>
      <TopBar
        title={
          <span className="inline-flex items-center gap-space-xs">
            <Icon name="flight_takeoff" className="text-[22px] text-wine" />
            Registro
          </span>
        }
        // Si la cuenta quedó a medias, salir cierra la sesión (al volver a entrar se pedirá completar el perfil).
        onBack={accountCreated ? () => void logout() : undefined}
      />
      <Screen withTopBar className="pb-8">
        <div className="pb-6 pt-4">
          <div className="mb-3">
            <Chip icon="flight_takeoff">Comunidad Lapticon</Chip>
          </div>
          <h1 className="mb-2 text-headline-md text-navy">Crear cuenta</h1>
          <p className="text-body-md text-on-surface-variant">Únete a la comunidad de envíos colaborativos de Lapticon.</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
          {error && (
            <Alert>
              {error.profileOnly ? (
                <>
                  Tu cuenta se creó, pero no pudimos guardar tus datos. {error.message} Revisa la información y toca
                  «Reintentar».
                </>
              ) : (
                error.message
              )}
            </Alert>
          )}

          <ProfileFields part="names" bind={bind} errors={errors} disabled={busy} />
          <TextField
            label="Correo electrónico"
            icon="mail"
            labelStyle="plain"
            tone="white"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="ejemplo@correo.com"
            disabled={credentialsLocked}
            error={errors.email}
            {...bind('email')}
          />
          <ProfileFields part="contact" bind={bind} errors={errors} disabled={busy} />
          {!accountCreated && (
            <>
              <PasswordField
                label="Contraseña"
                icon="lock"
                labelStyle="plain"
                tone="white"
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                disabled={credentialsLocked}
                error={errors.password}
                {...bind('password')}
              />
              <PasswordField
                label="Confirmar contraseña"
                icon="lock_reset"
                labelStyle="plain"
                tone="white"
                autoComplete="new-password"
                placeholder="Repite tu contraseña"
                disabled={credentialsLocked}
                error={errors.confirm}
                {...bind('confirm')}
              />
            </>
          )}

          <div className="pt-2">
            <Button
              type="submit"
              trailingIcon={accountCreated ? 'refresh' : 'arrow_forward'}
              loading={pending === 'email'}
              loadingText={accountCreated ? 'Guardando tus datos…' : 'Creando tu cuenta…'}
              disabled={busy}
            >
              {accountCreated ? 'Reintentar' : 'Crear cuenta'}
            </Button>
          </div>
        </form>

        {!accountCreated && (
          <>
            <div className="my-6">
              <Divider label="o regístrate con" />
            </div>
            <Button
              variant="google"
              tone="white"
              onClick={onGoogle}
              loading={pending === 'google'}
              loadingText="Conectando con Google…"
              disabled={busy}
            >
              Registrarse con Google
            </Button>
            <p className="mt-8 text-center text-body-md text-on-surface-variant">
              ¿Ya tienes cuenta?
              <Link to="/login" className="ml-1 text-label-lg text-navy hover:underline">
                Inicia sesión
              </Link>
            </p>
          </>
        )}
      </Screen>
    </>
  );
}
