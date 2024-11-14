// About.tsx

import React, { useEffect, useRef, useState } from 'react';
import './expertise.css';
import { useTheme } from '../../context/ThemeContext';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import Snackbar from '@mui/material/Snackbar';
import { CustomSnackbar } from '../tabs/Users';
import { Severity } from '../../componnent/AddUserModal';
import { addExpertiseBlock, deleteExpertiseBlock, getExpertiseData, submitExpertiseData, updateBlocksOrder, updateExpertiseBlock, updateExpertiseData } from './services/expertiseService';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import {
    DndContext,
    useSensor,
    useSensors,
    PointerSensor,
    KeyboardSensor,
    closestCenter,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    arrayMove,
} from '@dnd-kit/sortable';
import SortableExpertiseItem from './component/expertiseItem';
import ControlPointIcon from '@mui/icons-material/ControlPoint';

const Expertise: React.FC = () => {
    const [title, setTitle] = useState<string>('');
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [messageStatus, setMessageStatus] = useState<Severity>('error');
    const [description, setDescription] = useState<string>('');
    const { theme } = useTheme();
    const { token } = useAuth();
    const [dataFetched, setDataFetched] = useState(false);
    const [data, setData] = useState<{ title: string; description: string, img: File | null }>({
        title: '',
        description: '',
        img: null
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [blocks, setBlocks] = useState<{ id: string; image_url: string; block_title: string; block_description: string, order_index: number }[]>([
    ]
    );

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setBlocks((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                const updatedItems = arrayMove(items, oldIndex, newIndex);

                // Met à jour les order_index en fonction du nouvel ordre
                const reorderedItems = updatedItems.map((item, index) => ({
                    ...item,
                    order_index: index,
                }));

                // Sauvegarde des order_index mis à jour dans la base de données
                if (token) {
                    updateBlocksOrder(reorderedItems.map(({ id, order_index }) => ({ id, order_index })), token)
                        .then((response) => {
                            if (response.status === 'success') {
                                setMessageStatus('success');
                                setErrorMessage(response.message || 'Block added successfully');
                            } else {
                                setMessageStatus('error');
                                setErrorMessage(response.message || 'An error occurred');
                            }
                        })
                        .catch((error) => {
                            console.error('Error updating order indices on server:', error);
                        });
                }

                setOpenSnackbar(true);
                return reorderedItems;
            });
        }
    };
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const result = await getExpertiseData();

                if (result.status !== 'success') {
                    throw new Error('Failed to fetch projects');
                }

                setTitle(result.data.expertise.title);
                setDescription(result.data.expertise.description);

                setBlocks(result.data.blocks);
                setDataFetched(true); // Data exists
            } catch (error) {
                console.error('Error fetching data:', error);
                setDataFetched(false); // Data does not exist
            }
        };

        fetchProjects();
    }, []);

    const handleSubmit = async () => {
        let response: any;
        try {
            // Data does not exist, use POST to create
            if (dataFetched) {
                response = await updateExpertiseData(title, description, token);
                setMessageStatus('success');
                setErrorMessage(response.message);
                setOpenSnackbar(true);
            } else {
                response = await submitExpertiseData(title, description, token);
                setMessageStatus('success');
                setErrorMessage(response.message);
                setOpenSnackbar(true);
                setDataFetched(true);
            }

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


    const handleDivClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const backgroundImageStyle = data && data.img ? { backgroundImage: `url(${URL.createObjectURL(data.img)})` } : {};
    const colorActive = theme === 'light' ? '#007BFF' : '#bb86fc';
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setData((prevData) => ({
                ...prevData,
                img: file,
            }));
            console.log("Fichier sélectionné :", file);
        }
    };

    const handleAddBlock = async () => {
        // Vérifiez que data contient bien des informations valides avant d'ajouter
        if (data.img && token) {
            try {
                // Appel de la route pour ajouter un bloc d'expertise
                const response = await addExpertiseBlock(data.title, data.description, data.img, token, blocks.length.toString());

                if (response.status === 'success') {
                    setBlocks((prevBlocks) => [
                        ...prevBlocks,
                        {
                            id: response.data.id,
                            image_url: response.data.image_url, // Utilisez l'URL renvoyée par le backend
                            block_title: data.title,
                            block_description: data.description,
                            order_index: blocks.length
                        },
                    ]);

                    // Réinitialise data après l'ajout
                    setData({
                        title: '',
                        description: '',
                        img: null,
                    });
                    setMessageStatus('success');
                    setErrorMessage(response.message || 'Block added successfully');
                } else {
                    setMessageStatus('error');
                    setErrorMessage(response.message || 'An error occurred');
                }
            } catch (error) {
                setMessageStatus('error');
                if (axios.isAxiosError(error) && error.response) {
                    setErrorMessage(error.response.data.message || 'An error occurred');
                } else {
                    setErrorMessage('Network error or server unavailable');
                }
            }
            setOpenSnackbar(true);
        } else {
            setErrorMessage('Please select an image.');
            setMessageStatus('error');
            setOpenSnackbar(true);
        }
    };


    const handleSave = async (id: string, data: { title: string; description: string; img: File | null }) => {
        try {
            if (token === null) {
                return false;
            }

            const response = await updateExpertiseBlock(id, data.title, data.description, data.img, token);

            if (response.status === 'success') {
                setBlocks((prevBlocks) =>
                    prevBlocks.map((block) =>
                        block.id === id
                            ? {
                                ...block,
                                image_url: response.data.image_url, // URL de l'image mise à jour
                                block_title: data.title,
                                block_description: data.description,
                            }
                            : block
                    )
                );

                setMessageStatus('success');
                setErrorMessage(response.message || 'Block update successfully');
                setOpenSnackbar(true);

                return true
            } else {
                setMessageStatus('error');
                setErrorMessage(response.message || 'An error occurred');
                setOpenSnackbar(true);
                return false
            }
        } catch (error) {
            setMessageStatus('error');
            if (axios.isAxiosError(error) && error.response) {
                setErrorMessage(error.response.data.message || 'An error occurred');
            } else {
                setErrorMessage('Network error or server unavailable');
            }
            setOpenSnackbar(true);
            return false
        }

    };

    const handleDelete = async (id: string) => {
        if (!token) {
            return false;
        }
    
        try {
            const response = await deleteExpertiseBlock(id, token);
    
            if (response.status === 'success') {
                setBlocks((prevBlocks) => prevBlocks.filter((block) => block.id !== id));
                setMessageStatus('success');
                setErrorMessage(response.message || 'Block deleted successfully');
            } else {
                setMessageStatus('error');
                setErrorMessage(response.message || 'An error occurred');
            }
        } catch (error) {
            setMessageStatus('error');
            setErrorMessage(
                axios.isAxiosError(error) && error.response
                    ? error.response.data.message || 'An error occurred'
                    : 'Network error or server unavailable'
            );
        } finally {
            setOpenSnackbar(true);
        }
    };
    

    return (
        <div className="expertise-container">
            <div
                className="section-expertise-container"
                style={{ maxHeight: '600px', width: '100%' }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <h1>Expertise Editor</h1>
                </div>
                <input
                    type="text"
                    name="title"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={
                        theme === 'dark'
                            ? { backgroundColor: '#282828', color: '#fff' }
                            : { backgroundColor: '#fff', color: '#000' }
                    }
                />
                <textarea
                    rows={4}
                    name="description"
                    placeholder="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={
                        theme === 'dark'
                            ? { backgroundColor: '#282828', color: '#fff' }
                            : { backgroundColor: '#fff', color: '#000' }
                    }
                />

                <button
                    onClick={handleSubmit}
                    style={
                        theme === 'dark'
                            ? { backgroundColor: '#282828', color: '#fff' }
                            : { backgroundColor: '#fff', color: '#000' }
                    }
                >
                    {dataFetched ? 'Update' : 'Submit'}
                </button>
            </div>
            {
                dataFetched &&
                <div style={{ maxWidth: '1024px' }}>
                    <div>
                        <h1 style={{ color: '#e44c4e', textAlign: 'start' }}>{title.toUpperCase()}</h1>
                        <p>{description}</p>
                    </div>
                    <div className="expertise">
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={blocks.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                                {blocks.length > 0 && blocks.map((block, index) => (
                                    <SortableExpertiseItem
                                        handleSave={handleSave}
                                        onDelete={handleDelete}
                                        key={index}
                                        id={block.id}
                                        title={block.block_title}
                                        description={block.block_description}
                                        img={block.image_url}
                                        index={index}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                        <div className="expertise-item">
                            {/* https://tse4.mm.bing.net/th?id=OIP.jtst5ep_OqIJ8PZ2yBTMgQHaHa&pid=Api */}
                            <div className="expertise-image" style={{
                                ...backgroundImageStyle, cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderRadius: data?.img ? '0px' : '5px',
                                border: data?.img ? 'none' : theme === 'dark' ? '1px solid #ccc' : '1px solid #555',
                                width: '100%',
                                height: '100%',

                            }} onClick={handleDivClick}>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={handleFileChange}
                                />

                                {(!data || !data.img) && (
                                    <AddPhotoAlternateIcon
                                        className="expertise-image-add"
                                        style={{ color: theme === 'dark' ? 'white' : 'black', fontSize: '50px' }}
                                    />
                                )}

                            </div>
                            <div className="section-expertise-container expertise-editor">
                                {/* <h3>{'OUR WORK'.toUpperCase()}</h3>
                                <p>{"description"}</p> */}
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
                                    placeholder="description"
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
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                width: '100%',
                            }}
                        >
                            <div
                                style={{
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '50%',
                                    // border: `1px solid ${colorActive}`,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    // color: colorActive,
                                }}
                                className='expertise-add'
                                onClick={handleAddBlock} // Ajoutez l'appel à handleAddBlock ici
                            >
                                <ControlPointIcon sx={{ width: '100%', height: '100%', color: colorActive }} />
                            </div>
                        </div>

                        {/* <button>
                            add
                        </button> */}
                    </div>
                </div>
            }
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

export default Expertise;
