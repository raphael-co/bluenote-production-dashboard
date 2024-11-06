import React, { useState } from 'react';
import { Modal, Box, Typography, Button, Snackbar } from '@mui/material';
import CustomTextField from '../CustomTextField';
import axios from 'axios';
import { CustomSnackbar } from '../../screen/tabs/Users';

interface CustomModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    actions?: React.ReactNode;
    color?: string;
    backgroundColor?: string;
    colorActive?: string;
}

type Severity = 'success' | 'error' | 'warning' | 'info';

const AddUserModal: React.FC<CustomModalProps> = ({
    open,
    onClose,
    title,
    color = 'text.primary',
    backgroundColor = 'background.paper',
    colorActive = '#1976d2',
}) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [messageStatus, setMessageStatus] = useState<Severity>('error');

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setProfileImage(event.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('email', email);
        formData.append('password', password);
        if (profileImage) {
            formData.append('profileImage', profileImage);
        }

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/users`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                },
            });
            setMessageStatus('success');
            setErrorMessage(response.data.message);
            setOpenSnackbar(true);
            onClose();
        } catch (error) {
            setMessageStatus('error');
            if (axios.isAxiosError(error) && error.response) {
                if (error.response.data.message) {
                    setErrorMessage(error.response.data.message);
                }else {
                    const apiErrors = error.response.data.errors || {};
                    const errorMessages = Object.values(apiErrors).join(', ');
                    setErrorMessage(errorMessages || 'An unexpected error occurred');
                }
          
            } else {
                setErrorMessage('Network error or server unavailable');
            }
            setOpenSnackbar(true);
        }
    };

    return (
        <>
            <Modal
                open={open}
                onClose={onClose}
                aria-labelledby="custom-modal-title"
                aria-describedby="custom-modal-content"
            >
                <Box
                    sx={{
                        position: 'absolute' as 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 400,
                        bgcolor: backgroundColor,
                        borderRadius: '8px',
                        boxShadow: 24,
                        p: 4,
                    }}
                >
                    {title && (
                        <Typography
                            id="custom-modal-title"
                            variant="h6"
                            component="h2"
                            sx={{ mb: 2, color: color }}
                        >
                            {title}
                        </Typography>
                    )}
                    <Box
                        id="custom-modal-content"
                        component="form"
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                            mb: 3,
                        }}
                        noValidate
                        autoComplete="off"
                    >
                        <CustomTextField
                            label="Username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            color={color}
                            colorActive={colorActive}
                            sx={{ width: '100%' }}
                        />
                        <CustomTextField
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            color={color}
                            colorActive={colorActive}
                            sx={{ width: '100%' }}
                        />
                        <CustomTextField
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            color={color}
                            colorActive={colorActive}
                            sx={{ width: '100%' }}
                        />
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                gap: 1,
                            }}
                        >
                            <Typography variant="body2" sx={{ color }}>
                                Profile Image
                            </Typography>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                style={{
                                    padding: '8px',
                                    border: `1px solid ${colorActive}`,
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    width: '100%',
                                }}
                            />
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button onClick={onClose} style={{ color: colorActive }}>
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            style={{ backgroundColor: colorActive }}
                        >
                            Submit
                        </Button>
                    </Box>
                </Box>
            </Modal>
            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={() => setOpenSnackbar(false)}
            >
                <CustomSnackbar
                    message={errorMessage}
                    severity={messageStatus}
                />
            </Snackbar>
        </>
    );
};

export default AddUserModal;
