// components/SortableItem.tsx

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableItemProps } from '../../../interfaces/types';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';

const SortableItem: React.FC<SortableItemProps> = ({ id, content, index, editMarkdownBlock, deleteBlock }) => {
    const { theme } = useTheme();
    const { token } = useAuth();
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
            <div
                style={{ display: 'flex', justifyContent: 'end', gap: '10px' }}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    style={{
                        border: 'none',
                        color: colorActive,
                        width: '30px',
                        height: '30px',
                        cursor: 'pointer',
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

                <button
                    style={{
                        border: 'none',
                        color: colorActive,
                        width: '30px',
                        height: '30px',
                        cursor: 'pointer',
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
                        deleteBlock(Number(id), token);
                    }}
                >
                    DELETE
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

export default SortableItem;
