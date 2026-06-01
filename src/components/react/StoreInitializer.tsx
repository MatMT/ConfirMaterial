import { useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import useProgressStore from '../../stores/progressStore';
import { supabase } from '../../utils/supabase';

interface StoreInitializerProps {
  user: any; // Perfil del usuario obtenido desde Astro (Supabase)
  accessToken?: string;
  refreshToken?: string;
}

export default function StoreInitializer({ user, accessToken, refreshToken }: StoreInitializerProps) {
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    const init = async () => {
      // Si tenemos tokens, inicializar la sesión en el cliente de Supabase
      if (accessToken && refreshToken) {
          await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
          });
      }

      // Al cargar la aplicación en el cliente, hidratamos el estado de Zustand
      // con los datos del servidor (Astro/Supabase)
      setUser(user);
      if (user?.id) {
          useProgressStore.getState().initializeStore(user.id);
      } else {
          useProgressStore.getState().initializeStore(null);
      }
    };
    
    init();
  }, [user, setUser, accessToken, refreshToken]);

  // Este componente no renderiza nada visible
  return null;
}
