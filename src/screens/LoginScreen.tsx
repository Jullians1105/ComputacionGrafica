import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { authService } from '../auth/authService';
import { isSilentAuthError } from '../auth/firebaseErrors';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { Divider } from '../components/Divider';
import { Icon } from '../components/Icon';
import { Logo } from '../components/Logo';
import { PasswordField } from '../components/PasswordField';
import { Screen } from '../components/Screen';
import { TextField } from '../components/TextField';
import { useForm } from '../hooks/useForm';
import { errorCode, errorMessage } from '../utils/errorMessage';
import { validateLogin, type LoginFormValues } from '../utils/validation';

export function LoginScreen() {
  const { notice, clearNotice } = useAuth();
  const { values, errors, bind, validateNow } = useForm<LoginFormValues>({ email: '', password: '' }, validateLogin);
  const [pending, setPending] = useState<'email' | 'google' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    clearNotice();
    if (!validateNow()) return;
    setPending('email');
    try {
      await authService.loginWithEmail(values.email, values.password);
      // Las guardias de navegación llevan a la siguiente pantalla al cambiar la sesión.
    } catch (err) {
      setError(errorMessage(err));
      setPending(null);
    }
  };

  const onGoogle = async () => {
    setError(null);
    clearNotice();
    setPending('google');
    try {
      await authService.loginWithGoogle();
    } catch (err) {
      if (!isSilentAuthError(errorCode(err))) setError(errorMessage(err));
      setPending(null);
    }
  };

  return (
    <Screen className="justify-center py-6">
      <header className="mb-space-lg mt-space-sm flex flex-col items-center text-center">
        <Logo className="mb-space-sm" />
        <p className="max-w-[270px] text-body-md leading-snug text-on-surface-variant">
          Tu paquete viaja con quien ya va a su destino
        </p>
        <div className="mt-space-sm flex items-center gap-space-xs opacity-75" aria-hidden="true">
          <span className="h-1.5 w-1.5 rounded-full bg-navy-soft" />
          <span className="h-0.5 w-8 bg-divider" />
          <Icon name="flight" className="text-[18px] text-navy-soft" />
          <span className="h-0.5 w-8 bg-divider" />
          <span className="h-1.5 w-1.5 rounded-full bg-wine" />
        </div>
      </header>

      <section className="flex flex-col gap-space-md rounded-card bg-card p-space-lg shadow-raised">
        <div className="mb-space-xs flex flex-col">
          <h1 className="text-headline-sm tracking-tight text-on-surface">Bienvenido de nuevo</h1>
          <p className="mt-0.5 text-body-sm text-on-surface-variant">Ingresa tus credenciales para continuar</p>
        </div>

        {notice && <Alert tone="info">{notice}</Alert>}
        {error && <Alert>{error}</Alert>}

        <form className="flex flex-col gap-space-md" onSubmit={onSubmit} noValidate>
          <TextField
            label="Correo electrónico"
            icon="mail"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="ejemplo@correo.com"
            error={errors.email}
            disabled={!!pending}
            {...bind('email')}
          />
          <PasswordField
            label="Contraseña"
            icon="lock"
            autoComplete="current-password"
            placeholder="••••••••"
            error={errors.password}
            disabled={!!pending}
            {...bind('password')}
          />
          <div className="-mt-1 flex justify-end">
            <Link
              to="/recuperar"
              state={{ email: values.email }}
              className="py-1 text-label-lg text-wine hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <Button
            type="submit"
            trailingIcon="arrow_forward"
            loading={pending === 'email'}
            loadingText="Ingresando…"
            disabled={!!pending}
          >
            Iniciar sesión
          </Button>
        </form>

        <Divider label="o" />

        <Button variant="google" onClick={onGoogle} loading={pending === 'google'} loadingText="Conectando con Google…" disabled={!!pending}>
          Continuar con Google
        </Button>
      </section>

      <p className="mt-space-lg text-center text-body-lg text-on-surface">
        ¿No tienes cuenta?{' '}
        <Link to="/registro" className="ml-1 text-[17px] font-bold text-navy hover:underline">
          Regístrate
        </Link>
      </p>
    </Screen>
  );
}
