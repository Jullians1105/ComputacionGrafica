import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { GoogleIcon } from './GoogleIcon';
import { Icon } from './Icon';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'secondary' | 'google' | 'outline';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  /** Texto mientras carga (por defecto, el mismo children). */
  loadingText?: string;
  trailingIcon?: string;
  /** Fondo del botón de Google: 'tinted' dentro de tarjeta blanca, 'white' sobre el fondo de pantalla. */
  tone?: 'tinted' | 'white';
  children: ReactNode;
}

const base =
  'flex w-full min-h-button items-center justify-center gap-2 rounded-control px-4 transition-all active:scale-[0.98] ' +
  'disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 ' +
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy';

const variants: Record<Variant, string> = {
  primary: 'bg-wine text-white text-[16px] font-bold shadow-cta hover:bg-wine-pressed active:bg-wine-pressed',
  secondary: 'bg-navy text-white text-label-lg shadow-card',
  google: 'text-navy text-[16px] font-semibold shadow-card',
  outline: 'border-[1.5px] border-navy text-navy text-label-lg hover:bg-field',
};

export function Button({
  variant = 'primary',
  loading = false,
  loadingText,
  trailingIcon,
  tone = 'tinted',
  disabled,
  children,
  className = '',
  type = 'button',
  ...rest
}: ButtonProps) {
  const toneClass =
    variant === 'google' ? (tone === 'white' ? 'bg-card hover:bg-field' : 'bg-field hover:bg-field-focus') : '';
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`${base} ${variants[variant]} ${toneClass} ${className}`}
      {...rest}
    >
      {loading ? (
        <>
          <Spinner />
          <span>{loadingText ?? children}</span>
        </>
      ) : (
        <>
          {variant === 'google' && <GoogleIcon />}
          <span>{children}</span>
          {trailingIcon && <Icon name={trailingIcon} className="text-[20px]" />}
        </>
      )}
    </button>
  );
}
