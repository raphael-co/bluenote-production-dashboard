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
