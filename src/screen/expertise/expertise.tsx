// About.tsx

import React, { useEffect, useRef, useState } from 'react';
import './expertise.css';
import { useTheme } from '../../context/ThemeContext';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import Snackbar from '@mui/material/Snackbar';
import { CustomSnackbar } from '../tabs/Users';
import { Severity } from '../../componnent/AddUserModal';
import { getExpertiseData, submitExpertiseData, updateExpertiseData } from './services/expertiseService';
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

    const [blocks, setBlocks] = useState([
        {
            img: 'https://cdn.b12.io/client_media/S4rnTgpV/a46e7846-7a86-11ef-ae7d-0242ac110002-06-regular_image.png',
            title: 'Commercials',
            description: 'We create your advertisements, by adopting the best visual and narrative strategy to boost your communication campaigns.',
        },
        {
            img: 'https://cdn.b12.io/client_media/S4rnTgpV/bc552b00-6bbb-11ef-bd08-0242ac110002-21-regular_image.png',
            title: 'Music videos',
            description: 'We produce innovative, creative music videos with a unique and thoughtful artistic vision that you won’t find anywhere else.',
        },
        {
            img: 'https://cdn.b12.io/client_media/S4rnTgpV/0c69ad8c-5aff-11ef-82ff-0242ac110002-46-regular_image.png',
            title: 'Fiction and Documentary',
            description: 'We create films with original scripts and bold direction, and produce impactful documentaries that blend art, reality, and strong storytelling.',
        },
        {
            img: 'https://cdn.b12.io/client_media/S4rnTgpV/b3008d8a-7a82-11ef-ac3b-0242ac110002-38-regular_image.png',
            title: '3D & 2D animation',
            description: 'We collaborate with talented animators from the most prestigious school for your 3D and 2D projects.',
        },
    ]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setBlocks((items) => {
                const oldIndex = items.findIndex((item) => item.title === active.id);
                const newIndex = items.findIndex((item) => item.title === over.id);
                return arrayMove(items, oldIndex, newIndex);
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

                setTitle(result.data.title);
                setDescription(result.data.description);

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

    const handleAddBlock = () => {
        // Vérifiez que data contient bien des informations valides avant d'ajouter
        if (data.title && data.description && data.img) {
            setBlocks((prevBlocks) => [
                ...prevBlocks,
                {
                    img: data.img ? URL.createObjectURL(data.img) : '',
                    title: data.title,
                    description: data.description,
                },
            ]);

            // Réinitialise data après l'ajout
            setData({
                title: '',
                description: '',
                img: null,
            });
        } else {
            setErrorMessage('Please fill in all the required fields');
            setMessageStatus('error');
            setOpenSnackbar(true)
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
                            <SortableContext items={blocks.map((item) => item.title)} strategy={verticalListSortingStrategy}>
                                {blocks.map((block, index) => (
                                    <SortableExpertiseItem
                                        key={block.title}
                                        id={block.title}
                                        title={block.title}
                                        description={block.description}
                                        img={block.img} index={index} />
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
