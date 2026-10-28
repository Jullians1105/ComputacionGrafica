/** Cache local del rol elegido (por usuario). localStorage puede fallar en modo privado: nunca rompe la app. */

export type Rol = 'remitente' | 'viajero';

const key = (uid: string) => `lapticon:rol:${uid}`;

export const roleStorage = {
  get(uid: string): Rol | null {
    try {
      const value = localStorage.getItem(key(uid));
      return value === 'remitente' || value === 'viajero' ? value : null;
    } catch {
      return null;
    }
  },
  set(uid: string, rol: Rol) {
    try {
      localStorage.setItem(key(uid), rol);
    } catch {
      /* sin almacenamiento disponible: el rol se pedirá de nuevo */
    }
  },
  clear(uid: string) {
    try {
      localStorage.removeItem(key(uid));
    } catch {
      /* ignorar */
    }
  },
};
