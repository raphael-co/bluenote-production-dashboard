import React, { useRef, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CancelIcon from '@mui/icons-material/Cancel';
import RestoreIcon from '@mui/icons-material/Restore';
import SaveIcon from '@mui/icons-material/Save';
import './expertiseItem.css';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';

interface SortableExpertiseItemProps {
    id: string;
    title: string;
    description: string;
    img: string;
    index: number;
    handleSave: (id: string, data: { title: string; description: string; img: File | null }) => Promise<boolean>; // Modifié ici
}

const SortableExpertiseItem: React.FC<SortableExpertiseItemProps> = ({ id, title, description, img, index, handleSave }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const [editingBlock, setEditingBlock] = useState<boolean>(false);
    const [data, setData] = useState<{ title: string; description: string; img: File | null }>({
        title: title,
        description: description,
        img: null
    });

    const initialData = { title, description, img: null };
    const { theme } = useTheme();
    const { token } = useAuth();

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDivClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };


    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setData((prevData) => ({
                ...prevData,
                img: file,
            }));
        }
    };

    const handleReset = () => {
        setData({ ...initialData });
    };

    const colorActive = theme === 'light' ? '#007BFF' : '#bb86fc';

    const backgroundImageStyle = data && data.img ? { backgroundImage: `url(${URL.createObjectURL(data.img)})` } : { backgroundImage: `url(${img})` };


    const Save = async () => {
        try {
            if (token === null) {
                return;
            }
            const test = await handleSave(id, data);

            if (test === true) {
                setEditingBlock(false)
            }
        } catch (error) {
            console.error('Error updating block:', error);
        }
    }
    return (
        <>
            {!editingBlock ? (
                <div
                    className="expertise-item"
                    key={index}

                    style={style}

                >
                    <div className="expertise-image" style={{ backgroundImage: `url(${img})` }} />
                    <div className="expertise-content">
                        <div className="expertise-actions">
                            <IconButton onClick={() => setEditingBlock(true)} aria-label="edit" size="small">
                                <EditIcon fontSize="small" style={{ color: colorActive }} />
                            </IconButton>
                            <IconButton aria-label="delete" size="small">
                                <DeleteIcon fontSize="small" color="error" />
                            </IconButton>
                            <IconButton
                                ref={setNodeRef}
                                {...listeners}
                                {...attributes}
                                aria-label="drag" size="small">
                                <DragIndicatorIcon fontSize="small" color='warning' />
                            </IconButton>
                        </div>
                        <h3>{title.toUpperCase()}</h3>
                        <p>{description}</p>
                    </div>
                </div>
            ) : (
                <div className="expertise-item">
                    <div
                        className="expertise-image"
                        style={{
                            ...backgroundImageStyle,
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: data?.img ? '0px' : '5px',
                            border: theme === 'dark' ? '1px solid #ccc' : '1px solid #555',
                            width: '100%',
                            height: '100%',
                        }}
                        onClick={handleDivClick}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                        <AddPhotoAlternateIcon
                            className="expertise-image-add"
                            style={{ color: theme === 'dark' ? 'white' : 'black', fontSize: '50px' }}
                        />
                    </div>
                    <div className="section-expertise-container expertise-editor">
                        <div className="expertise-actions">
                            <IconButton onClick={() => setEditingBlock(false)} aria-label="cancel" size="small">
                                <CancelIcon fontSize="small" color="error" />
                            </IconButton>
                            <IconButton onClick={handleReset} aria-label="reset" size="small">
                                <RestoreIcon fontSize="small" style={{ color: colorActive }} />
                            </IconButton>
                            <IconButton onClick={Save} aria-label="save" size="small">
                                <SaveIcon fontSize="small" style={{ color: 'green' }} />
                            </IconButton>
                        </div>
                        <input
                            type="text"
                            name="title"
                            placeholder="Title"
                            value={data?.title}
                            onChange={(e) => setData((prevData) => ({
                                ...prevData,
                                title: e.target.value,
                            }))}
                            style={
                                theme === 'dark'
                                    ? { backgroundColor: '#282828', color: '#fff' }
                                    : { backgroundColor: '#fff', color: '#000' }
                            }
                        />
                        <textarea
                            rows={5}
                            name="description"
                            placeholder="Description"
                            value={data?.description}
                            onChange={(e) => setData((prevData) => ({
                                ...prevData,
                                description: e.target.value,
                            }))}
                            style={
                                theme === 'dark'
                                    ? { backgroundColor: '#282828', color: '#fff' }
                                    : { backgroundColor: '#fff', color: '#000' }
                            }
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default SortableExpertiseItem;
