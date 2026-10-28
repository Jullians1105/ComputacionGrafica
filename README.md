# Lapticon: explicación del código

Este documento recorre el proyecto: dónde está cada cosa y qué hace. Son unas 3.300 líneas en `src/`.

---

## 1. Cómo arranca la app

Esta es la secuencia al abrir la página:

```
index.html  →  src/main.tsx  →  src/App.tsx  →  AuthProvider + AppRouter
```

| Archivo | Qué hace |
|---|---|
| `index.html` | Página base. Carga la fuente de íconos de Google (`icon_names=…`). Cada ícono nuevo se agrega ahí, en orden alfabético. |
| `src/main.tsx` | Carga la fuente Inter y los estilos. Importa `App` "en diferido": si falta el `.env`, la pantalla dice "No se pudo iniciar Lapticon" en lugar de quedar en blanco. |
| `src/App.tsx` | Envuelve todo en `AuthProvider` (estado de sesión) y monta el router y el aviso de "servidor despertando". |
| `src/index.css` | Directivas de Tailwind y unos pocos estilos globales. |

---

## 2. Configuración (raíz del proyecto)

| Archivo | Para qué |
|---|---|
| `package.json` | Dependencias y scripts: `dev`, `build`, `preview`, `test`. |
| `.env.example` | Nombres de las 6 variables `VITE_FIREBASE_*`. Tu `.env` real tiene los valores y **no se sube** a GitHub. |
| `.gitignore` | Excluye `.env`, `node_modules`, `dist`, `design/`, `docs/` y `CLAUDE.md`. |
| `vite.config.ts` | Configura tres cosas: el plugin de React, la PWA (manifest y service worker con Workbox) y el **proxy `/api` → Render** para desarrollo. |
| `tailwind.config.ts` | Toma los colores, tamaños y radios de `src/theme/tokens.ts`. |
| `postcss.config.js` | Lo necesita Tailwind. |
| `tsconfig.json` | Configuración de TypeScript. |
| `vercel.json` | Para producción en Vercel: reenvía `/api/*` a Render y todo lo demás a `index.html`. |
| `netlify.toml` y `public/_redirects` | Lo mismo para Netlify. |
| `public/icon.svg` y los PNG | Íconos de la PWA. |

**¿Por qué el proxy?** El backend de Render solo acepta peticiones (CORS) de ciertos dominios y `localhost` no está entre ellos. Por eso la app nunca llama a Render directamente: pide `/api/...` a su propio dominio, y Vite (en desarrollo) o Vercel/Netlify (en producción) reenvían la petición.

---

## 3. `src/` carpeta por carpeta

### `theme/tokens.ts`: el diseño

Contiene la paleta (navy `#0B1240`, vino `#A50012`, azul `air`, fondos, bordes, verde de éxito…), los tamaños de letra, los radios (12 px en los controles y 16 px en las tarjetas), los espaciados y las sombras. Salen del design system de Stitch. **Si quieres cambiar un color en toda la app, se cambia aquí.**

### `config/firebase.ts`: conexión con Firebase

- Lee las variables `VITE_FIREBASE_*` del `.env` y lanza un error claro si falta alguna.
- Crea `auth`, configurado para que los correos de Firebase lleguen en español.

### `api/`: comunicación con el backend

| Archivo | Qué hace |
|---|---|
| `apiClient.ts` | **El corazón de las llamadas HTTP.** Ver el detalle debajo de la tabla. |
| `usersApi.ts` | Contiene `register` (POST `/api/users/register`), `get` (GET `/api/users/:uid`) y `update` (PUT). También `lookupProfile()`, que decide si el usuario ya tiene perfil ("complete") o le falta ("missing"). |
| `paisesApi.ts` | GET `/api/ciudades/paises`. Guarda la lista en memoria para no pedirla dos veces. |
| `serverWake.ts` | Detecta cuándo una petición tarda más de 4 s. Con eso se muestra el aviso "El servidor está despertando" (Render gratis tarda 30-60 s). |

Lo que hace `apiClient.ts` en cada petición:

- Agrega `Authorization: Bearer <token>` usando `getIdToken()`.
- Corta la petición a los 60 s.
- Convierte los errores en `ApiError`, con mensajes en español para 401, 403, 400, sin red y timeout.
- Reintenta una vez ante 502/503/504 (Render despertando).
- Ante un 401, reintenta una vez con un token renovado.

### `auth/`: sesión del usuario

| Archivo | Qué hace |
|---|---|
| `authService.ts` | Funciones sueltas que hablan con Firebase: login, registro, Google (popup, y redirección si el navegador bloquea el popup), recuperar contraseña, cerrar sesión, `changePassword` (confirma la contraseña actual y luego la cambia), `requestEmailChange` (envía un enlace de verificación al correo nuevo) y `hasPasswordProvider` (indica si la cuenta tiene contraseña o solo Google). |
| `AuthContext.tsx` | **El estado global de la sesión.** Ver el detalle debajo de la tabla. |
| `firebaseErrors.ts` | Traduce los códigos de Firebase (`auth/wrong-password`, `auth/too-many-requests`…) a mensajes en español. |

`AuthContext.tsx` escucha a Firebase con `onAuthStateChanged` y lleva un `status` con uno de estos valores:

```
loading          → todavía no se sabe si hay sesión
signedOut        → no hay sesión
registering      → acaba de crear la cuenta y está guardando el perfil
checkingProfile  → consultando al backend si tiene perfil
needsProfile     → tiene cuenta, pero no perfil (p. ej. entró con Google por 1.ª vez)
profileError     → falló la consulta del perfil (sin red, servidor caído)
ready            → sesión y perfil listos
```

También expone a las pantallas `user`, `profile`, `completeProfile`, `updateProfile`, `logout` y `registerWithEmail`, entre otras.

### `router/`: navegación

- **`AppRouter.tsx`** es la lista de rutas.
- **`guards.tsx`** contiene las dos guardias:
  - `Gate` deja entrar a una ruta solo si el `status` está permitido. Si no, muestra una pantalla de carga o de error, o redirige a donde corresponde.
  - `EntryRedirect` atiende `/` y las rutas desconocidas: te manda a `/login`, `/completar-perfil`, `/rol` o tu home, según la sesión. Si ya habías elegido un rol, entra directo a tu home.

```
Sin sesión          → /login ⇄ /registro       /recuperar → /recuperar/enviado
Cuenta sin perfil   → /completar-perfil
Sesión completa     → /rol → /home/remitente | /home/viajero
                      /perfil/editar → /perfil/contrasena | /perfil/correo
```

### `screens/`: las pantallas (una por archivo)

| Pantalla | Ruta | Qué hace |
|---|---|---|
| `LoginScreen` | `/login` | Inicio de sesión con correo y contraseña o con Google. |
| `RegisterScreen` | `/registro` | Crea la cuenta en Firebase y luego el perfil en el backend. Si falla el backend, permite reintentar sin crear otra cuenta. |
| `CompleteProfileScreen` | `/completar-perfil` | Formulario de nombre, apellido, teléfono y nacionalidad para quien no tiene perfil. |
| `ForgotPasswordScreen` | `/recuperar` | Pide el correo y envía el enlace. No revela si el correo existe. |
| `ResetSentScreen` | `/recuperar/enviado` | "Revisa tu correo", con un botón para reenviar que espera 30 s entre intentos. |
| `RoleSelectionScreen` | `/rol` | Elegir entre Remitente y Viajero. |
| `HomePlaceholderScreen` | `/home/...` | Home **temporal**, con los botones "Editar perfil" y "Cambiar de rol". |
| `EditProfileScreen` | `/perfil/editar` | Edita los datos (PUT solo con los campos que cambiaron) y tiene los enlaces a seguridad. |
| `ChangePasswordScreen` | `/perfil/contrasena` | Pide la contraseña actual, la nueva y su confirmación. |
| `ChangeEmailScreen` | `/perfil/correo` | Pide la contraseña actual y el correo nuevo, y envía un enlace de verificación. |
| `ProfileErrorScreen` | (sin ruta) | Aparece cuando no se pudo cargar el perfil y ofrece "Reintentar". |

### `components/`: piezas de interfaz reutilizables

- **Formularios:**
  - `TextField`, `PasswordField` (con el ojo para mostrar u ocultar) y `SelectField`.
  - `ProfileFields`, los campos del perfil que comparten Registro, Completar perfil y Editar perfil.
  - `ReadOnlyField`.
- **Botones y estados:**
  - `Button`, en variantes primario, secundario, Google y outline, con su estado de carga.
  - `Spinner` y `FullScreenLoader`.
  - `Alert`, con tonos de error, información y éxito.
  - `ServerWakeBanner`.
- **Estructura:**
  - `Screen` (el contenedor de cada pantalla) y `TopBar` (la barra superior con flecha atrás).
  - `Divider` y `Chip`.
- **Gráficos:**
  - `Logo` es **provisional**; reemplázalo por el logo real.
  - `GoogleIcon`, `Icon` (los íconos de Material), `Avatar` (las iniciales del usuario) y `EmailIllustration`.

### `hooks/`: lógica reutilizable

- `useForm` maneja los valores del formulario, los errores por campo y la validación.
- `usePaises` carga la lista de países, con sus estados de carga y error.
- `useCooldown` lleva la cuenta regresiva de "Reenviar en 30 s".

### `utils/`: funciones de apoyo

| Archivo | Qué hace |
|---|---|
| `validation.ts` | Reglas de cada formulario: correo válido, contraseña de 8 caracteres o más, que la confirmación coincida, teléfono, etc. |
| `paises.ts` | Ordena la lista de países con Colombia primero. |
| `profileDiff.ts` | Compara el perfil original con el editado para enviar solo lo que cambió. |
| `roleStorage.ts` | Guarda en el navegador el rol elegido por cada usuario (`lapticon:rol:<uid>`). |
| `errorMessage.ts` | Convierte cualquier error en un mensaje amigable en español. |
| `*.test.ts` | Las 15 pruebas, que corren con `npm test`. |

---

## 4. Ejemplo completo: registro con correo

1. `RegisterScreen` valida el formulario (`utils/validation.ts`).
2. Llama a `registerWithEmail` del `AuthContext`, que pone el estado en `registering`.
3. `authService` crea la cuenta en **Firebase**.
4. `usersApi.register` envía POST `/api/users/register`. `apiClient` agrega el token y lo envía a `/api`, y el proxy lo reenvía a Render.
5. Si Render tarda más de 4 s, `serverWake` activa el `ServerWakeBanner`.
6. Con un OK, el estado pasa a `ready` y la guardia te lleva a `/rol`.
7. Eliges un rol: se guarda con `roleStorage` y entras a `/home/remitente` o `/home/viajero`.
