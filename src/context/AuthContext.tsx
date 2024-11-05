// AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
  loading: boolean;
  handleReloadDrawerDoc: () => void;
  realodingDrawerDoc: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [realodingDrawerDoc, setRealodingDrawerDoc] = useState(false);

  // Utilisation de useEffect pour vérifier s'il y a un token dans le localStorage au chargement
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
    }
    setLoading(false); // Authentification vérifiée
  }, []);


  const handleReloadDrawerDoc = () => {
    setRealodingDrawerDoc(!realodingDrawerDoc);
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': 'en',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      if (!response.ok) {
        const responseBody = await response.json();
        setError(`Échec de la connexion : ${responseBody.message}`);
        return;
      }

      const responseBody = await response.json();

      // Stocker le token dans le localStorage
      localStorage.setItem('authToken', responseBody.token);

      // Si la connexion est réussie, stocker le token dans l'état et mettre à jour l'état d'authentification
      setToken(responseBody.token);
      setIsAuthenticated(true);
      setError(null); // Réinitialiser les erreurs
    } catch (err) {
      console.error('Erreur lors de la connexion :', err);
      setError('Une erreur est survenue.');
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setToken(null); // Réinitialiser le token lors de la déconnexion
    localStorage.removeItem('authToken'); // Supprimer le token du localStorage
  };

  return (
    <AuthContext.Provider value={{ handleReloadDrawerDoc, realodingDrawerDoc, isAuthenticated, token, login, logout, error, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
