import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { darkTheme, lightTheme } from '../dashboard/theme';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const HomeScreen: React.FC = () => {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const currentTheme = theme === 'light' ? lightTheme : darkTheme;

    return (
        <div style={currentTheme.page}>
            <div style={currentTheme.container}>
                <p style={currentTheme.title}>Bienvenue sur le Dashboard d'administration</p>
                <p style={{ ...currentTheme.subtitle, textAlign: 'center' }}>
                    Cette application vous permet de gérer facilement les markers, les utilisateurs, les commentaires, la documentation et les annonces.
                    Connectez-vous pour accéder à toutes les fonctionnalités et gérer votre espace d'administration de manière efficace.
                </p>
                <div style={currentTheme.buttonContainer}>
                    {!isAuthenticated ? (
                        <button style={currentTheme.buttonPrimary} onClick={() => navigate('/login')}>
                            Se connecter
                        </button>
                    )
                        : (
                            <button style={currentTheme.buttonPrimary} onClick={() => navigate('/dashboard')}>
                                Voir le tableau de bord
                            </button>
                        )}
                </div>
            </div>
        </div>
    );
};

export default HomeScreen;
