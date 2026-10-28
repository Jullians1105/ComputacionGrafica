import { useCallback, useEffect, useState } from 'react';
import { getPaises } from '../api/paisesApi';
import { errorMessage } from '../utils/errorMessage';

export function usePaises() {
  const [paises, setPaises] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    getPaises()
      .then((list) => active && setPaises(list))
      .catch((err) => active && setError(errorMessage(err)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { paises, loading, error, retry };
}
