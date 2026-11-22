'use client';
import { createContext, useContext, useState } from 'react';

// 1. On crée le contexte (la "boîte" partagée)
const GlobalContext = createContext();

// 2. Le fournisseur : il entoure l'application dans layout.tsx
export function GlobalProvider({ children }) {
  // Nombre de messages non lus (affiché sur la cloche de la Navbar)
  const [unreadCount, setUnreadCount] = useState(0);

  return (
    <GlobalContext.Provider value={{ unreadCount, setUnreadCount }}>
      {children}
    </GlobalContext.Provider>
  );
}

// 3. Le hook pour lire le contexte dans n'importe quel composant client
export function useGlobalContext() {
  return useContext(GlobalContext);
}
