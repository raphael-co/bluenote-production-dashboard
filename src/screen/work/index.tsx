import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Snackbar from '@mui/material/Snackbar';
import { CustomSnackbar } from '../tabs/Users';

const Work: React.FC = () => {
    const { token } = useAuth();
    const [backgroundUrl, setBackgroundUrl] = useState<File | string | null>(null);
    const [frameUrl, setFrameUrl] = useState<File | string | null>(null);
    const [dataFetched, setDataFetched] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [messageStatus, setMessageStatus] = useState<'success' | 'error'>('error');
    const [id, setId] = useState<number | null>(null);

    const handleBackgroundChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) setBackgroundUrl(file);
    };

    const handleFrameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) setFrameUrl(file);
    };

    useEffect(() => {
        const fetchWorkData = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/work`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data && response.data[0].backgroundUrl && response.data[0].frameUrl) {
                    setBackgroundUrl(response.data[0].backgroundUrl);
                    setFrameUrl(response.data[0].frameUrl);
                    setId(response.data[0].id);
                    setDataFetched(true);
                }
            } catch (error) {
                console.error('Error fetching work data:', error);
            }
        };

        fetchWorkData();
    }, [token]);

    const handleSubmit = async () => {
        const formData = new FormData();
        if (backgroundUrl && typeof backgroundUrl !== 'string') formData.append('backgroundUrl', backgroundUrl);
        if (frameUrl && typeof frameUrl !== 'string') formData.append('frameUrl', frameUrl);
        if (id) formData.append('id', id.toString());

        try {
            const response = dataFetched
                ? await axios.patch(`${process.env.REACT_APP_API_URL}/work`, formData, {
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
                })
                : await axios.post(`${process.env.REACT_APP_API_URL}/work`, formData, {
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
                });

            setMessageStatus('success');
            setErrorMessage(response.data.message);
            setOpenSnackbar(true);
            if (!dataFetched) setDataFetched(true);
        } catch (error) {
            setMessageStatus('error');
            if (axios.isAxiosError(error) && error.response) {
                setErrorMessage(error.response.data.message || 'An error occurred');
            } else {
                setErrorMessage('Network error or server unavailable');
            }
            setOpenSnackbar(true);
        }
    };

    return (
        <div className="Work-container">
            <h1>Work Editor</h1>
            <div style={{ marginBottom: '20px' }}>
                <label>Background File:</label>
                {backgroundUrl ? (
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => setBackgroundUrl(null)}
                            style={{ position: 'absolute', top: '0', right: '0', cursor: 'pointer' }}
                        >
                            X
                        </button>
                        <img
                            src={typeof backgroundUrl === 'string' ? backgroundUrl : URL.createObjectURL(backgroundUrl)}
                            alt="Background Preview"
                            style={{ width: '100px', height: 'auto' }}
                        />
                    </div>
                ) : (
                    <input type="file" accept="image/*,video/*" onChange={handleBackgroundChange} />
                )}
            </div>

            <div style={{ marginBottom: '20px' }}>
                <label>Frame File:</label>
                {frameUrl ? (
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => setFrameUrl(null)}
                            style={{ position: 'absolute', top: '0', right: '0', cursor: 'pointer' }}
                        >
                            X
                        </button>

                        <video
                            src={
                                typeof frameUrl === 'string' ? frameUrl : URL.createObjectURL(frameUrl)
                            }
                            style={{
                                width: '300px',
                                height: 'auto',
                                marginBottom: '20px',
                            }}
                            controls
                        />
                    </div>
                ) : (
                    <input type="file" accept="image/*,video/*" onChange={handleFrameChange} />
                )}
            </div>

            <button onClick={handleSubmit}>{dataFetched ? 'Update' : 'Submit'}</button>

            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={() => setOpenSnackbar(false)}
            >
                <CustomSnackbar message={errorMessage} severity={messageStatus} />
            </Snackbar>
        </div>
    );
};

export default Work;
