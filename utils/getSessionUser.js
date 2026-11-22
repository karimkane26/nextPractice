import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/utils/authOption';

// Récupère l'utilisateur connecté côté serveur (pages, routes API)
export const getSessionUser = async () => {
  const session = await getServerSession(authOptions);

  // Personne n'est connecté
  if (!session || !session.user) {
    return null;
  }

  return {
    user: session.user,
    userId: session.user.id, // ajouté dans le callback session de authOption.js
  };
};
