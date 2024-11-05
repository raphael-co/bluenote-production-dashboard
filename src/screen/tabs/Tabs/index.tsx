import React, { useEffect, useState, useRef } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, Checkbox, IconButton, Menu, MenuItem, FormControlLabel, TextField } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import DeleteIcon from '@mui/icons-material/Delete';

import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Navigation, Thumbs } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import './custom-swiper.css';
import './myTable.css';
import CustomTextField from '../../../componnent/CustomTextField';

interface Column {
    id: string;
    label: string;
    minWidth?: number;
    align?: 'right' | 'left' | 'center';
    type?: 'string' | 'number' | 'date' | 'image' | 'actions' | 'boolean';
}

interface CommonTableProps<T> {
    columns: Column[];
    rows: T[];
    page: number;
    rowsPerPage: number;
    totalRows: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    theme: any;
    color: string;
    renderActions?: (row: T) => React.ReactNode;
    selectedRows?: (selectedIds: number[]) => void;
    colorActive: string;
    label?: string;
    search: string;
    setSearch: (value: string) => void;
    handleSort: (columnId: string) => void;
    sortColumn: string;
    sortOrder: string;
    handleMultiDelete: () => void;
    selectedIds?: number[];
    setSortColumn: (label: string) => void;
    addButton?: React.ReactNode;
}

const CommonTable = <T extends { id: number;[key: string]: any }>({
    columns,
    rows,
    page,
    rowsPerPage,
    totalRows,
    onPageChange,
    onRowsPerPageChange,
    handleMultiDelete,
    theme,
    color,
    renderActions,
    selectedRows,
    colorActive,
    label = 'Search',
    search,
    setSearch,
    handleSort,
    sortColumn,
    sortOrder,
    setSortColumn,
    addButton,
}: CommonTableProps<T>) => {
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const swiperRef = useRef<any>(null); // Ref pour accéder à l'instance de Swiper

    // Synchroniser les lignes sélectionnées avec les nouvelles lignes reçues (par ex. après une recherche).
    useEffect(() => {
        const newSelectedIds = selectedIds.filter((id) => rows.some((row) => row.id === id));
        setSelectedIds(newSelectedIds);
    }, [rows]);

    const [visibleColumns, setVisibleColumns] = useState(columns.map((col) => col.id)); // Colonne visibles par défaut
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleSelectRow = (id: number) => {
        const newSelectedIds = selectedIds.includes(id)
            ? selectedIds.filter((selectedId) => selectedId !== id)
            : [...selectedIds, id];
        setSelectedIds(newSelectedIds);
        if (selectedRows) {
            selectedRows(newSelectedIds);
        }
    };

    const isColumnVisible = (columnId: string) => visibleColumns.includes(columnId);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const toggleColumnVisibility = (columnId: string) => {
        setVisibleColumns((prevVisibleColumns) =>
            prevVisibleColumns.includes(columnId)
                ? prevVisibleColumns.filter((id) => id !== columnId)
                : [...prevVisibleColumns, columnId]
        );
    };

    useEffect(() => {
        if (swiperRef.current?.navigation) {
            swiperRef.current.navigation.nextEl.style.color = colorActive;
            swiperRef.current.navigation.prevEl.style.color = colorActive;
        }
    }, [colorActive]);// Dépendance sur `colorActive` pour la mise à jour dynamique

    const renderCellValue = (type: string | undefined, value: any, row: T) => {
        switch (type) {
            case 'date':
                return value ? new Date(value).toLocaleString() : '-';
            case 'image':
                if (Array.isArray(value)) {
                    return (
                        <div style={{ display: 'flex' }}>
                            <Swiper
                                ref={swiperRef} // Ajout de la référence Swiper
                                loop={true}
                                spaceBetween={10}
                                navigation={true}
                                modules={[FreeMode, Navigation, Thumbs]}
                                style={{ borderRadius: '10px', padding: 0, width: '100px', height: '100px' }}
                                onInit={(swiper: any) => {
                                    swiperRef.current = swiper;
                                    // swiper.navigation.nextEl.style.color = colorActive;
                                    // swiper.navigation.prevEl.style.color = colorActive;
                                }}
                            >
                                {value.map((img: { url: string }, index: number) => (
                                    <SwiperSlide key={index} virtualIndex={index}>
                                        <div className="image-container" style={{ position: 'relative', color: colorActive }}>
                                            <img
                                                src={img.url}
                                                alt={`image-${index}`}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    borderRadius: '10px',
                                                }}
                                            />
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>
                    );
                }
                return <img src={value} alt="profile" style={{ width: 50, height: 50, borderRadius: '50%' }} />;
            case 'boolean':
                return value ? 'Yes' : 'No';
            case 'actions':
                return renderActions ? renderActions(row) : null;
            case 'string':
            case 'number':
            default:
                return value;
        }
    };

    return (
        <TableContainer component={Paper} style={{ ...theme.card, overflowY: 'auto' }}>
            <Table>
                <TableHead style={{ width: '100%', backgroundColor: theme.card.backgroundColor, position: 'sticky', top: -20, zIndex: 3 }}>
                    <TableRow sx={{ backgroundColor: theme.card.backgroundColor, borderBottom: 'none', height: 60 }}>
                        <TableCell className="min-max-cell" colSpan={columns.length + 1} sx={{ backgroundColor: theme.card.backgroundColor, padding: '0 0 0 4px', borderBottom: 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', width: '100%', backgroundColor: theme.card.backgroundColor }}>
                                <IconButton onClick={handleClick} aria-controls="column-menu" aria-haspopup="true">
                                    <FilterListIcon style={{ color }} />
                                </IconButton>
                                <Menu
                                    id="column-menu"
                                    anchorEl={anchorEl}
                                    open={open}
                                    onClose={handleClose}
                                    sx={{
                                        '& .MuiPaper-root': {
                                            backgroundColor: theme.card.backgroundColor,
                                        },
                                    }}
                                >
                                    {columns.map((column) => (
                                        <MenuItem key={column.id} onClick={() => toggleColumnVisibility(column.id)}>
                                            <FormControlLabel
                                                sx={{ color }}
                                                control={
                                                    <Checkbox
                                                        style={{ color: colorActive, borderColor: colorActive }}
                                                        sx={{ color: colorActive, borderColor: colorActive }}
                                                        checked={isColumnVisible(column.id)}
                                                    />
                                                }
                                                label={column.label}
                                            />
                                        </MenuItem>
                                    ))}
                                </Menu>

                                <CustomTextField
                                    colorActive={colorActive}
                                    color={color}
                                    label={label}
                                    variant="outlined"
                                    size="small"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    style={{ marginLeft: '10px' }}
                                />

                                {selectedIds.length > 0 && (
                                    <IconButton color="error" aria-label="delete" onClick={handleMultiDelete} style={{ marginLeft: '10px' }}>
                                        <DeleteIcon />
                                    </IconButton>
                                )}

                                {addButton && addButton}
                            </div>
                        </TableCell>
                    </TableRow>

                    <TableRow sx={{ backgroundColor: theme.card.backgroundColor, borderTop: 'none', padding: 0 }}>
                        <TableCell className="min-max-cell" sx={{ backgroundColor: theme.card.backgroundColor }} padding="checkbox">
                            <Checkbox
                                indeterminate={selectedIds.length > 0 && selectedIds.length < rows.length}
                                checked={selectedIds.length === rows.length}
                                style={{ color: colorActive, borderColor: colorActive }}
                                sx={{ color: colorActive, borderColor: colorActive }}
                                onChange={(event) => {
                                    const newSelectedIds = event.target.checked ? rows.map((row) => row.id) : [];
                                    setSelectedIds(newSelectedIds);
                                    if (selectedRows) {
                                        selectedRows(newSelectedIds);
                                    }
                                }}
                            />
                        </TableCell>
                        {columns.map((column) =>
                            isColumnVisible(column.id) ? (
                                <TableCell
                                    // className={column.id === 'description' || column.id === 'email' ? 'min-max-cell-large' : 'min-max-cell'}
                                    key={column.id}
                                    align={column.align || 'left'}
                                    style={{ color }}
                                    onClick={() => (sortColumn === column.id ? handleSort(column.id) : setSortColumn(column.id))}
                                    sx={{ color, minWidth: column.minWidth ? `${column.minWidth}px` : '100px' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row', gap: '5px' }}>
                                        <span>{column.label}</span>
                                        {sortColumn === column.id && <span>{sortOrder === 'ASC' ? ' 🔼' : ' 🔽'}</span>}
                                    </div>
                                </TableCell>
                            ) : null
                        )}
                    </TableRow>
                </TableHead>

                <TableBody>
                    {rows.map((row, rowIndex) => (
                        <TableRow hover key={rowIndex}>
                            <TableCell className="min-max-cell" padding="checkbox">
                                <Checkbox
                                    style={{ color: colorActive, borderColor: colorActive }}
                                    sx={{ color: colorActive, borderColor: colorActive }}
                                    checked={selectedIds.includes(row.id)}
                                    onChange={() => handleSelectRow(row.id)}
                                />
                            </TableCell>
                            {columns.map((column) =>
                                isColumnVisible(column.id) ? (
                                    <TableCell className="min-max-cell" sx={{ color }} key={column.id} align={column.align || 'left'}>
                                        {renderCellValue(column.type, row[column.id], row)}
                                    </TableCell>
                                ) : null
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <TablePagination
                sx={{
                    color,
                    position: 'sticky',
                    left: 0,
                    backgroundColor: theme.card.backgroundColor,
                    zIndex: 1,
                    '& .MuiSvgIcon-root': {
                        color,
                    },
                }}
                component="div"
                count={totalRows}
                page={page}
                onPageChange={onPageChange}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={onRowsPerPageChange}
            />
        </TableContainer>
    );
};

export default CommonTable;
