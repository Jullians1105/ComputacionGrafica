import { useRef, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../auth/authService';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { EmailIllustration } from '../components/EmailIllustration';
import { Icon } from '../components/Icon';
import { Screen } from '../components/Screen';
import { TextField } from '../components/TextField';
import { TopBar } from '../components/TopBar';
import { errorCode, errorMessage } from '../utils/errorMessage';
import { validateEmail } from '../utils/validation';

/** Errores con los que NO se envió nada y conviene decirlo (no revelan si el correo existe). */
const BLOCKING_CODES = new Set(['auth/network-request-failed', 'auth/too-many-requests']);

/**
 * Pide el enlace de restablecimiento. Siempre lleva a "Revisa tu correo" aunque el correo
 * no exista (no se revela qué correos están registrados), excepto con un correo inválido.
 */
export function ForgotPasswordScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  // returnTo: si se llegó desde el perfil ("¿La olvidaste?"), "Volver" regresa allí en vez de al login.
  const { email: initialEmail = '', returnTo } = (location.state as { email?: string; returnTo?: string } | null) ?? {};
  const [email, setEmail] = useState(initialEmail);
  const [invalid, setInvalid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const emailError = validateEmail(email);
    setInvalid(emailError);
    if (emailError) return;
    setSending(true);
    try {
      await authService.sendPasswordReset(email);
    } catch (err) {
      const code = errorCode(err);
      if (code === 'auth/invalid-email') {
        setInvalid('Ingresa un correo válido');
        setSending(false);
        return;
      }
      if (code && BLOCKING_CODES.has(code)) {
        setError(errorMessage(err));
        setSending(false);
        return;
      }
      // Cualquier otro error (incluido auth/user-not-found) se trata como éxito.
    }
    navigate('/recuperar/enviado', { replace: true, state: { email: email.trim(), returnTo } });
  };

  const clearField = () => {
    setEmail('');
    setInvalid(null);
    inputRef.current?.focus();
  };

  const heading = (
    <div className="mb-space-lg flex flex-col items-center px-space-sm text-center">
      <div className="my-space-md">
        <EmailIllustration variant={invalid ? 'error' : 'default'} />
      </div>
      <h2 className="mb-space-xs text-headline-md text-on-surface">¿Olvidaste tu contraseña?</h2>
      <p className="mx-auto max-w-xs text-body-md text-on-surface-variant">
        Ingresa tu correo y te enviaremos un enlace para restablecerla.
      </p>
    </div>
  );

  const form = (
    <form className="flex flex-col gap-space-md" onSubmit={onSubmit} noValidate>
      {error && <Alert>{error}</Alert>}
      <TextField
        ref={inputRef}
        label="Correo electrónico"
        icon="mail"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="ejemplo@correo.com"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (invalid) setInvalid(validateEmail(e.target.value) ? invalid : null);
        }}
        disabled={sending}
        error={invalid}
        trailing={
          invalid ? (
            <button
              type="button"
              onClick={clearField}
              aria-label="Borrar correo"
              className="flex h-10 w-10 items-center justify-center text-wine"
            >
              <Icon name="error" className="text-[22px]" />
            </button>
          ) : undefined
        }
      />
      <Button type="submit" trailingIcon="arrow_forward" loading={sending} loadingText="Enviando…" className="mt-space-sm">
        Enviar enlace
      </Button>
    </form>
  );

  return (
    <>
      <TopBar title="Recuperar contraseña" backTo={returnTo} />
      <Screen withTopBar className="pb-space-xl">
        <div className="pt-space-md">
          {invalid ? (
            // Variante de error (diseño "recuperar_contrase_a_error"): encabezado fuera de la tarjeta.
            <>
              {heading}
              <section className="rounded-card bg-card p-space-lg shadow-card">{form}</section>
            </>
          ) : (
            <section className="rounded-card bg-card p-space-lg shadow-raised">
              {heading}
              {form}
            </section>
          )}
        </div>
        <div className="mt-space-xl flex justify-center">
          <Link
            to={returnTo ?? '/login'}
            replace
            className="inline-flex items-center gap-2 rounded-control px-3 py-2 text-label-lg text-navy hover:bg-field"
          >
            <Icon name="arrow_back" className="text-[20px]" />
            {returnTo ? 'Volver' : 'Volver a iniciar sesión'}
          </Link>
        </div>
      </Screen>
    </>
  );
}
