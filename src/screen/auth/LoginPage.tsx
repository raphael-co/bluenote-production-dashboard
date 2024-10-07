// LoginPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom'; // Importer useNavigate
import { lightTheme, darkTheme } from './theme';

const LoginPage: React.FC = () => {
  const { login, isAuthenticated, error } = useAuth(); // Accéder à isAuthenticated
  const { theme } = useTheme();

  const currentTheme = theme === 'light' ? lightTheme : darkTheme;
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleLogin = async () => {
    await login(email, password); // Appelle la fonction login du contexte
  };

  // Redirection vers /dashboard si l'utilisateur est connecté
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard'); // Rediriger vers /dashboard
    }
  }, [isAuthenticated]); // Exécuter l'effet lorsqu'isAuthenticated change

  return (
    <div style={currentTheme.container}>
      <h2 style={currentTheme.title}>Connexion</h2>
      <p style={currentTheme.subtitle}>Veuillez entrer vos informations de connexion</p>
      {error && <p style={currentTheme.error}>{error}</p>}

      <input
        type="email"
        placeholder="Adresse e-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={currentTheme.input}
      />

      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={currentTheme.input}
      />

      <button onClick={handleLogin} style={currentTheme.buttonPrimary}>
        Se connecter
      </button>
    </div>
  );
};

export default LoginPage;
