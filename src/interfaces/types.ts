export interface MarkdownItem {
    id: number;
    content: string;
}

export interface SortableItemProps {
    id: number;
    content: string;
    index: number;
    editMarkdownBlock: (index: number) => void;
    deleteBlock: (id: number, token: string | null) => void;
}

export interface SortableExpertiseProps {
    id: number;
    title: string;
    description: string;
    block : SortableExpertiseBlockProps
    index: number;
    editBlock: (index: number) => void;
    deleteBlock: (id: number, token: string | null) => void;
}

export interface SortableExpertiseBlockProps {
    id?: number;
    title: string;
    description: string;
    img: string;
    index: number;
}