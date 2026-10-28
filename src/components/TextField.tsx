import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { Icon } from './Icon';

export interface FieldChrome {
  label: string;
  /** Ícono a la izquierda (opcional: Editar perfil no lo usa en nombre/apellido). */
  icon?: string;
  error?: string | null;
  /** Pista bajo el campo (p. ej. "Mínimo 8 caracteres"); el error la reemplaza. */
  hint?: string;
  /** Acción a la derecha de la etiqueta (p. ej. "¿La olvidaste?"). */
  labelAction?: ReactNode;
  /** 'caps': etiqueta en mayúsculas (login/recuperar/perfil). 'plain': etiqueta normal (registro). */
  labelStyle?: 'caps' | 'plain';
  /** 'tinted': input azulado. 'white': input blanco sobre el fondo de pantalla. */
  tone?: 'tinted' | 'white';
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement>, FieldChrome {
  trailing?: ReactNode;
}

export function fieldBoxClass(tone: 'tinted' | 'white', hasError: boolean) {
  if (hasError) return 'bg-error-bg ring-1 ring-wine/30';
  return tone === 'white'
    ? 'bg-card shadow-card focus-within:bg-field focus-within:ring-2 focus-within:ring-navy'
    : 'bg-field focus-within:bg-field-focus focus-within:ring-2 focus-within:ring-navy';
}

export function FieldLabel({
  htmlFor,
  label,
  labelStyle,
  action,
}: {
  htmlFor?: string;
  label: string;
  labelStyle: 'caps' | 'plain';
  action?: ReactNode;
}) {
  const text = (
    <label
      htmlFor={htmlFor}
      className={labelStyle === 'caps' ? 'text-label-caps uppercase text-on-surface' : 'pl-1 text-label-md text-navy'}
    >
      {label}
    </label>
  );
  if (!action) return text;
  return (
    <div className="flex items-center justify-between gap-2">
      {text}
      {action}
    </div>
  );
}

export function FieldError({ id, error }: { id: string; error?: string | null }) {
  if (!error) return null;
  return (
    <p id={id} role="alert" className="flex items-center gap-1.5 pl-1 pt-0.5 text-label-md text-wine">
      <Icon name="error" filled className="text-[16px]" />
      {error}
    </p>
  );
}

export function FieldHint({ id, hint }: { id: string; hint?: string }) {
  if (!hint) return null;
  return (
    <p id={id} className="flex items-center gap-1.5 pl-1 pt-0.5 text-label-md text-on-surface-variant">
      <Icon name="info" className="text-[16px]" />
      {hint}
    </p>
  );
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, icon, error, hint, labelAction, labelStyle = 'caps', tone = 'tinted', trailing, id, className = '', ...inputProps },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <FieldLabel htmlFor={inputId} label={label} labelStyle={labelStyle} action={labelAction} />
      <div className={`relative flex items-center rounded-control transition-colors ${fieldBoxClass(tone, !!error)}`}>
        {icon && (
          <Icon
            name={icon}
            className={`pointer-events-none absolute left-3.5 text-[20px] ${error ? 'text-wine' : 'text-on-surface-variant'}`}
          />
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={`h-field w-full min-w-0 rounded-control bg-transparent text-body-md text-on-surface placeholder:text-muted focus:outline-none disabled:opacity-60 ${icon ? 'pl-11' : 'pl-4'} ${trailing ? 'pr-12' : 'pr-4'}`}
          {...inputProps}
        />
        {trailing && <div className="absolute right-2 flex items-center">{trailing}</div>}
      </div>
      {error ? <FieldError id={errorId} error={error} /> : <FieldHint id={hintId} hint={hint} />}
    </div>
  );
});
