import type { ChangeEvent } from 'react';
import { usePaises } from '../hooks/usePaises';
import type { FormErrors, ProfileFormValues } from '../utils/validation';
import { SelectField } from './SelectField';
import { TextField, type FieldChrome } from './TextField';

type Bind = (field: keyof ProfileFormValues) => {
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
};

/**
 * 'register': estilo de "Crear cuenta" (etiquetas normales, inputs blancos, nombre y apellido en 2 columnas).
 * 'edit':     estilo de "Datos personales" (etiquetas en mayúsculas, inputs azulados, una columna).
 */
type Variant = 'register' | 'edit';

interface ProfileFieldsProps {
  bind: Bind;
  errors: FormErrors<ProfileFormValues>;
  disabled?: boolean;
  /** El teléfono va entre otros campos en Registro: se renderiza aparte con `part`. */
  part: 'names' | 'contact';
  variant?: Variant;
}

function chrome(variant: Variant): Pick<FieldChrome, 'labelStyle' | 'tone'> {
  return variant === 'edit' ? { labelStyle: 'caps', tone: 'tinted' } : { labelStyle: 'plain', tone: 'white' };
}

/** Campos del perfil del backend (nombre, apellido, teléfono, nacionalidad). */
export function ProfileFields({ bind, errors, disabled, part, variant = 'register' }: ProfileFieldsProps) {
  if (part === 'contact') return <ContactFields bind={bind} errors={errors} disabled={disabled} variant={variant} />;

  const isEdit = variant === 'edit';
  return (
    <div className={isEdit ? 'flex flex-col gap-space-md' : 'grid grid-cols-2 gap-gutter-mobile'}>
      <TextField
        label="Nombre"
        icon={isEdit ? undefined : 'person'}
        {...chrome(variant)}
        placeholder={isEdit ? 'Tu nombre' : 'Carlos'}
        autoComplete="given-name"
        disabled={disabled}
        error={errors.nombre}
        {...bind('nombre')}
      />
      <TextField
        label="Apellido"
        icon={isEdit ? undefined : 'badge'}
        {...chrome(variant)}
        placeholder={isEdit ? 'Tu apellido' : 'Rodríguez'}
        autoComplete="family-name"
        disabled={disabled}
        error={errors.apellido}
        {...bind('apellido')}
      />
    </div>
  );
}

function ContactFields({ bind, errors, disabled, variant = 'register' }: Omit<ProfileFieldsProps, 'part'>) {
  const { paises, loading, error, retry } = usePaises();
  const nacionalidad = bind('nacionalidad');
  // Si el valor guardado no está en la lista (p. ej. nombre con otra codificación), se conserva como opción.
  const options =
    nacionalidad.value && !paises.includes(nacionalidad.value) ? [nacionalidad.value, ...paises] : paises;
  return (
    <>
      <TextField
        label={variant === 'edit' ? 'Teléfono de contacto' : 'Teléfono móvil'}
        icon="call"
        {...chrome(variant)}
        type="tel"
        inputMode="tel"
        placeholder="+57 300 123 4567"
        autoComplete="tel"
        disabled={disabled}
        error={errors.telefono}
        {...bind('telefono')}
      />
      <div className="flex flex-col gap-1">
        <SelectField
          label="Nacionalidad"
          icon="public"
          {...chrome(variant)}
          placeholder={loading ? 'Cargando países…' : error ? 'No se pudo cargar la lista' : 'Selecciona tu país'}
          options={options}
          // Con un valor ya guardado el select sigue usable aunque la lista falle.
          disabled={disabled || (!nacionalidad.value && (loading || !!error))}
          error={errors.nacionalidad}
          {...nacionalidad}
        />
        {error && (
          <p className="flex flex-wrap items-center gap-x-2 pl-1 text-body-sm text-wine">
            {error}
            <button type="button" onClick={retry} className="font-semibold text-air underline-offset-2 hover:underline">
              Reintentar
            </button>
          </p>
        )}
      </div>
    </>
  );
}
