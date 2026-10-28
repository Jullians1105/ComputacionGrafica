import { AuthProvider } from './auth/AuthContext';
import { ServerWakeBanner } from './components/ServerWakeBanner';
import { AppRouter } from './router/AppRouter';

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
      <ServerWakeBanner />
    </AuthProvider>
  );
}
