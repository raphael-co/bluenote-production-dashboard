import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { IconButton, Snackbar } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import EditIcon from '@mui/icons-material/Edit';
import { lightTheme, darkTheme } from './theme';
import Tooltip from '@mui/material/Tooltip';
import { useSnackbar } from 'notistack';
import CommonTable from '../Tabs';
import axios from 'axios';

interface Marker {
    id: number;
    user_id: number;
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    type: string;
    comment: string;
    visibility: string;
    blocked: boolean;
    images: { url: string }[];
    ratings: { label: string; rating: number }[];
}

const MarkersTable: React.FC = () => {
    const { theme } = useTheme();
    const { token } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const currentTheme = theme === 'light' ? lightTheme : darkTheme;
    const color = theme === 'light' ? '#000' : '#fff';
    const colorActive = theme === 'light' ? '#007BFF' : '#bb86fc';
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [markers, setMarkers] = useState<Marker[]>([]);
    const [page, setPage] = useState<number>(parseInt(searchParams.get('page') || '0'));
    const [rowsPerPage, setRowsPerPage] = useState<number>(parseInt(searchParams.get('size') || '10'));
    const [totalMarkers, setTotalMarkers] = useState(0);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [search, setSearch] = useState<string>(searchParams.get('search') || '');

    const [sortColumn, setSortColumn] = useState<string>(searchParams.get('sortColumn') || 'created_at');
    const [sortOrder, setSortOrder] = useState<string>(searchParams.get('sortOrder') || 'DESC');
    const { enqueueSnackbar } = useSnackbar();

    const columns = [
        { id: 'id', label: 'ID', minWidth: 100, type: 'number' as const, align: 'center' as const },
        { id: 'user_id', label: 'User ID', minWidth: 100, type: 'number' as const, align: 'center' as const },
        { id: 'title', label: 'Title', minWidth: 170, type: 'string' as const, align: 'center' as const },
        { id: 'description', label: 'Description', minWidth: 200, type: 'string' as const, align: 'center' as const },
        { id: 'latitude', label: 'Latitude', minWidth: 100, type: 'number' as const, align: 'center' as const },
        { id: 'longitude', label: 'Longitude', minWidth: 100, type: 'number' as const, align: 'center' as const },
        { id: 'type', label: 'Type', minWidth: 100, type: 'string' as const, align: 'center' as const },
        { id: 'visibility', label: 'Visibility', minWidth: 100, type: 'string' as const, align: 'center' as const },
        { id: 'blocked', label: 'Blocked', minWidth: 100, type: 'boolean' as const, align: 'center' as const },
        { id: 'created_at', label: 'Created At', minWidth: 100, type: 'boolean' as const, align: 'center' as const },
        { id: 'images', label: 'Images', minWidth: 200, type: 'image' as const, align: 'center' as const }, // Remplacer "images" par "image"
        { id: 'actions', label: 'Actions', minWidth: 170, type: 'actions' as const, align: 'center' as const },
    ];


    useEffect(() => {
        const fetchMarkers = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/admin/tabs/markers`, {
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
                setMarkers(response.data.data);
                setTotalMarkers(response.data.meta.totalMarkers);
            } catch (error) {
                setErrorMessage('Error fetching markers');
                setOpenSnackbar(true);
            }
        };

        if (token && (search === '' || search.length > 4)) {
            fetchMarkers();
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
        setPage(0);
    };

    const handleEdit = (marker: Marker) => {
        console.log('Editing marker:', marker);
        // Implémentez la logique d'édition ici

        const params = new URLSearchParams({
            search,
            page: page.toString(),
            size: rowsPerPage.toString(),
            sortColumn,
            sortOrder,
        }).toString();
        navigate(`/markers/edit/${marker.id}?${params}`);

    };

    const handleDelete = async (marker: Marker) => {
        const confirmDelete = window.confirm(`Are you sure you want to delete marker ${marker.title}?`);
        if (!confirmDelete) return;

        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/admin/markers/${marker.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            // Après suppression, mettre à jour la liste des markers
            setMarkers((prevMarkers) => prevMarkers.filter((m) => m.id !== marker.id));
            enqueueSnackbar(`Marker ${marker.title} deleted successfully.`, { variant: 'success' });

        } catch (error) {
            setErrorMessage(`Error deleting marker ${marker.title}`);
            setOpenSnackbar(true);
        }
    };

    // Fonction pour suppression multiple
    const handleMultiDelete = async () => {
        if (selectedIds.length > 0) {
            const confirmDelete = window.confirm(`Are you sure you want to delete ${selectedIds.length} selected markers?`);
            if (!confirmDelete) return;

            try {
                const response = await axios.post(`${process.env.REACT_APP_API_URL}/admin/markers/delete-multiple`, {
                    ids: selectedIds,  // Envoyer les IDs sélectionnés
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.status === 200) {
                    // Mise à jour locale après suppression réussie
                    setMarkers(prevMarkers => prevMarkers.filter(a => !selectedIds.includes(a.id)));
                    setSelectedIds([]);  // Réinitialiser la sélection après suppression
                    enqueueSnackbar(`Successfully deleted ${selectedIds.length} markers.`, { variant: 'success' });
                }
            } catch (error) {
                console.error('Error deleting multiple markers:', error);
                enqueueSnackbar('Error deleting markers. Please try again.', { variant: 'error' });
            }
        } else {
            console.log('No markers selected for deletion');
        }
    };

    const handleSort = (columnId: string) => {
        const isAsc = sortColumn === columnId && sortOrder === 'ASC';
        setSortOrder(isAsc ? 'DESC' : 'ASC');
        setSortColumn(columnId);
    };

    const handleBlockMarker = async (markerId: number, shouldBeBlocked: boolean) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/markers/blocked`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`  // Ensure your token is correctly managed
                },
                body: JSON.stringify({
                    markerId,
                    blocked: shouldBeBlocked
                })
            });

            if (response.ok) {  // Check if status code is in the range 200-299
                const responseData = await response.json();  // Assuming server sends back JSON response

                // Update marker in the local state
                setMarkers((prevMarkers) =>
                    prevMarkers.map((marker) => {
                        if (marker.id === markerId) {
                            return { ...marker, blocked: shouldBeBlocked }; // Ensure the structure of MarkerData
                        }
                        return marker;
                    })
                );

                enqueueSnackbar(responseData.message, { variant: 'success' });
            } else {
                console.error('Failed to update marker status:', await response.json());
                alert('Failed to update marker status'); // Provide user feedback
            }
        } catch (error) {
            console.error('Error fetching markers:', error);
            alert('Error updating marker status');
        }
    };

    const renderActions = (marker: Marker) => {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                {/* Bouton pour Edit */}
                <Tooltip title="Edit Marker" arrow>
                    <IconButton style={currentTheme.iconActive} onClick={() => handleEdit(marker)} >
                        <EditIcon />
                    </IconButton>
                </Tooltip>

                {/* Bouton pour blocked Markers */}
                <Tooltip title="Block Marker" arrow>
                    <IconButton color="warning" onClick={() => handleBlockMarker(marker.id, !marker.blocked)}
                    >
                        <BlockIcon />
                    </IconButton>
                </Tooltip>

                {/* Bouton pour Delete */}
                <Tooltip title="Delete Marker" arrow>
                    <IconButton color="error" onClick={() => handleDelete(marker)}>
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>
            </div>
        );
    };

    return (
        <div style={currentTheme.container}>
            <CommonTable
                label="Title or Description"
                columns={columns}
                rows={markers}
                page={page}
                rowsPerPage={rowsPerPage}
                totalRows={totalMarkers}
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

export default MarkersTable;
