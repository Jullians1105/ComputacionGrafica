import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { Logo } from '../components/Logo';
import { Screen } from '../components/Screen';
import type { Rol } from '../utils/roleStorage';

const COPY: Record<Rol, { title: string; icon: string; text: string }> = {
  remitente: {
    title: 'Home del remitente',
    icon: 'inventory_2',
    text: 'Aquí podrás publicar tus encomiendas y encontrar viajeros que vayan a su destino.',
  },
  viajero: {
    title: 'Home del viajero',
    icon: 'flight',
    text: 'Aquí podrás registrar tus viajes y llevar paquetes en el espacio libre de tu maleta.',
  },
};

/** Placeholder de la fase 1: las funciones de cada rol llegan en la siguiente fase. */
export function HomePlaceholderScreen({ rol }: { rol: Rol }) {
  const { profile, user, logout } = useAuth();
  const navigate = useNavigate();
  const nombre = (typeof profile?.nombre === 'string' && profile.nombre) || user?.displayName?.split(' ')[0] || '';
  const copy = COPY[rol];

  return (
    <Screen className="py-6">
      <Logo className="mb-space-xl mt-space-sm" />
      <p className="text-body-lg text-on-surface-variant">Hola{nombre ? `, ${nombre}` : ''} 👋</p>
      <h1 className="mb-space-lg text-headline-md text-navy">{copy.title}</h1>

      <section className="flex flex-col items-center gap-3 rounded-card bg-card p-space-lg text-center shadow-card">
        <span className="flex h-14 w-14 items-center justify-center rounded-control bg-navy text-white">
          <Icon name={copy.icon} filled className="text-[26px]" />
        </span>
        <p className="text-body-md text-on-surface-variant">{copy.text}</p>
        <span className="rounded-full bg-chip px-3 py-1 text-label-caps uppercase text-navy">Próximamente</span>
      </section>

      <div className="mt-space-lg flex flex-col gap-space-md">
        {/* Acceso TEMPORAL para probar la fase "Editar perfil" hasta que exista el menú del Home. */}
        <Button variant="secondary" trailingIcon="chevron_right" onClick={() => navigate('/perfil/editar')}>
          Editar perfil
        </Button>
        <Button variant="outline" trailingIcon="sync_alt" onClick={() => navigate('/rol')}>
          Cambiar de rol
        </Button>
      </div>

      <div className="mt-auto pt-space-xl text-center">
        <button
          type="button"
          onClick={() => void logout()}
          className="px-3 py-2 text-body-sm text-muted underline-offset-2 hover:underline"
        >
          Cerrar sesión
        </button>
      </div>
    </Screen>
  );
}
