import type { ReactNode } from 'react';

interface ScreenProps {
  children: ReactNode;
  /** Deja espacio para una <TopBar /> fija. */
  withTopBar?: boolean;
  className?: string;
}

/** Contenedor de pantalla: ancho de móvil centrado, márgenes y áreas seguras. */
export function Screen({ children, withTopBar = false, className = '' }: ScreenProps) {
  const top = withTopBar ? 'pt-[calc(4rem+env(safe-area-inset-top,0px))]' : 'pt-safe';
  return (
    <main className={`pb-safe mx-auto flex min-h-[100dvh] w-full max-w-app flex-col px-margin-mobile ${top} ${className}`}>
      {children}
    </main>
  );
}
