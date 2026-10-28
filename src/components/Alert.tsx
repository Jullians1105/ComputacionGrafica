import type { ReactNode } from 'react';
import { Icon } from './Icon';

type Tone = 'error' | 'info' | 'success';

interface AlertProps {
  tone?: Tone;
  children: ReactNode;
  action?: ReactNode;
  /** Muestra una ✕ para cerrar el aviso. */
  onDismiss?: () => void;
}

const STYLES: Record<Tone, { box: string; icon: string }> = {
  error: { box: 'bg-error-bg text-wine', icon: 'error' },
  info: { box: 'bg-chip text-navy', icon: 'info' },
  success: { box: 'bg-success-bg text-success-strong shadow-card', icon: 'check_circle' },
};

export function Alert({ tone = 'error', children, action, onDismiss }: AlertProps) {
  const style = STYLES[tone];
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-2 rounded-control px-3 py-2.5 ${style.box}`}
    >
      <Icon name={style.icon} filled className="mt-px text-[18px]" />
      <div className={`flex-1 text-body-sm ${tone === 'success' ? 'font-semibold' : 'font-medium'}`}>
        {children}
        {action && <div className="mt-1.5">{action}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Cerrar aviso"
          className="-my-1 -mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-black/5"
        >
          <Icon name="close" className="text-[18px]" />
        </button>
      )}
    </div>
  );
}
