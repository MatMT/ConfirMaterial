import { useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';

interface StoreInitializerProps {
  user: any; // Perfil del usuario obtenido desde Astro (Supabase)
}

export default function StoreInitializer({ user }: StoreInitializerProps) {
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    // Al cargar la aplicación en el cliente, hidratamos el estado de Zustand
    // con los datos del servidor (Astro/Supabase)
    setUser(user);
  }, [user, setUser]);

  // Este componente no renderiza nada visible
  return null;
}
