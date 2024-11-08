import React, { useState, useRef, useEffect } from 'react';
import styles from './Home.module.scss';
import Tooltip from '@mui/material/Tooltip'

// Importation des icônes MUI
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import FormatAlignJustifyIcon from '@mui/icons-material/FormatAlignJustify';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import SuperscriptIcon from '@mui/icons-material/Superscript';
import SubscriptIcon from '@mui/icons-material/Subscript';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import OpacityIcon from '@mui/icons-material/Opacity';

interface EditorProps {
    handleChange: (markdown: string) => void;
    currentMarkdown: string;
}

const Editor: React.FC<EditorProps> = ({ handleChange, currentMarkdown }) => {
    const [textColor, setTextColor] = useState<string>('#000000');
    const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff');
    const [zoom, setZoom] = useState<number>(1);
    const [fontSize, setFontSize] = useState<number>(3);
    const [fontFamily, setFontFamily] = useState<string>('Arial');
    const [selectedHr, setSelectedHr] = useState<HTMLHRElement | null>(null);
    const [imageSize, setImageSize] = useState<{ width: number; height: number }>({
        width: 0,
        height: 0,
    });
    const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
    const editorRef = useRef<HTMLDivElement | null>(null);
    const colorInputRef = useRef<HTMLInputElement>(null);
    const backgroundColorInputRef = useRef<HTMLInputElement>(null);
    const isUpdatingRef = useRef(false);

    useEffect(() => {
        // Mettre à jour le contenu de l'éditeur si currentMarkdown change
        if (editorRef.current && !isUpdatingRef.current) {
            if (editorRef.current.innerHTML !== currentMarkdown) {
                editorRef.current.innerHTML = currentMarkdown;
            }
        }
    }, [currentMarkdown]);

    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
        // Éviter les boucles infinies lors de la mise à jour
        isUpdatingRef.current = true;
        handleChange(e.currentTarget.innerHTML);
        isUpdatingRef.current = false;
    };

    const execCommand = (command: string, value?: string) => {
        document.execCommand(command, false, value);
    };

    const formatText = {
        bold: () => execCommand('bold'),
        italic: () => execCommand('italic'),
        underline: () => execCommand('underline'),
        strikethrough: () => execCommand('strikeThrough'),
        bulletList: () => execCommand('insertUnorderedList'),
        numberedList: () => execCommand('insertOrderedList'),
        alignLeft: () => execCommand('justifyLeft'),
        justify: () => execCommand('justifyFull'),
        alignCenter: () => execCommand('justifyCenter'),
        alignRight: () => execCommand('justifyRight'),
        changeTextColor: (color: string) => {
            execCommand('foreColor', color);
            if (selectedHr) selectedHr.style.borderColor = color;
        },
        changeBackgroundColor: (color: string) => {
            execCommand('hiliteColor', color);
        },

        transparentBackground: () => {
            execCommand('hiliteColor', 'transparent');
        },
        insertHorizontalRule: () => {
            const selection = window.getSelection();
            const range = selection ? selection.getRangeAt(0) : null;
            if (range) {
                const hrElem = document.createElement('hr');
                hrElem.style.border = '1px solid black';
                hrElem.addEventListener('click', (e) => {
                    setSelectedHr(e.target as HTMLHRElement);
                });
                range.insertNode(hrElem);
            }
        },
        insertLink: () => {
            const url = prompt('Entrez l\'URL du lien :', 'http://');
            if (url) {
                execCommand('createLink', url);
            }
        },
        undo: () => execCommand('undo'),
        redo: () => execCommand('redo'),
        superscript: () => execCommand('superscript'),
        subscript: () => execCommand('subscript'),
        insertImage: () => {
            const imageUrl = prompt('Entrez l\'URL de l\'image :', 'http://');
            if (imageUrl) {
                execCommand('insertImage', imageUrl);
            }
        },
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            execCommand('indent');
        }
    };

    const handleZoom = (zoomIn: boolean) => {
        setZoom((prevZoom) => {
            const newZoom = zoomIn ? prevZoom + 0.1 : prevZoom - 0.1;
            return Math.min(Math.max(newZoom, 0.5), 3);
        });
    };

    const handleChangeFontSize = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSize = parseInt(e.target.value);
        setFontSize(newSize);
        execCommand('fontSize', newSize.toString());
    };

    const handleChangeFontFamily = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newFont = e.target.value;
        setFontFamily(newFont);
        execCommand('fontName', newFont);
    };

    useEffect(() => {
        if (selectedHr) {
            selectedHr.style.borderWidth = '3px';

            const resetBorderWidth = (e: MouseEvent) => {
                if (e.target !== selectedHr && (e.target as HTMLElement).id !== 'colorInput') {
                    selectedHr.style.borderWidth = '1px';
                    setSelectedHr(null);
                    document.removeEventListener('click', resetBorderWidth);
                }
            };
            document.addEventListener('click', resetBorderWidth);
        }
    }, [selectedHr]);

    const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        if (target && target.tagName === 'IMG') {
            setSelectedImage(target as HTMLImageElement);
        } else if (target.id !== 'image_select' && selectedImage) {
            if (editorRef.current) {
                const width = (imageSize.width / editorRef.current.offsetWidth) * 100;
                const height = (imageSize.height / editorRef.current.offsetHeight) * 100;
                selectedImage.style.width = `${width}%`;
                selectedImage.style.height = `${height}%`;
            }
            setSelectedImage(null);
        }
    };

    const adjustImageSize = (increase: boolean) => {
        if (selectedImage && editorRef.current) {
            const delta = increase ? 20 : -20;
            const newWidth = selectedImage.offsetWidth + delta;
            const newHeight = selectedImage.offsetHeight + delta;

            if (newWidth > 0 && newHeight > 0) {
                selectedImage.style.width = `${newWidth}px`;
                selectedImage.style.height = `${newHeight}px`;
                setImageSize({ width: newWidth, height: newHeight });
            }
        }
    };

    const handleResizeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (!selectedImage) return;

        const initialMouseX = e.clientX;
        const initialMouseY = e.clientY;
        const initialWidth = selectedImage.offsetWidth;
        const initialHeight = selectedImage.offsetHeight;

        const handleMouseMove = (e: MouseEvent) => {
            const dx = e.clientX - initialMouseX;
            const dy = e.clientY - initialMouseY;
            const newWidth = initialWidth + dx;
            const newHeight = initialHeight + dy;

            if (newWidth > 0 && newHeight > 0) {
                selectedImage.style.width = `${newWidth}px`;
                selectedImage.style.height = `${newHeight}px`;
                setImageSize({ width: newWidth, height: newHeight });
            }
        };

        const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    return (
        <div className={styles.articleContainer}>
            <div className={styles.toolbar} style={{ gap: '2px', display: 'flex', flexWrap: 'wrap', marginBottom: '10px' }}>
                <Tooltip title="Zoom avant">
                    <button onClick={() => handleZoom(true)}>
                        <ZoomInIcon />
                    </button>
                </Tooltip>
                <Tooltip title="Zoom arrière">
                    <button onClick={() => handleZoom(false)}>
                        <ZoomOutIcon />
                    </button>
                </Tooltip>
                <Tooltip title="Taille de police">
                    <select value={fontSize} onChange={handleChangeFontSize}>
                        {[...Array(7)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>{i + 1}</option>
                        ))}
                    </select>
                </Tooltip>
                <Tooltip title="Police de caractères">
                    <select value={fontFamily} onChange={handleChangeFontFamily}>
                        {['Arial', 'Times New Roman', 'Verdana', 'Georgia', 'Courier New', 'Comic Sans MS', 'Tahoma', 'Helvetica'].map(font => (
                            <option key={font} value={font}>{font}</option>
                        ))}
                    </select>
                </Tooltip>
                <Tooltip title="Gras">
                    <button onClick={formatText.bold}>
                        <FormatBoldIcon />
                    </button>
                </Tooltip>
                <Tooltip title="Italique">
                    <button onClick={formatText.italic}>
                        <FormatItalicIcon />
                    </button>
                </Tooltip>
                <Tooltip title="Souligné">
                    <button onClick={formatText.underline}>
                        <FormatUnderlinedIcon />
                    </button>
                </Tooltip>
                <Tooltip title="Barré">
                    <button onClick={formatText.strikethrough}>
                        <StrikethroughSIcon />
                    </button>
                </Tooltip>
                <Tooltip title="Liste à puces">
                    <button onClick={formatText.bulletList}>
                        <FormatListBulletedIcon />
                    </button>
                </Tooltip>
                <Tooltip title="Liste numérotée">
                    <button onClick={formatText.numberedList}>
                        <FormatListNumberedIcon />
                    </button>
                </Tooltip>
                <Tooltip title="Aligner à gauche">
                    <button onClick={formatText.alignLeft}>
                        <FormatAlignLeftIcon />
                    </button>
                </Tooltip>
                <Tooltip title="Justifier">
                    <button onClick={formatText.justify}>
                        <FormatAlignJustifyIcon />
                    </button>
                </Tooltip>
                <Tooltip title="Centrer">
                    <button onClick={formatText.alignCenter}>
                        <FormatAlignCenterIcon />
                    </button>
                </Tooltip>
                <Tooltip title="Aligner à droite">
                    <button onClick={formatText.alignRight}>
                        <FormatAlignRightIcon />
                    </button>
                </Tooltip>
                <Tooltip title="Agrandir l'image">
                    <button onClick={() => adjustImageSize(true)}>
                        <AddPhotoAlternateIcon />
                    </button>
                </Tooltip>
                <Tooltip title="Réduire l'image">
                    <button onClick={() => adjustImageSize(false)}>
                        <AddPhotoAlternateIcon style={{ transform: 'rotate(180deg)' }} />
                    </button>
                </Tooltip>
                <Tooltip title="Insérer une ligne horizontale">
                    <button onClick={formatText.insertHorizontalRule}>
                        <HorizontalRuleIcon />
                    </button>
                </Tooltip>
                <Tooltip title="Couleur du texte">
                    <button onClick={() => colorInputRef.current?.click()}>
                        <ColorLensIcon style={{ color: textColor }} />
                    </button>
                </Tooltip>
                <input
                    id="colorInput"
                    ref={colorInputRef}
                    type="color"
                    value={textColor}
                    style={{ display: 'none' }}
                    onChange={(e) => {
                        setTextColor(e.target.value);
                        formatText.changeTextColor(e.target.value);
                    }}
                />
                <Tooltip title="Couleur de fond">
                    <button onClick={() => backgroundColorInputRef.current?.click()}>
                        <FormatColorFillIcon style={{ color: backgroundColor }} />
                    </button>
                </Tooltip>
                <Tooltip title="Fond transparent">
                    <button onClick={formatText.transparentBackground}>
                        <OpacityIcon />
                    </button>
                </Tooltip>
                <input
                    ref={backgroundColorInputRef}
                    type="color"
                    value={backgroundColor}
                    style={{ display: 'none' }}
                    onChange={(e) => {
                        setBackgroundColor(e.target.value);
                        formatText.changeBackgroundColor(e.target.value);
                    }}
                />
                <Tooltip title="Insérer un lien">
                    <button onClick={formatText.insertLink}>
                        <InsertLinkIcon />
                    </button>
                </Tooltip>
                <Tooltip title="Annuler">
                    <button onClick={formatText.undo}>
                        <UndoIcon />
                    </button>
                </Tooltip>
                <Tooltip title="Rétablir">
                    <button onClick={formatText.redo}>
                        <RedoIcon />
                    </button>
                </Tooltip>
                <Tooltip title="Exposant">
                    <button onClick={formatText.superscript}>
                        <SuperscriptIcon />
                    </button>
                </Tooltip>
                <Tooltip title="Indice">
                    <button onClick={formatText.subscript}>
                        <SubscriptIcon />
                    </button>
                </Tooltip>
                <Tooltip title="Insérer une image">
                    <button onClick={formatText.insertImage}>
                        <InsertPhotoIcon />
                    </button>
                </Tooltip>
            </div>
            <div
                style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                }}
            >
                <div
                    id="Page"
                    ref={editorRef}
                    contentEditable={true}
                    onClick={handleImageClick}
                    className={styles.input}
                    onKeyDown={handleKeyDown}
                    onInput={handleInput}
                    style={{
                        border: '1px solid #ccc',
                        minHeight: '300px',
                        width: '100%',
                        padding: '10px',
                        transform: `scale(${zoom})`,
                        transformOrigin: 'top center',
                        fontSize: '12pt',
                    }}
                >
                    {selectedImage && (
                        <div
                            id="image_select"
                            className={styles.resize_handle}
                            style={{
                                position: 'absolute',
                                left: selectedImage.offsetLeft + selectedImage.offsetWidth,
                                top: selectedImage.offsetTop + selectedImage.offsetHeight,
                            }}
                            onMouseDown={handleResizeMouseDown}
                        ></div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Editor;
