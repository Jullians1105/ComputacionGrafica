import { Icon } from './Icon';

/**
 * Logo de Lapticon. PLACEHOLDER: ícono de avión + texto.
 * Cuando exista el archivo oficial, reemplázalo solo aquí (p. ej. <img src="/logo.svg" alt="Lapticon" />).
 */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`} role="img" aria-label="Lapticon">
      <span className="flex h-10 w-10 items-center justify-center rounded-control bg-navy shadow-card">
        <Icon name="flight_takeoff" filled className="text-[22px] text-white" />
      </span>
      <span className="text-headline-sm font-bold tracking-tight text-navy">
        Lapticon<span className="text-wine">.</span>
      </span>
    </div>
  );
}
