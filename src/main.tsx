import '@fontsource-variable/inter';
import './index.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

const root = createRoot(document.getElementById('root')!);

// App se importa de forma diferida para poder mostrar un mensaje claro si falta la configuración (.env).
import('./App')
  .then(({ default: App }) =>
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    ),
  )
  .catch((err: unknown) => {
    console.error(err);
    root.render(
      <div className="mx-auto flex min-h-[100dvh] max-w-app flex-col justify-center gap-3 px-6 text-center">
        <h1 className="text-headline-sm text-navy">No se pudo iniciar Lapticon</h1>
        <p className="text-body-md text-on-surface-variant">
          {err instanceof Error ? err.message : 'Error de configuración.'}
        </p>
      </div>,
    );
  });
