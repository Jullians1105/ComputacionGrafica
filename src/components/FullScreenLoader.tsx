import { Logo } from './Logo';
import { Spinner } from './Spinner';

export function FullScreenLoader({ message = 'Cargando…' }: { message?: string }) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 bg-surface px-6 text-center" role="status">
      <Logo />
      <div className="flex items-center gap-2 text-body-md text-on-surface-variant">
        <Spinner className="h-4 w-4 text-navy" />
        {message}
      </div>
    </div>
  );
}
