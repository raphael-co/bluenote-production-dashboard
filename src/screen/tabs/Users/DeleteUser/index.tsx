import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar } from '@mui/material';
import axios from 'axios';

interface DeleteUserProps {
    userId: number;
    userName: string;
    onUserDeleted: () => void; // Callback après suppression réussie
}

const DeleteUser: React.FC<DeleteUserProps> = ({ userId, userName, onUserDeleted }) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleDeleteUser = async () => {
        try {
            // Appel à l'API de suppression
            const response = await axios.delete(`/api/admin/users/${userId}`);

            if (response.status === 200) {
                onUserDeleted();
                handleCloseDialog();
            }
        } catch (error: any) {
            if (error.response && error.response.status === 403) {
                // Si l'utilisateur est un admin, afficher un message d'erreur
                setErrorMessage('Cannot delete an admin user');
                setOpenSnackbar(true);
            } else {
                setErrorMessage('Error deleting user');
                setOpenSnackbar(true);
            }
        }
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    return (
        <>
            <Button variant="contained" color="secondary" onClick={handleOpenDialog}>
                Delete {userName}
            </Button>

            {/* Dialog de confirmation */}
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>Delete User</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete the user {userName}? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteUser} color="secondary" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar pour afficher les erreurs */}
            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                message={errorMessage}
            />
        </>
    );
};

export default DeleteUser;
