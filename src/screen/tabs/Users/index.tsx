import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { IconButton, MenuItem, Select, Snackbar, SnackbarContent, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { lightTheme, darkTheme } from './theme';
import CommonTable from '../Tabs';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import AddUserModal from '../../../componnent/AddUserModal';


type Severity = 'success' | 'error' | 'warning' | 'info';

interface CustomSnackbarProps {
    severity: Severity;
}

// Composant styled avec différentes couleurs selon le type de Snackbar
export const CustomSnackbar = styled(SnackbarContent)<CustomSnackbarProps>(({ severity }) => ({
    backgroundColor:
        severity === 'success'
            ? '#4caf50' // Couleur pour success
            : severity === 'error'
                ? '#f44336' // Couleur pour error
                : severity === 'warning'
                    ? '#ff9800' // Couleur pour warning
                    : '#333', // Couleur par défaut
    color: '#fff', // Couleur du texte
}));


interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    gender: string;
    last_login: string;
    joined_at: string;
    updated_at: string;
    profile_image_url: string;
}

const UserTable: React.FC = () => {
    const { theme } = useTheme();
    const { token } = useAuth();
    const [searchParams] = useSearchParams(); // Utilisez ce hook pour accéder aux paramètres d'URL
    const navigate = useNavigate();

    const currentTheme = theme === 'light' ? lightTheme : darkTheme;
    const color = theme === 'light' ? '#000' : '#fff';
    const backgroundColor = theme === 'light' ? '#fff' : '#282828';
    const colorActive = theme === 'light' ? '#007BFF' : '#bb86fc';
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [page, setPage] = useState<number>(parseInt(searchParams.get('page') || '0'));
    const [rowsPerPage, setRowsPerPage] = useState<number>(parseInt(searchParams.get('size') || '10'));
    const [totalUsers, setTotalUsers] = useState(0);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [messageStatus, setMessageStatus] = useState<Severity>('error');
    const [search, setSearch] = useState<string>(searchParams.get('search') || '');

    const [openAddUserModal, setOpenAddUserModal] = useState<boolean>(false);
    const [sortColumn, setSortColumn] = useState<string>(searchParams.get('sortColumn') || 'joined_at');
    const [sortOrder, setSortOrder] = useState<string>(searchParams.get('sortOrder') || 'DESC');

    const columns = [
        { id: 'id', label: 'ID', minWidth: 100, type: 'number' as const, align: 'center' as const },
        { id: 'username', label: 'Username', minWidth: 170, type: 'string' as const, align: 'center' as const },
        { id: 'email', label: 'Email', minWidth: 170, type: 'string' as const, align: 'center' as const },
        { id: 'role', label: 'Role', minWidth: 100, type: 'string' as const, align: 'center' as const },
        { id: 'joined_at', label: 'Joined', minWidth: 170, type: 'date' as const, align: 'center' as const },
        { id: 'updated_at', label: 'Updated', minWidth: 170, type: 'date' as const, align: 'center' as const },
        { id: 'profile_image_url', label: 'Profile Image', minWidth: 100, type: 'image' as const, align: 'center' as const },
        { id: 'actions', label: 'Actions', minWidth: 170, type: 'actions' as const, align: 'center' as const }, // Nouvelle colonne actions
    ];

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/users/all`, {
                params: {
                    search,
                    page: page + 1,
                    size: rowsPerPage,
                    sortColumn,
                    sortOrder,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUsers(response.data.users);
            setTotalUsers(response.data.meta.total);
        } catch (error: any) {
            console.log(error);

            if (error.response && error.response.data) {
                setErrorMessage(error.response.data.message);
                setMessageStatus(error.response.data.status);

            } else {
                setErrorMessage('Error fetching users');
                setMessageStatus('error');
            }
            setOpenSnackbar(true);


        }
    };

    useEffect(() => {

        // Ne déclenche la recherche que si `search` est vide ou si la longueur dépasse 4 caractères
        if (token && (search === '' || search.length > 4)) {
            fetchUsers();
        }

        const params = new URLSearchParams({
            search,
            page: page.toString(),
            size: rowsPerPage.toString(),
            sortColumn,
            sortOrder,
        });
        navigate({ search: params.toString() }, { replace: true });

    }, [token, search, page, rowsPerPage, sortOrder, sortColumn, navigate]);

    const handlePageChange = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // Réinitialise la page lors du changement du nombre de lignes par page
    };

    const handleEdit = (user: User) => {
        console.log('Editing user:', user);
        // Implémenter la logique d'édition ici
    };

    const handleDelete = async (user: User) => {
        const confirmDelete = window.confirm(`Are you sure you want to delete user ${user.username}?`);
        if (!confirmDelete) return;

        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/users/id/${user.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            // Après suppression, mettre à jour la liste des utilisateurs
            setUsers((prevUsers) => prevUsers.filter((u) => u.id !== user.id));
            console.log(`User ${user.username} deleted successfully.`);
        } catch (error) {
            setErrorMessage(`Error deleting user ${user.username}`);
            setOpenSnackbar(true);
        }
    };

    // Fonction pour suppression multipleimport axios from 'axios';

const handleMultiDelete = async () => {
    if (selectedIds.length > 0) {
        console.log(selectedIds);

        const confirmDelete = window.confirm(`Are you sure you want to delete the selected users?`);
        if (!confirmDelete) return;

        try {
            // Envoi des IDs des utilisateurs à supprimer dans le corps de la requête
            const response = await axios.delete(`${process.env.REACT_APP_API_URL}/users/multi`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                data: { ids: selectedIds }, // Les IDs dans le corps de la requête
            });

            console.log('Deletion response:', response.data);
            setMessageStatus('success');
            setErrorMessage('Users deleted successfully' + selectedIds);
            setOpenSnackbar(true);
            fetchUsers()

        } catch (error) {
            console.error('Error deleting users:', error);
            setMessageStatus('error');
            setErrorMessage(`Error deleting users`);
            setOpenSnackbar(true);
        }
    } else {
        console.log('No users selected for deletion');
        setMessageStatus('warning');
        setErrorMessage('No users selected for deletion');
        setOpenSnackbar(true);
    }
};


    const handleSort = (columnId: string) => {
        console.log(columnId);

        const isAsc = sortColumn === columnId && sortOrder === 'ASC';
        setSortOrder(isAsc ? 'DESC' : 'ASC');

    }
    const renderActions = (user: User) => {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                {/* Bouton pour Edit */}
                <IconButton style={currentTheme.iconActive} onClick={() => handleEdit(user)} >
                    <EditIcon />
                </IconButton>

                {/* Bouton pour Delete */}
                <IconButton color="error" onClick={() => handleDelete(user)}>
                    <DeleteIcon />
                </IconButton>
                <Select
                value={user.role}
                onChange={(e) => handleRoleUpdate(user.id, e.target.value as string)}
                style={{ minWidth: 100 }}
            >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="super_admin">Super Admin</MenuItem>
            </Select>
            </div>
        );
    };

    const addButton = (
        <Tooltip title="Add User" arrow>
            <IconButton style={currentTheme.iconActive} onClick={() => setOpenAddUserModal(true)}>
                +
            </IconButton>
        </Tooltip>
    );

    const handleRoleUpdate = async (userId: number, newRole: string) => {
        try {
            const response = await axios.patch(
                `${process.env.REACT_APP_API_URL}/users/role/${userId}`,
                { role: newRole },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            setErrorMessage(response.data.message);
            setMessageStatus('success');
            setOpenSnackbar(true);

            // Mettre à jour la liste des utilisateurs pour refléter les changements
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.id === userId ? { ...user, role: newRole } : user
                )
            );
        } catch (error: any) {
            console.error('Error updating role:', error);
            setErrorMessage('Error updating role');
            setMessageStatus('error');
            setOpenSnackbar(true);
        }
    };

    return (
        <div style={currentTheme.container}>
            <AddUserModal
                open={openAddUserModal}
                onClose={() => setOpenAddUserModal(false)}
                title="Add User"
                // content={undefined}
                color={color}
               backgroundColor={backgroundColor}
               colorActive={colorActive}
            />
            <CommonTable
                label="username or email"
                columns={columns}
                rows={users}
                page={page}
                rowsPerPage={rowsPerPage}
                totalRows={totalUsers}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                theme={currentTheme}
                color={color}
                colorActive={colorActive}
                renderActions={renderActions}
                search={search}
                setSearch={setSearch}
                selectedRows={setSelectedIds}
                selectedIds={selectedIds}
                handleMultiDelete={handleMultiDelete}
                handleSort={handleSort}
                sortColumn={sortColumn}
                sortOrder={sortOrder}
                setSortColumn={setSortColumn}
                addButton={addButton}
            />


            {/* Snackbar pour afficher les erreurs */}
            <Snackbar
                sx={{ color: color }}
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={() => setOpenSnackbar(false)}
            >
                <CustomSnackbar
                    message={errorMessage}
                    severity={messageStatus}
                />
            </Snackbar>

        </div>
    );
};

export default UserTable;
