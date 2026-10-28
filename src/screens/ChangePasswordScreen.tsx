import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { authService, hasPasswordProvider } from '../auth/authService';
import { isWrongCurrentPassword, REAUTH_MESSAGES } from '../auth/firebaseErrors';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { PasswordField } from '../components/PasswordField';
import { Screen } from '../components/Screen';
import { TopBar } from '../components/TopBar';
import { useForm } from '../hooks/useForm';
import { errorCode, errorMessage } from '../utils/errorMessage';
import { validateChangePassword, type ChangePasswordValues } from '../utils/validation';

/** Seguridad de la cuenta → contraseña. Formulario, error y éxito son variantes de la misma pantalla. */
export function ChangePasswordScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { values, errors, bind, validateNow } = useForm<ChangePasswordValues>(
    { current: '', password: '', confirm: '' },
    validateChangePassword,
  );
  const [saving, setSaving] = useState(false);
  const [currentError, setCurrentError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Cuentas solo de Google: no tienen contraseña que cambiar.
  if (!hasPasswordProvider(user)) return <Navigate to="/perfil/editar" replace />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setCurrentError(null);
    if (!validateNow()) return;
    setSaving(true);
    try {
      await authService.changePassword(values.current, values.password);
      setDone(true);
    } catch (err) {
      const code = errorCode(err);
      if (isWrongCurrentPassword(code)) setCurrentError(errorMessage(err, REAUTH_MESSAGES));
      else setError(errorMessage(err, REAUTH_MESSAGES));
    } finally {
      setSaving(false);
    }
  };

  const currentField = bind('current');

  return (
    <>
      <TopBar title="Seguridad de la cuenta" backTo="/perfil/editar" />
      <Screen withTopBar className="pb-space-xl">
        <div className="flex flex-col gap-space-lg pt-space-md">
          <div className="flex flex-col items-center pt-space-xs text-center">
            <span className="mb-space-sm flex h-16 w-16 items-center justify-center rounded-full bg-chip shadow-card">
              <Icon name="shield_lock" className="text-[32px] text-navy" />
            </span>
            <h2 className="text-headline-sm text-on-surface">Actualiza tu contraseña</h2>
            <p className="mt-1 max-w-[320px] text-body-md text-on-surface-variant">
              Elige una clave única y segura para proteger tus operaciones y envíos internacionales en Lapticon.
            </p>
          </div>

          {done ? (
            <section
              role="status"
              className="flex flex-col items-center gap-space-md rounded-card bg-card p-space-lg text-center shadow-raised"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-field-focus">
                <Icon name="check_circle" filled className="text-[32px] text-navy" />
              </span>
              <div className="flex flex-col gap-1">
                <h3 className="text-headline-sm text-on-surface">Contraseña actualizada</h3>
                <p className="text-body-md text-on-surface-variant">
                  Tu contraseña ha sido modificada con éxito. Usa tu nueva clave en tu próximo inicio de sesión.
                </p>
              </div>
              <Button variant="secondary" onClick={() => navigate('/perfil/editar', { replace: true })}>
                <span className="inline-flex items-center gap-2">
                  <Icon name="person" className="text-[20px]" />
                  Volver al perfil
                </span>
              </Button>
            </section>
          ) : (
            <form
              onSubmit={onSubmit}
              noValidate
              className="flex flex-col gap-space-md rounded-card bg-card p-space-md shadow-card"
            >
              {error && <Alert>{error}</Alert>}
              <PasswordField
                label="Contraseña actual"
                icon="lock"
                autoComplete="current-password"
                disabled={saving}
                error={currentError ?? errors.current}
                labelAction={
                  <Link
                    to="/recuperar"
                    state={{ email: user?.email, returnTo: '/perfil/contrasena' }}
                    className="text-label-md text-wine hover:underline"
                  >
                    ¿La olvidaste?
                  </Link>
                }
                {...currentField}
                onChange={(e) => {
                  setCurrentError(null);
                  currentField.onChange(e);
                }}
              />
              <PasswordField
                label="Nueva contraseña"
                icon="lock_reset"
                autoComplete="new-password"
                placeholder="••••••••••••"
                hint="Mínimo 8 caracteres"
                disabled={saving}
                error={errors.password}
                {...bind('password')}
              />
              <PasswordField
                label="Confirmar nueva contraseña"
                icon="check_circle"
                autoComplete="new-password"
                placeholder="••••••••••••"
                disabled={saving}
                error={errors.confirm}
                {...bind('confirm')}
              />
              <div className="pt-space-xs">
                <Button type="submit" trailingIcon="arrow_forward" loading={saving} loadingText="Actualizando…">
                  Actualizar contraseña
                </Button>
              </div>
            </form>
          )}
        </div>
      </Screen>
    </>
  );
}
