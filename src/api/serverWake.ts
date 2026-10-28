/**
 * Detecta peticiones lentas (típico cuando Render está despertando) para que la UI
 * muestre un aviso global. Store mínimo compatible con useSyncExternalStore.
 */

const SLOW_AFTER_MS = 4_000;

let slowCount = 0;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export const serverWake = {
  /** Marca el inicio de una petición; devuelve la función que marca su fin. */
  begin(): () => void {
    let isSlow = false;
    const timer = setTimeout(() => {
      isSlow = true;
      slowCount++;
      emit();
    }, SLOW_AFTER_MS);
    return () => {
      clearTimeout(timer);
      if (isSlow) {
        slowCount--;
        emit();
      }
    };
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  isSlow: () => slowCount > 0,
};
