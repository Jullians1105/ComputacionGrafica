# Lapticon · Fase 1 (Login y Registro)

PWA en React + Vite + TypeScript con Firebase Auth y el backend de Lapticon en Render.

## Correr el proyecto

```bash
npm install
cp .env.example .env      # llena las variables VITE_FIREBASE_* (Firebase Console → App web)
npm run dev               # http://localhost:5173
```

Otros scripts: `npm test` (validaciones), `npm run build` y `npm run preview` (build de producción con service worker).

### Requisitos en Firebase Console

- Authentication → Sign-in method: habilitar **Correo/contraseña** y **Google**.
- Authentication → Settings → Authorized domains: debe incluir `localhost` (y el dominio donde se publique).

### Backend y CORS

El backend solo acepta por CORS los orígenes de su lista blanca, así que la app nunca lo llama
directo: pide `/api/...` a su mismo dominio y este lo reenvía a `https://lapticon-backend.onrender.com`.
En desarrollo lo hace el proxy de Vite; en producción, `vercel.json` o `public/_redirects` (Netlify).

## Desplegar

**Vercel:** New Project → importar el repo (detecta Vite; usa `vercel.json`).
**Netlify:** Add new site → importar el repo (usa `netlify.toml` y `public/_redirects`).

En ambos:
1. Variables de entorno: las 6 `VITE_FIREBASE_*` de `.env.example` con los valores de tu `.env`.
2. Firebase Console → Authentication → Settings → Dominios autorizados: agrega el dominio asignado
   (p. ej. `lapticon.vercel.app` o `lapticon.netlify.app`).
3. Si cambias variables después del primer despliegue, vuelve a desplegar (Vite las incrusta al construir).

## Estructura

```
src/
  theme/tokens.ts      tokens del design system (los consume tailwind.config.ts)
  config/firebase.ts   inicialización de Firebase desde .env
  api/                 apiClient (token, timeout 60 s, errores), usersApi, paisesApi, aviso de servidor lento
  auth/                authService, AuthContext (estado de sesión), traducción de errores de Firebase
  components/          UI reutilizable (Logo es el placeholder del logo)
  screens/             pantallas
  router/              rutas y guardias de sesión
  utils/               validaciones, países, cache del rol
```

Supuesto pendiente de verificar: qué responde `GET /api/users/:uid` a un usuario sin perfil.
Está aislado en `lookupProfile()` (`src/api/usersApi.ts`).
