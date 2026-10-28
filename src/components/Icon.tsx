interface IconProps {
  name: string;
  className?: string;
  filled?: boolean;
}

/** Ícono de Material Symbols Outlined. La fuente se carga en index.html solo con los íconos usados (icon_names). */
export function Icon({ name, className = '', filled = false }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={`material-symbols-outlined select-none leading-none ${filled ? 'icon-filled' : ''} ${className}`}
    >
      {name}
    </span>
  );
}
