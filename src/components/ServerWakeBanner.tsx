import { useSyncExternalStore } from 'react';
import { serverWake } from '../api/serverWake';
import { Spinner } from './Spinner';

/** Aviso global cuando el backend (Render gratis) tarda en despertar. */
export function ServerWakeBanner() {
  const slow = useSyncExternalStore(serverWake.subscribe, serverWake.isSlow);
  if (!slow) return null;
  return (
    <div role="status" aria-live="polite" className="pb-safe fixed inset-x-0 bottom-0 z-50 flex justify-center px-margin-mobile pb-4">
      <div className="flex max-w-app items-center gap-3 rounded-card bg-navy px-4 py-3 text-body-sm text-white shadow-raised">
        <Spinner className="h-4 w-4 shrink-0" />
        <span>Despertando el servidor… la primera conexión puede tardar hasta un minuto.</span>
      </div>
    </div>
  );
}
