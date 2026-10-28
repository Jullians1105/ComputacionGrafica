import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { authService, hasPasswordProvider } from '../auth/authService';
import { isWrongCurrentPassword, REAUTH_MESSAGES } from '../auth/firebaseErrors';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { PasswordField } from '../components/PasswordField';
import { Screen } from '../components/Screen';
import { Spinner } from '../components/Spinner';
import { TextField } from '../components/TextField';
import { TopBar } from '../components/TopBar';
import { useCooldown } from '../hooks/useCooldown';
import { useForm } from '../hooks/useForm';
import { errorCode, errorMessage } from '../utils/errorMessage';
import { validateChangeEmail, type ChangeEmailValues } from '../utils/validation';

const RESEND_COOLDOWN_S = 30;

/** En este contexto "correo ya en uso" se refiere al correo nuevo, no a un registro. */
const EMAIL_CHANGE_MESSAGES: Record<string, string> = {
  ...REAUTH_MESSAGES,
  'auth/email-already-in-use': 'Ese correo ya está en uso por otra cuenta.',
};

/** Seguridad de la cuenta → correo. Reautentica y envía la verificación con verifyBeforeUpdateEmail. */
export function ChangeEmailScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { values, errors, bind, validateNow } = useForm<ChangeEmailValues>({ current: '', email: '' }, (v) =>
    validateChangeEmail(v, user?.email ?? null),
  );
  const [sending, setSending] = useState(false);
  const [currentError, setCurrentError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resendFeedback, setResendFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const cooldown = useCooldown(RESEND_COOLDOWN_S);

  if (!hasPasswordProvider(user)) return <Navigate to="/perfil/editar" replace />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setCurrentError(null);
    if (!validateNow()) return;
    setSending(true);
    try {
      await authService.requestEmailChange(values.current, values.email);
      setSentTo(values.email.trim());
      setResendFeedback(null);
      cooldown.start();
    } catch (err) {
      const message = errorMessage(err, EMAIL_CHANGE_MESSAGES);
      if (isWrongCurrentPassword(errorCode(err))) setCurrentError(message);
      else setError(message);
    } finally {
      setSending(false);
    }
  };

  const onResend = async () => {
    if (!sentTo) return;
    setResendFeedback(null);
    setResending(true);
    try {
      await authService.resendEmailChange(sentTo);
      setResendFeedback({ ok: true, text: 'Enlace reenviado correctamente' });
    } catch (err) {
      setResendFeedback({ ok: false, text: errorMessage(err, EMAIL_CHANGE_MESSAGES) });
    } finally {
      setResending(false);
      cooldown.start();
    }
  };

  const currentField = bind('current');

  return (
    <>
      <TopBar title="Seguridad de la cuenta" backTo="/perfil/editar" />
      <Screen withTopBar className="pb-space-xl">
        <div className="flex flex-col gap-space-lg py-space-md">
          <div className="flex flex-col items-center gap-space-sm pt-space-xs text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-field-focus shadow-card">
              <Icon name="mail" className="text-[32px] text-air" />
            </span>
            <div className="mt-1 flex flex-col gap-1">
              <h2 className="text-headline-sm text-on-surface">Actualizar correo electrónico</h2>
              <p className="mx-auto max-w-[280px] text-body-md text-on-surface-variant">
                Te enviaremos un enlace de verificación al nuevo correo.
              </p>
            </div>
          </div>

          <form className="flex flex-col gap-space-md" onSubmit={onSubmit} noValidate>
            {error && <Alert>{error}</Alert>}
            <PasswordField
              label="Contraseña actual"
              icon="lock"
              autoComplete="current-password"
              placeholder="••••••••••••"
              hint="Por seguridad, confirma tu contraseña actual para continuar."
              disabled={sending}
              error={currentError ?? errors.current}
              {...currentField}
              onChange={(e) => {
                setCurrentError(null);
                currentField.onChange(e);
              }}
            />
            <TextField
              label="Nuevo correo electrónico"
              icon="alternate_email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="nuevo.correo@ejemplo.com"
              disabled={sending}
              error={errors.email}
              {...bind('email')}
            />
            <Button type="submit" loading={sending} loadingText="Enviando…" className="mt-space-xs">
              {sentTo ? 'Enviar de nuevo' : 'Enviar verificación'}
            </Button>
          </form>

          {sentTo && (
            <section role="status" className="flex flex-col gap-space-md rounded-card bg-card p-space-md shadow-card">
              <div className="flex items-start gap-space-sm">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-chip">
                  <Icon name="mark_email_read" className="text-[22px] text-air" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <h3 className="text-title-md text-on-surface">Verificación enviada</h3>
                  <p className="text-body-md text-on-surface-variant">
                    Revisa tu nuevo correo. El cambio se aplicará cuando confirmes el enlace. Después, inicia sesión
                    con tu nuevo correo.
                  </p>
                </div>
              </div>
              <div className="flex min-w-0 items-center gap-2 rounded-control bg-field-focus px-space-md py-2.5">
                <Icon name="forward_to_inbox" className="shrink-0 text-[18px] text-air" />
                <span className="truncate text-label-md text-on-surface">{sentTo}</span>
              </div>
              <div className="flex items-center justify-between pt-space-xs">
                <button
                  type="button"
                  onClick={onResend}
                  disabled={resending || cooldown.active}
                  className="flex items-center gap-1.5 py-2 text-label-md text-air hover:underline disabled:opacity-60 disabled:hover:no-underline"
                >
                  {resending ? <Spinner className="h-4 w-4" /> : <Icon name="replay" className="text-[18px]" />}
                  <span>{cooldown.active ? `Reenviar enlace (${cooldown.remaining} s)` : 'Reenviar enlace'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/perfil/editar', { replace: true })}
                  className="flex items-center gap-1 py-2 text-label-md text-on-surface-variant hover:text-on-surface"
                >
                  <span>Volver al perfil</span>
                  <Icon name="chevron_right" className="text-[16px]" />
                </button>
              </div>
              {resendFeedback && (
                <span className={`text-label-md ${resendFeedback.ok ? 'text-success' : 'text-wine'}`}>
                  {resendFeedback.text}
                </span>
              )}
            </section>
          )}
        </div>
      </Screen>
    </>
  );
}
