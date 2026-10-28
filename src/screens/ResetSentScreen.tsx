import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../auth/authService';
import { Button } from '../components/Button';
import { EmailIllustration } from '../components/EmailIllustration';
import { Icon } from '../components/Icon';
import { Screen } from '../components/Screen';
import { Spinner } from '../components/Spinner';
import { TopBar } from '../components/TopBar';
import { useCooldown } from '../hooks/useCooldown';
import { errorCode, errorMessage } from '../utils/errorMessage';

const RESEND_COOLDOWN_S = 30;

export function ResetSentScreen() {
  const navigate = useNavigate();
  const { email, returnTo } = (useLocation().state as { email?: string; returnTo?: string } | null) ?? {};
  const [resending, setResending] = useState(false);
  const cooldown = useCooldown(RESEND_COOLDOWN_S);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const goBack = () => navigate(returnTo ?? '/login', { replace: true });

  const onResend = async () => {
    // Sin correo en memoria (p. ej. se recargó la página): se vuelve a pedir.
    if (!email) {
      navigate('/recuperar', { replace: true, state: { returnTo } });
      return;
    }
    setFeedback(null);
    setResending(true);
    try {
      await authService.sendPasswordReset(email);
      setFeedback({ ok: true, text: 'Enlace reenviado. Revisa tu bandeja de entrada.' });
    } catch (err) {
      const code = errorCode(err);
      // Igual que en el primer envío: solo se informan los fallos que no revelan si el correo existe.
      if (code === 'auth/network-request-failed' || code === 'auth/too-many-requests') {
        setFeedback({ ok: false, text: errorMessage(err) });
      } else {
        setFeedback({ ok: true, text: 'Enlace reenviado. Revisa tu bandeja de entrada.' });
      }
    } finally {
      setResending(false);
      cooldown.start();
    }
  };

  return (
    <>
      <TopBar title="Recuperar contraseña" backTo={returnTo} />
      <Screen withTopBar className="pb-space-lg">
        <div className="flex flex-col items-center px-space-xs pb-space-lg pt-space-md text-center">
          <EmailIllustration variant="success" />
          <h2 className="mb-space-xs text-headline-md text-on-surface">Revisa tu correo</h2>
          <p className="max-w-[320px] text-body-md text-on-surface-variant">
            Si el correo está registrado, recibirás un enlace para crear una nueva contraseña. Revisa también la carpeta
            de spam
          </p>
        </div>

        <div className="flex flex-col gap-space-md">
          <Button onClick={goBack}>{returnTo ? 'Volver' : 'Volver a iniciar sesión'}</Button>
          <div className="flex flex-col items-center pt-space-xs text-center">
            <span className="mb-space-xs text-body-sm text-on-surface-variant">¿No recibiste el correo?</span>
            <button
              type="button"
              onClick={onResend}
              disabled={resending || cooldown.active}
              className="flex items-center gap-space-xs rounded-lg px-space-sm py-space-xs text-label-lg text-on-surface transition-colors active:bg-field disabled:opacity-60"
            >
              {resending ? <Spinner className="h-4 w-4" /> : <Icon name="replay" className="text-[18px]" />}
              <span>{cooldown.active ? `Reenviar enlace (${cooldown.remaining} s)` : 'Reenviar enlace'}</span>
            </button>
            {feedback && (
              <span role="status" className={`mt-space-xs text-label-md ${feedback.ok ? 'text-success' : 'text-wine'}`}>
                {feedback.text}
              </span>
            )}
          </div>
        </div>
      </Screen>
    </>
  );
}
