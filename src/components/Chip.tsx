import { Icon } from './Icon';

/** Chip de encabezado ("Comunidad Lapticon", "Bienvenido a Lapticon"). */
export function Chip({ icon, children }: { icon: string; children: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-chip px-3 py-1">
      <Icon name={icon} filled className="text-[16px] text-wine" />
      <span className="text-label-caps uppercase text-on-surface">{children}</span>
    </span>
  );
}
