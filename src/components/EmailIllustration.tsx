import { Icon } from './Icon';

type Variant = 'default' | 'error' | 'success';

/** Ilustración circular de las pantallas de recuperar contraseña. */
export function EmailIllustration({ variant }: { variant: Variant }) {
  if (variant === 'success') {
    return (
      <div className="relative mb-space-md flex h-20 w-20 items-center justify-center rounded-full bg-chip-strong shadow-card">
        <span className="absolute inset-0 animate-ping rounded-full bg-navy-soft opacity-10 motion-reduce:animate-none" />
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-field-focus">
          <Icon name="mark_email_read" filled className="text-[36px] text-air" />
        </span>
      </div>
    );
  }
  return (
    <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-chip shadow-card">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-chip-strong text-air">
        <Icon name="lock_reset" filled className="text-[34px]" />
      </span>
      {variant === 'error' ? (
        <span className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-wine text-white shadow-raised motion-safe:animate-bounce">
          <Icon name="priority_high" className="text-[18px]" />
        </span>
      ) : (
        <span className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-card shadow-raised">
          <Icon name="mail" filled className="text-[20px] text-wine" />
        </span>
      )}
    </div>
  );
}
