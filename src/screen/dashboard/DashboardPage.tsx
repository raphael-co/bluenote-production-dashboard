import React, { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import 'react-datepicker/dist/react-datepicker.css';
import { darkTheme, lightTheme } from './theme';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const DashboardPage: React.FC = () => {
    const { theme } = useTheme();
    const { token } = useAuth();
    const currentTheme = theme === 'light' ? lightTheme : darkTheme;
    const [user, setUser] = useState<any | null>(null);

    useEffect(() => {
        document.title = 'Tableau de bord';

        if (token) {
            const fetchUser = async () => {
                try {
                    const response = await axios.get(`${process.env.REACT_APP_API_URL}/users/`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    console.log(response.data.user);
                    setUser(response.data.user);
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            };
            fetchUser();
        }
    }, [token]);

    return (
        <div style={currentTheme.container}>
            <h1 style={currentTheme.title}>Tableau de bord</h1>
            <p style={currentTheme.subtitle}>Bienvenue sur votre tableau de bord</p>

            {user && (
                <div style={currentTheme.card}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                        <img
                            src={user.profile_image_url}
                            alt={`${user.username} profile`}
                            style={{ width: '100px', height: '100px', borderRadius: '50%', marginBottom: '20px' }}
                        />
                    </div>
                    <h2 style={currentTheme.title}>{user.username}</h2>
                    <p style={currentTheme.subtitle}>Email: {user.email}</p>
                    <p style={currentTheme.subtitle}>Membre depuis: {new Date(user.joined_at).toLocaleDateString()}</p>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
