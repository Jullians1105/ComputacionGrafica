import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from './Icon';

interface TopBarProps {
  title: ReactNode;
  /** Ruta a la que vuelve la flecha (por defecto, el login). */
  backTo?: string;
  /** Acción propia para la flecha (p. ej. cerrar sesión); tiene prioridad sobre backTo. */
  onBack?: () => void;
  /** false oculta la flecha atrás (p. ej. Selección de rol). */
  showBack?: boolean;
  /** Acción a la derecha del título (botón de 44 px). */
  trailing?: ReactNode;
}

/** Barra superior fija: flecha atrás + título centrado + acción opcional a la derecha. */
export function TopBar({ title, backTo = '/login', onBack, showBack = true, trailing }: TopBarProps) {
  const navigate = useNavigate();
  return (
    <header className="pt-safe fixed inset-x-0 top-0 z-40 bg-surface/80 shadow-bar backdrop-blur-xl">
      <div className="mx-auto grid h-16 max-w-app grid-cols-[44px_1fr_44px] items-center px-margin-mobile">
        {showBack ? (
          <button
            type="button"
            onClick={onBack ?? (() => navigate(backTo, { replace: true }))}
            aria-label="Volver"
            className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full text-on-surface transition-colors hover:bg-field-focus"
          >
            <Icon name="arrow_back" className="text-[24px]" />
          </button>
        ) : (
          <span />
        )}
        <h1 className="truncate text-center text-title-md text-on-surface">{title}</h1>
        <div className="-mr-2 flex justify-end">{trailing}</div>
      </div>
    </header>
  );
}
