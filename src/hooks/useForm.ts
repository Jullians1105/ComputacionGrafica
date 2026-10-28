import { useCallback, useState, type ChangeEvent } from 'react';
import { hasErrors, type FormErrors } from '../utils/validation';

/**
 * Estado mínimo de formulario: los errores aparecen tras el primer intento de envío
 * y desde ahí se actualizan en vivo mientras el usuario corrige.
 */
export function useForm<T extends object>(initial: T, validate: (values: T) => FormErrors<T>) {
  const [values, setValues] = useState<T>(initial);
  const [attempted, setAttempted] = useState(false);

  const errors: FormErrors<T> = attempted ? validate(values) : {};

  const bind = useCallback(
    (field: keyof T) => ({
      name: String(field),
      value: values[field] as string,
      onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setValues((v) => ({ ...v, [field]: e.target.value })),
    }),
    [values],
  );

  /** Marca el intento y devuelve true si el formulario es válido. */
  const validateNow = useCallback(() => {
    setAttempted(true);
    return !hasErrors(validate(values));
  }, [validate, values]);

  return { values, setValues, errors, bind, validateNow };
}
