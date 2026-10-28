const PRIMERO = 'Colombia';

/** Ordena alfabéticamente (en español), quita duplicados/vacíos y deja Colombia primero. */
export function ordenarPaises(paises: unknown): string[] {
  const lista = Array.isArray(paises)
    ? paises.filter((p): p is string => typeof p === 'string' && p.trim() !== '').map((p) => p.trim())
    : [];
  const unicos = [...new Set(lista)].sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
  return unicos.includes(PRIMERO) ? [PRIMERO, ...unicos.filter((p) => p !== PRIMERO)] : unicos;
}
