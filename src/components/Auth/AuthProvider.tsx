import React, { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Initialize auth store on mount and get cleanup function
    const cleanup = useAuthStore.getState().init();
    
    // Cleanup listener on unmount
    return () => {
      cleanup();
    };
  }, []);

  return <>{children}</>;
};
