import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './expertiseItem.css';
interface SortableExpertiseItemProps {
    id: string;
    title: string;
    description: string;
    img: string;
    index: number;
}

const SortableExpertiseItem: React.FC<SortableExpertiseItemProps> = ({ id, title, description, img, index }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        // <div key={index} ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <div className="expertise-item" key={index} ref={setNodeRef} style={style} {...attributes} {...listeners}>
                <div className="expertise-image" style={{ backgroundImage: `url(${img})` }} />
                <div className="expertise-content">
                    <h3>{title.toUpperCase()}</h3>
                    <p>{description}</p>
                </div>
            {/* </div> */}
        </div>
    );
};

export default SortableExpertiseItem;
