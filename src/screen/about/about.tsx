import React, { useState } from 'react';
import {
    DndContext,
    useSensor,
    useSensors,
    PointerSensor,
    KeyboardSensor,
    closestCenter,
    DragEndEvent,
    DragOverlay
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    arrayMove,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { v4 as uuidv4 } from 'uuid';
import './about.css';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Severity } from '../../componnent/AddUserModal';
import axios from 'axios';
import Snackbar from '@mui/material/Snackbar/Snackbar';
import { CustomSnackbar } from '../tabs/Users';
import Editor from './editor';

interface MarkdownItem {
    id: string;
    content: string;
}

interface SortableItemProps {
    id: string;
    content: string;
    index: number;
    editMarkdownBlock: (index: number) => void;
}

const SortableItem: React.FC<SortableItemProps> = ({ id, content, index, editMarkdownBlock }) => {
    const { theme } = useTheme();

    const colorActive = theme === 'light' ? '#007BFF' : '#bb86fc';

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        padding: '10px',
        margin: '5px 0',
        border: '1px solid #ccc',
        position: 'relative',
        backgroundColor: isDragging ? '#e0e0e0' : 'transparent',
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <div style={{ display: 'flex', justifyContent: 'end' }} onClick={(e) => {
                e.stopPropagation();
            }}>
                <button
                    style={{
                        border: 'none',
                        color: colorActive,
                        width: '30px',
                        height: '30px',
                        cursor: 'grab',
                        padding: '5px',
                        backgroundColor: 'transparent',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: '10px',
                    }}
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        editMarkdownBlock(index);
                    }}
                >
                    ✎
                </button>
                <div
                    {...listeners}
                    style={{
                        width: '30px',
                        height: '30px',
                        cursor: 'grab',
                        padding: '5px',
                        backgroundColor: 'transparent',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: '10px',
                    }}
                >
                    &#x2630;
                </div>

            </div>

            <div dangerouslySetInnerHTML={{ __html: content }} />

        </div>
    );
};

const About: React.FC = () => {
    const { token } = useAuth();
    const [title, setTitle] = useState<string>('');
    const { theme } = useTheme();
    const [markdownContent, setMarkdownContent] = useState<MarkdownItem[]>([]);
    const [currentMarkdown, setCurrentMarkdown] = useState<string>('');
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [messageStatus, setMessageStatus] = useState<Severity>('error');
    const [videoFile, setVideoFile] = useState<File | null>(null);

    const handleChange = (markdown: string) => {
        setCurrentMarkdown(markdown);
    };

    const addOrUpdateMarkdownBlock = () => {
        if (currentMarkdown.trim()) {
            if (editingIndex !== null) {
                setMarkdownContent((prevContent) =>
                    prevContent.map((item, index) =>
                        index === editingIndex ? { ...item, content: currentMarkdown } : item
                    )
                );
                setEditingIndex(null);
            } else {
                setMarkdownContent((prevContent) => [
                    ...prevContent,
                    { id: uuidv4(), content: currentMarkdown },
                ]);
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

    const handleDragStart = (event: { active: { id: string | number } }) => {
        setActiveId(event.active.id as string); // Conversion explicite en string
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (over && active.id !== over.id) {
            setMarkdownContent((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setVideoFile(file);
        }
    };

    const handleSubmit = async () => {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('blocks', JSON.stringify(markdownContent));

        if (videoFile) {
            formData.append('backgroundUrl', videoFile);
        }

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/about`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`,
                },
            });
            setMessageStatus('success');
            setErrorMessage(response.data.message);
            setOpenSnackbar(true);
        } catch (error) {
            setMessageStatus('error');
            if (axios.isAxiosError(error) && error.response) {
                if (error.response.data.message) {
                    setErrorMessage(error.response.data.message);
                } else {
                    const apiErrors = error.response.data.errors || {};
                    const errorMessages = Object.values(apiErrors).join(', ');
                    setErrorMessage(errorMessages || 'An unexpected error occurred');
                }
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1>About Editor</h1>
                    <button onClick={handleSubmit}>Submit</button>
                </div>
                <input
                    type="text"
                    name="title"
                    id="title"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={
                        theme === 'dark'
                            ? { backgroundColor: '#282828', color: '#fff' }
                            : { backgroundColor: '#fff', color: '#000' }
                    }
                />

                <Editor currentMarkdown={currentMarkdown} handleChange={handleChange} />

                <button onClick={addOrUpdateMarkdownBlock} style={{ marginBottom: '20px' }}>
                    {editingIndex !== null ? 'Update' : 'Add'}
                </button>

                <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    style={{ marginBottom: '20px' }}
                />

                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                    <SortableContext
                        items={markdownContent.map((item) => item.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div style={{ padding: '10px', background: 'transparent', border: '1px solid #ccc' }}>
                            <h4>Organisation des blocks:</h4>
                            {markdownContent.map((item, index) => (
                                <SortableItem
                                    key={item.id}
                                    id={item.id}
                                    content={item.content}
                                    index={index}
                                    editMarkdownBlock={editMarkdownBlock}
                                />
                            ))}
                        </div>
                    </SortableContext>

                    <DragOverlay>
                        {activeId ? (
                            <div style={{ padding: '10px', border: '1px solid #ccc', backgroundColor: '#f0f0f0' }}>
                                {markdownContent.find((item) => item.id === activeId)?.content}
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>
            <Snackbar
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

export default About;
