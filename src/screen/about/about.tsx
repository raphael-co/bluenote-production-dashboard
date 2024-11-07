// About.tsx

import React, { useEffect, useState } from 'react';
import {
    DndContext,
    useSensor,
    useSensors,
    PointerSensor,
    KeyboardSensor,
    closestCenter,
    DragEndEvent,
    DragOverlay,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    arrayMove,
} from '@dnd-kit/sortable';
import './about.css';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

import Snackbar from '@mui/material/Snackbar';
import { CustomSnackbar } from '../tabs/Users';
import Editor from './editor';
import axios from 'axios';
import { MarkdownItem } from '../../interfaces/types';
import {
    addNewBlock,
    deleteBlockService,
    getAboutData,
    submitAboutData,
    updateAboutData,
    updateBlockContent,
    updateBlockOrder,
} from './services/aboutService';

import SortableItem from './components/SortableItem';
import { Severity } from '../../componnent/AddUserModal';

const About: React.FC = () => {
    const { token } = useAuth();
    const [title, setTitle] = useState<string>('');
    const [markdownContent, setMarkdownContent] = useState<MarkdownItem[]>([]);
    const [currentMarkdown, setCurrentMarkdown] = useState<string>('');
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [activeId, setActiveId] = useState<number | null>(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [messageStatus, setMessageStatus] = useState<Severity>('error');
    const [videoFile, setVideoFile] = useState<File | string | null>(null);
    const [dataFetched, setDataFetched] = useState(false); // Initialize to false

    const { theme } = useTheme();

    const handleChange = (markdown: string) => {
        setCurrentMarkdown(markdown);
    };

    const addOrUpdateMarkdownBlock = async () => {
        if (currentMarkdown.trim()) {
            try {
                if (editingIndex !== null) {
                    // Update block
                    const blockId = markdownContent[editingIndex].id;

                    const response = await updateBlockContent(blockId, currentMarkdown, token);

                    setMessageStatus('success');
                    setErrorMessage(response.message);
                    setOpenSnackbar(true);

                    setMarkdownContent((prevContent) =>
                        prevContent.map((item, index) =>
                            index === editingIndex ? { ...item, content: currentMarkdown } : item
                        )
                    );

                    setEditingIndex(null);
                } else {
                    // Add new block
                    const response = await addNewBlock(currentMarkdown, token);

                    setMessageStatus('success');
                    setErrorMessage(response.message);
                    setOpenSnackbar(true);

                    setMarkdownContent((prevContent) => [
                        ...prevContent,
                        { id: response.blockId, content: currentMarkdown },
                    ]);
                }
            } catch (error) {
                setMessageStatus('error');
                if (axios.isAxiosError(error) && error.response) {
                    setErrorMessage(error.response.data.message || 'An error occurred');
                } else {
                    setErrorMessage('Network error or server unavailable');
                }
                setOpenSnackbar(true);
                return;
            }
            setCurrentMarkdown('');
        }
    };

    const editMarkdownBlock = (index: number) => {
        setCurrentMarkdown(markdownContent[index].content);
        setEditingIndex(index);
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: { active: { id: number | string } }) => {
        setActiveId(Number(event.active.id));
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (over && active.id !== over.id) {
            setMarkdownContent((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                const newItems = arrayMove(items, oldIndex, newIndex);

                // After updating local state, send the updated order to the backend
                updateBlockOrderInBackend(newItems);

                return newItems;
            });
        }
    };

    const updateBlockOrderInBackend = async (items: MarkdownItem[]) => {
        try {
            await updateBlockOrder(items, token);
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

    const handleVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setVideoFile(file);
        }
    };

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const result = await getAboutData();

                if (result.status !== 'success') {
                    throw new Error('Failed to fetch projects');
                }

                setTitle(result.data.title);
                setVideoFile(result.data.backgroundUrl);
                setMarkdownContent(
                    result.data.about_blocks
                        .sort((a: any, b: any) => a.order_index - b.order_index)
                        .map((block: any) => ({
                            id: block.id,
                            content: block.description,
                        }))
                );
                setDataFetched(true); // Data exists
            } catch (error) {
                console.error('Error fetching data:', error);
                setDataFetched(false); // Data does not exist
            }
        };

        fetchProjects();
    }, []);

    const handleSubmit = async () => {
        try {
            let response;
            if (dataFetched) {
                // Data exists, use PATCH to update
                response = await updateAboutData(title, videoFile, token);
            } else {
                // Data does not exist, use POST to create
                response = await submitAboutData(title, videoFile, token);
                setDataFetched(true); // Set dataFetched to true after creating data
            }
            setMessageStatus('success');
            setErrorMessage(response.message);
            setOpenSnackbar(true);
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

    const deleteBlock = async (id: number) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this block?');

        if (!confirmDelete) {
            return;
        }

        try {
            const response = await deleteBlockService(id, token);

            setMessageStatus('success');
            setErrorMessage(response.message || 'Block deleted successfully');
            setOpenSnackbar(true);

            setMarkdownContent((prevContent) => prevContent.filter((block) => block.id !== id));
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

    return (
        <div className="EditMarkdown-container">
            <div
                className="section-editMarker-container"
                style={{ maxHeight: '600px', width: '100%', padding: '20px' }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <h1>About Editor</h1>
                    {videoFile ? (
                        <div style={{ position: 'relative' }}>
                            <button
                                color="red"
                                style={{
                                    zIndex: '1',
                                    position: 'absolute',
                                    top: '0',
                                    right: '0',
                                    cursor: 'pointer',
                                }}
                                onClick={() => setVideoFile(null)}
                            >
                                X
                            </button>

                            <video
                                src={
                                    typeof videoFile === 'string' ? videoFile : URL.createObjectURL(videoFile)
                                }
                                style={{
                                    width: '300px',
                                    height: 'auto',
                                    marginBottom: '20px',
                                }}
                                controls
                            />
                        </div>
                    ) : (
                        <input
                            type="file"
                            accept="video/*"
                            onChange={handleVideoChange}
                            style={{ marginBottom: '20px' }}
                        />
                    )}
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
                <button onClick={handleSubmit}>{dataFetched ? 'Update' : 'Submit'}</button>

                {dataFetched && (
                    <>
                        <hr style={{ width: '100%' }} />
                        <Editor currentMarkdown={currentMarkdown} handleChange={handleChange} />

                        <button onClick={addOrUpdateMarkdownBlock} style={{ marginBottom: '20px' }}>
                            {editingIndex !== null ? 'Update' : 'Add'}
                        </button>

                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={markdownContent.map((item) => item.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div
                                    style={{
                                        padding: '10px',
                                        background: 'transparent',
                                        border: '1px solid #ccc',
                                    }}
                                >
                                    <h4>Organisation des blocks:</h4>
                                    {markdownContent.map((item, index) => (
                                        <SortableItem
                                            key={item.id}
                                            id={item.id}
                                            content={item.content}
                                            index={index}
                                            editMarkdownBlock={editMarkdownBlock}
                                            deleteBlock={deleteBlock}
                                        />
                                    ))}
                                </div>
                            </SortableContext>

                            <DragOverlay>
                                {activeId ? (
                                    <div
                                        style={{
                                            padding: '10px',
                                            border: '1px solid #ccc',
                                            backgroundColor: '#f0f0f0',
                                        }}
                                    >
                                        {markdownContent.find((item) => item.id === activeId)?.content}
                                    </div>
                                ) : null}
                            </DragOverlay>
                        </DndContext>
                    </>
                )}
            </div>
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

export default About;
