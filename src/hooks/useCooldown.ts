import { useCallback, useEffect, useState } from 'react';

/** Cuenta regresiva en segundos (p. ej. para no permitir "Reenviar enlace" seguido). */
export function useCooldown(seconds: number) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (remaining <= 0) return;
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining]);

  const start = useCallback(() => setRemaining(seconds), [seconds]);

  return { remaining, active: remaining > 0, start };
}
