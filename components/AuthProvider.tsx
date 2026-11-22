'use client';
import { SessionProvider } from 'next-auth/react';

// Rend la session (useSession) disponible dans tous les composants client
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <SessionProvider>{children}</SessionProvider>;
};
export default AuthProvider;
