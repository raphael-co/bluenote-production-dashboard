import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Snackbar from '@mui/material/Snackbar';
import { CustomSnackbar } from '../tabs/Users';
import './work.css';
import { useTheme } from '../../context/ThemeContext';

const Work: React.FC = () => {
    const { token } = useAuth();
    const [backgroundUrl, setBackgroundUrl] = useState<File | string | null>(null);
    const [frameUrl, setFrameUrl] = useState<File | string | null>(null);
    const [dataFetched, setDataFetched] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [messageStatus, setMessageStatus] = useState<'success' | 'error'>('error');
    const [id, setId] = useState<number | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const { theme } = useTheme();
    const colorActive = theme === 'light' ? '#007BFF' : '#bb86fc';
    const handleBackgroundChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) setBackgroundUrl(file);
    };

    const handleFrameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) setFrameUrl(file);
    };

    const handleVideoPlayPause = () => {
        if (isPlaying) {
            videoRef.current?.pause();
            setIsPlaying(false);
        } else {
            videoRef.current?.play();
            setIsPlaying(true);
        }
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
        <div className="banner-ifrma" style={{
            background: backgroundUrl
                ? typeof backgroundUrl === 'string'
                    ? `url(${backgroundUrl}) no-repeat center center/cover`
                    : `url(${URL.createObjectURL(backgroundUrl as File)}) no-repeat center center/cover`
                : undefined,
        }}>
            <h1>Work Editor</h1>

            <div style={{ marginBottom: '20px', zIndex: 20, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <label htmlFor="background-upload" className="file-label" style={{ backgroundColor: colorActive }}>Upload Background</label>
                <input
                    type="file"
                    id="background-upload"
                    accept="image/*"
                    onChange={handleBackgroundChange}
                />
                {backgroundUrl && (
                    <div style={{ position: 'relative', zIndex: 10 }}>
                        <button
                            onClick={() => setBackgroundUrl(null)}
                            style={{ position: 'absolute', top: '0', right: '0', cursor: 'pointer' }}
                        >
                            X
                        </button>
                        <img
                            src={typeof backgroundUrl === 'string' ? backgroundUrl : URL.createObjectURL(backgroundUrl)}
                            alt="Background Preview"
                            style={{ width: '100px', height: 'auto', marginTop: '10px' }}
                        />
                    </div>
                )}
            </div>

            <div style={{ marginBottom: '20px', zIndex: 20, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <label htmlFor="frame-upload" className="file-label" style={{ backgroundColor: colorActive }}>Upload Frame (Video)</label>
                <input
                    type="file"
                    id="frame-upload"
                    accept="video/*"
                    onChange={handleFrameChange}
                />
                {frameUrl && (
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => setFrameUrl(null)}
                            style={{ position: 'absolute', top: '0', right: '0', cursor: 'pointer', zIndex: 20 }}
                        >
                            X
                        </button>
                        <div
                            className="video-thumbnail"
                            style={{ cursor: 'pointer', position: 'relative', zIndex: 10 }}
                            onClick={handleVideoPlayPause}
                        >
                            {!isPlaying && (
                                <span
                                    className="fa fa-play-circle play-button"
                                    style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        fontSize: '3rem',
                                        color: 'white',
                                        zIndex: 1000,
                                    }}
                                ></span>
                            )}
                            <video
                                ref={videoRef}
                                src={typeof frameUrl === 'string' ? frameUrl : URL.createObjectURL(frameUrl)}
                                style={{
                                    width: '300px',
                                    height: 'auto',
                                    borderRadius: '10px',
                                    marginTop: '10px',
                                }}
                                controls
                                onPlay={() => setIsPlaying(true)}
                                onPause={() => setIsPlaying(false)}
                            />
                        </div>
                    </div>
                )}
            </div>

            <button style={{ zIndex: 20, cursor: 'pointer' }} onClick={handleSubmit}>{dataFetched ? 'Update' : 'Submit'}</button>

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
