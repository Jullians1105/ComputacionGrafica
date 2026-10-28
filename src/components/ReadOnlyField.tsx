import type { ReactNode } from 'react';
import { Icon } from './Icon';
import { FieldLabel } from './TextField';

interface ReadOnlyFieldProps {
  label: string;
  value: string;
  /** Acción a la derecha de la etiqueta (p. ej. enlace "Cambiar correo"). */
  labelAction?: ReactNode;
}

/** Campo bloqueado: muestra un valor que no se edita aquí (fondo gris + candado). */
export function ReadOnlyField({ label, value, labelAction }: ReadOnlyFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel label={label} labelStyle="caps" action={labelAction} />
      <div className="flex h-field items-center justify-between rounded-control bg-readonly px-4 shadow-card">
        <span className="min-w-0 truncate text-body-md text-outline">{value}</span>
        <Icon name="lock" className="ml-2 shrink-0 text-[18px] text-outline" />
      </div>
    </div>
  );
}
