import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { Icon } from '../components/Icon';
import { Screen } from '../components/Screen';
import { TopBar } from '../components/TopBar';
import { roleStorage, type Rol } from '../utils/roleStorage';

interface RoleOption {
  rol: Rol;
  badge: string;
  icon: string;
  title: string;
  description: string;
  features: { icon: string; text: string }[];
}

const OPTIONS: RoleOption[] = [
  {
    rol: 'remitente',
    badge: 'Remitente',
    icon: 'inventory_2',
    title: 'Quiero enviar un paquete',
    description: 'Aprovecha los viajes de otros usuarios para tus entregas transfronterizas.',
    features: [{ icon: 'local_shipping', text: 'Envíos rápidos a menor costo habitual' }],
  },
  {
    rol: 'viajero',
    badge: 'Viajero',
    icon: 'flight',
    title: 'Voy a viajar y llevar paquetes',
    description: 'Monetiza el espacio libre de tu maleta llevando paquetes inspeccionados.',
    features: [
      { icon: 'payments', text: 'Gana dinero en tu próximo vuelo' },
      { icon: 'luggage', text: 'Tú decides el tamaño y peso que transportas' },
    ],
  },
];

export function RoleSelectionScreen() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Rol>(() => (user && roleStorage.get(user.uid)) || 'remitente');

  const onContinue = () => {
    if (!user) return;
    roleStorage.set(user.uid, selected);
    navigate(`/home/${selected}`, { replace: true });
  };

  return (
    <>
      <TopBar
        showBack={false}
        title={
          <span className="inline-flex items-center gap-space-xs">
            <Icon name="flight_takeoff" className="text-[22px] text-wine" />
            Elige tu rol
          </span>
        }
        trailing={
          <button
            type="button"
            onClick={() => void logout()}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
            className="flex h-11 w-11 items-center justify-center rounded-full text-on-surface transition-colors hover:bg-field-focus"
          >
            <Icon name="logout" className="text-[22px]" />
          </button>
        }
      />
      <Screen withTopBar className="pb-6">
        <div className="mb-space-lg mt-space-md flex flex-col gap-3">
          <Chip icon="flight_takeoff">Bienvenido a Lapticon</Chip>
          <h1 className="text-headline-md text-[26px] leading-[34px] text-navy">¿Cómo quieres usar Lapticon?</h1>
          <p className="text-body-lg text-on-surface-variant">
            Elige cómo deseas comenzar tu experiencia hoy. Podrás acceder a ambas modalidades cuando lo necesites.
          </p>
        </div>

        <div role="radiogroup" aria-label="Rol en Lapticon" className="flex flex-col gap-space-md">
          {OPTIONS.map((o) => (
            <RoleCard key={o.rol} option={o} selected={selected === o.rol} onSelect={() => setSelected(o.rol)} />
          ))}
        </div>

        <div className="mt-space-lg flex flex-col gap-space-md">
          <Button trailingIcon="arrow_forward" onClick={onContinue}>
            Continuar
          </Button>
          <p className="flex items-center justify-center gap-2 text-center text-body-sm text-on-surface-variant">
            <Icon name="sync_alt" className="text-[18px]" />
            Podrás cambiarlo en cualquier momento desde tu perfil
          </p>
        </div>
      </Screen>
    </>
  );
}

function RoleCard({ option, selected, onSelect }: { option: RoleOption; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`relative block w-full overflow-hidden rounded-card bg-card p-space-md text-left transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-navy ${
        selected ? 'shadow-raised' : 'shadow-card'
      }`}
    >
      <span className="mb-3 flex items-center justify-between">
        <span className="rounded-full bg-chip px-3 py-1 text-label-caps uppercase text-navy">{option.badge}</span>
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-full ${selected ? 'bg-navy text-white' : 'bg-chip'}`}
          aria-hidden="true"
        >
          {selected && <Icon name="check" className="text-[18px]" />}
        </span>
      </span>
      <span className="flex gap-3">
        <span
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-control ${
            selected ? 'bg-navy text-white' : 'bg-field text-navy'
          }`}
        >
          <Icon name={option.icon} filled className="text-[26px]" />
        </span>
        <span className="flex flex-col">
          <span className="text-headline-sm text-[19px] text-on-surface">{option.title}</span>
          <span className="text-body-md text-on-surface-variant">{option.description}</span>
        </span>
      </span>
      <span className="mt-3 flex flex-col gap-1.5">
        {option.features.map((f) => (
          <span key={f.text} className="flex items-center gap-2 text-body-md text-on-surface">
            <Icon name={f.icon} className={`text-[18px] ${selected ? 'text-wine' : 'text-on-surface-variant'}`} />
            {f.text}
          </span>
        ))}
      </span>
      {selected && <span className="absolute inset-x-0 bottom-0 h-1 bg-wine" aria-hidden="true" />}
    </button>
  );
}
