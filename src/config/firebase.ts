import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// La configuración llega SOLO por variables de entorno (.env, ver .env.example).
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const missing = Object.entries(firebaseConfig)
  .filter(([key, value]) => !value && key !== 'storageBucket' && key !== 'messagingSenderId')
  .map(([key]) => key);

if (missing.length > 0) {
  throw new Error(
    `Falta configuración de Firebase (${missing.join(', ')}). Copia .env.example como .env y llena los valores.`,
  );
}

export const firebaseApp = initializeApp(firebaseConfig);

// getAuth usa persistencia local por defecto: la sesión sobrevive al cerrar la app.
export const auth = getAuth(firebaseApp);
auth.languageCode = 'es'; // Correos de Firebase (p. ej. restablecer contraseña) en español.
