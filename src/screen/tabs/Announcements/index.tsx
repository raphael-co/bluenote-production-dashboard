import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { IconButton, Snackbar } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { lightTheme, darkTheme } from './theme';
import Tooltip from '@mui/material/Tooltip';
import { useSnackbar } from 'notistack';
import CommonTable from '../Tabs';
import axios from 'axios';

interface Announcement {
    id: number;
    title: string;
    author_id: number;
    created_at: string;
    content: string;
}

const AnnouncementsTable: React.FC = () => {
    const { theme } = useTheme();
    const { token } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const currentTheme = theme === 'light' ? lightTheme : darkTheme;
    const color = theme === 'light' ? '#000' : '#fff';
    const colorActive = theme === 'light' ? '#007BFF' : '#bb86fc';
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [page, setPage] = useState<number>(parseInt(searchParams.get('page') || '0'));
    const [rowsPerPage, setRowsPerPage] = useState<number>(parseInt(searchParams.get('size') || '10'));
    const [totalAnnouncements, setTotalAnnouncements] = useState(0);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [search, setSearch] = useState<string>(searchParams.get('search') || '');

    const [sortColumn, setSortColumn] = useState<string>(searchParams.get('sortColumn') || 'created_at');
    const [sortOrder, setSortOrder] = useState<string>(searchParams.get('sortOrder') || 'DESC');
    const { enqueueSnackbar } = useSnackbar();
    
    const columns = [
        { id: 'id', label: 'ID', minWidth: 100, type: 'number' as const, align: 'center' as const },
        { id: 'title', label: 'Title', minWidth: 170, type: 'string' as const, align: 'center' as const },
        { id: 'author_id', label: 'Author ID', minWidth: 100, type: 'number' as const, align: 'center' as const },
        { id: 'created_at', label: 'Created At', minWidth: 100, type: 'string' as const, align: 'center' as const },
        { id: 'updated_at', label: 'Updated At', minWidth: 100, type: 'string' as const, align: 'center' as const },
        { id: 'actions', label: 'Actions', minWidth: 170, type: 'actions' as const, align: 'center' as const },
    ];

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/admin/announcements`, {
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
                setAnnouncements(response.data.data);
                setTotalAnnouncements(response.data.meta.totalAnnouncements);
            } catch (error) {
                setErrorMessage('Error fetching announcements');
                setOpenSnackbar(true);
            }
        };

        if (token && (search === '' || search.length > 4)) {
            fetchAnnouncements();
        }

        const params = new URLSearchParams({
            search,
            page: page.toString(),
            size: rowsPerPage.toString(),
            sortColumn,
            sortOrder,
        });
        navigate({ search: params.toString() }, { replace: true });

    }, [token, search, page, rowsPerPage, sortOrder, sortColumn,navigate]);

    const handlePageChange = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleEdit = (announcement: Announcement) => {
        navigate(`/announcements/?id=${announcement.id}`);
    };

    const handleDelete = async (announcement: Announcement) => {
        const confirmDelete = window.confirm(`Are you sure you want to delete announcement ${announcement.title}?`);
        if (!confirmDelete) return;

        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/announcements/${announcement.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            // Après suppression, mettre à jour la liste des annonces
            setAnnouncements((prevAnnouncements) => prevAnnouncements.filter((a) => a.id !== announcement.id));
            enqueueSnackbar(`Announcement ${announcement.title} deleted successfully.`, { variant: 'success' });

        } catch (error) {
            setErrorMessage(`Error deleting announcement ${announcement.title}`);
            setOpenSnackbar(true);
        }
    };

    const handleMultiDelete = async () => {
        if (selectedIds.length > 0) {
            const confirmDelete = window.confirm(`Are you sure you want to delete ${selectedIds.length} selected announcements?`);
            if (!confirmDelete) return;
    
            try {
                const response = await axios.post(`${process.env.REACT_APP_API_URL}/announcements/delete-multiple`, {
                    ids: selectedIds,  // Envoyer les IDs sélectionnés
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
    
                if (response.status === 200) {
                    // Mise à jour locale après suppression réussie
                    setAnnouncements(prevAnnouncements => prevAnnouncements.filter(a => !selectedIds.includes(a.id)));
                    setSelectedIds([]);  // Réinitialiser la sélection après suppression
                    enqueueSnackbar(`Successfully deleted ${selectedIds.length} announcements.`, { variant: 'success' });
                }
            } catch (error) {
                console.error('Error deleting multiple announcements:', error);
                enqueueSnackbar('Error deleting announcements. Please try again.', { variant: 'error' });
            }
        } else {
            console.log('No announcements selected for deletion');
        }
    };
    
    const renderActions = (announcement: Announcement) => {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
            {/* Bouton pour Edit */}
            <Tooltip title="Edit Announcement" arrow>
                <IconButton style={currentTheme.iconActive} onClick={() => handleEdit(announcement)} >
                    <EditIcon />
                </IconButton>
            </Tooltip>

            {/* Bouton pour Delete */}
            <Tooltip title="Delete Announcement" arrow>
                <IconButton color="error" onClick={() => handleDelete(announcement)}>
                    <DeleteIcon />
                </IconButton>
            </Tooltip>
        </div>
        );
    };

    return (
        <div style={currentTheme.container}>
            <CommonTable
                label="Title"
                columns={columns}
                rows={announcements}
                page={page}
                rowsPerPage={rowsPerPage}
                totalRows={totalAnnouncements}
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
                sortColumn={sortColumn}
                sortOrder={sortOrder}
                handleSort={(columnId: string) => {
                    const isAsc = sortColumn === columnId && sortOrder === 'ASC';
                    setSortOrder(isAsc ? 'DESC' : 'ASC');
                    setSortColumn(columnId);
                }}
                handleMultiDelete={handleMultiDelete}
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

export default AnnouncementsTable;
