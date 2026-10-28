import { forwardRef, useState, type ComponentProps } from 'react';
import { Icon } from './Icon';
import { TextField } from './TextField';

type PasswordFieldProps = Omit<ComponentProps<typeof TextField>, 'type' | 'trailing'>;

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(function PasswordField(props, ref) {
  const [visible, setVisible] = useState(false);
  return (
    <TextField
      ref={ref}
      {...props}
      type={visible ? 'text' : 'password'}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:text-on-surface"
        >
          <Icon name={visible ? 'visibility_off' : 'visibility'} className="text-[20px]" />
        </button>
      }
    />
  );
});
