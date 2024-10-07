import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { IconButton, Snackbar } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { lightTheme, darkTheme } from './theme';
import CommonTable from '../Tabs';
import { useNavigate, useSearchParams } from 'react-router-dom';

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
    const colorActive = theme === 'light' ? '#007BFF' : '#bb86fc';
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [page, setPage] = useState<number>(parseInt(searchParams.get('page') || '0'));
    const [rowsPerPage, setRowsPerPage] = useState<number>(parseInt(searchParams.get('size') || '10')); 
    const [totalUsers, setTotalUsers] = useState(0);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [search, setSearch] = useState<string>(searchParams.get('search') || '');

    const [sortColumn, setSortColumn] = useState<string>(searchParams.get('sortColumn') || 'joined_at');
    const [sortOrder, setSortOrder] = useState<string>(searchParams.get('sortOrder') || 'DESC'); 

    const columns = [
        { id: 'id', label: 'ID', minWidth: 100, type: 'number' as const, align: 'center' as const },
        { id: 'username', label: 'Username', minWidth: 170, type: 'string' as const, align: 'center' as const },
        { id: 'email', label: 'Email', minWidth: 170, type: 'string' as const, align: 'center' as const },
        { id: 'role', label: 'Role', minWidth: 100, type: 'string' as const, align: 'center' as const },
        { id: 'gender', label: 'Gender', minWidth: 100, type: 'string' as const, align: 'center' as const },
        { id: 'last_login', label: 'Last Login', minWidth: 170, type: 'date' as const, align: 'center' as const },
        { id: 'joined_at', label: 'Joined', minWidth: 170, type: 'date' as const, align: 'center' as const },
        { id: 'updated_at', label: 'Updated', minWidth: 170, type: 'date' as const, align: 'center' as const },
        { id: 'profile_image_url', label: 'Profile Image', minWidth: 100, type: 'image' as const, align: 'center' as const },
        { id: 'actions', label: 'Actions', minWidth: 170, type: 'actions' as const, align: 'center' as const }, // Nouvelle colonne actions
    ];

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/admin/users`, {
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
                setTotalUsers(response.data.meta.totalUsers);
            } catch (error) {
                setErrorMessage('Error fetching users');
                setOpenSnackbar(true);
            }
        };

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
            await axios.delete(`${process.env.REACT_APP_API_URL}/admin/users/${user.id}`, {
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

    // Fonction pour suppression multiple
    const handleMultiDelete = () => {
        if (selectedIds.length > 0) {
            console.log('Deleting users with IDs:', selectedIds);
        } else {
            console.log('No users selected for deletion');
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
            </div>
        );
    };

    return (
        <div style={currentTheme.container}>
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
            />

            {/* Snackbar pour afficher les erreurs */}
            <Snackbar
                sx={{ color: color }}
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={() => setOpenSnackbar(false)}
                message={errorMessage}
            />
        </div>
    );
};

export default UserTable;
