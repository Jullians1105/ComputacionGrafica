/** Iniciales de "Nombre Apellido" (máx. 2 letras). */
export function initials(nombre = '', apellido = ''): string {
  const letters = [nombre, apellido]
    .map((p) => p.trim().charAt(0))
    .filter(Boolean)
    .join('');
  return letters.toUpperCase() || '?';
}

/** Avatar circular con iniciales (no hay foto de perfil en esta fase). */
export function Avatar({ nombre, apellido }: { nombre?: string; apellido?: string }) {
  return (
    <span
      aria-hidden="true"
      className="flex h-24 w-24 items-center justify-center rounded-full bg-navy text-headline-lg tracking-wider text-white shadow-raised"
    >
      {initials(nombre, apellido)}
    </span>
  );
}
