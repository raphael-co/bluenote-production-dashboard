import React, { useRef, forwardRef, useImperativeHandle, useState, PropsWithChildren } from 'react';
import './BottomSheetFilter.css';
import { useTheme } from '../../../context/ThemeContext';

import { darkTheme, lightTheme } from '../map/theme/filter';

import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';

interface BottomSheetProps {
    onVisibilityChange: (visibility: string) => void;
    onTypeChange: (types: string[]) => void;
}

const BottomSheetMap = forwardRef((props: PropsWithChildren<BottomSheetProps>, ref) => {
    const sheetRef = useRef<HTMLDivElement | null>(null);
    const { theme } = useTheme();
    const currentTheme = theme === 'light' ? lightTheme : darkTheme;

    const typeOptions = [
        { name: 'Park', color: '#4CAF50' },
        { name: 'Restaurant', color: '#FF7043' },
        { name: 'Bar', color: '#42A5F5' },
        { name: 'Cafe', color: '#A1887F' },
        { name: 'Museum', color: '#AB47BC' },
        { name: 'Monument', color: '#BDBDBD' },
        { name: 'Store', color: '#FFA726' },
        { name: 'Hotel', color: '#F48FB1' },
        { name: 'Beach', color: '#FFD54F' },
        { name: 'other', color: '#D32F2F' },
        { name: 'All', color: '#90A4AE' },
    ];

    const visibilityOptions = ['all', 'public', 'friends', 'private'];

    const [selectedTypes, setSelectedTypes] = useState<string[]>(
        typeOptions.map((option) => option.name).filter((name) => name !== 'All')
    );

    const [selectedVisibility, setSelectedVisibility] = useState<string>('all');

    useImperativeHandle(ref, () => ({
        open: () => {
            if (sheetRef.current) {
                sheetRef.current.style.display = 'block';
            }
        },
        close: () => {
            if (sheetRef.current) {
                sheetRef.current.classList.add('closing');
                setTimeout(() => {
                    if (sheetRef.current) {
                        sheetRef.current.style.display = 'none';
                        sheetRef.current.classList.remove('closing');
                    }
                }, 500);
            }
        },
    }));

    const handleClose = () => {
        if (sheetRef.current) {
            sheetRef.current.classList.add('closing');
            setTimeout(() => {
                if (sheetRef.current) {
                    sheetRef.current.style.display = 'none';
                    sheetRef.current.classList.remove('closing');
                }
            }, 500);
        }
    };

    const toggleTypeSelection = (type: string) => {
        let updatedTypes;
        if (type === 'All') {
            updatedTypes = selectedTypes.length === typeOptions.length - 1 ? [] : typeOptions.map((option) => option.name).filter((name) => name !== 'All');
        } else {
            updatedTypes = selectedTypes.includes(type)
                ? selectedTypes.filter((t) => t !== type)
                : [...selectedTypes, type];
        }
        setSelectedTypes(updatedTypes);
        props.onTypeChange(updatedTypes);
    };

    const selectVisibilityOption = (option: string) => {
        setSelectedVisibility(option);
        props.onVisibilityChange(option);
    };


    return (
        <div ref={sheetRef} className="bottom-sheet" style={currentTheme.navButton}>
            <button onClick={handleClose} style={currentTheme.close} className="close-button">X</button>
            <div style={styles.container}>
                <h2 style={{ ...styles.title, color: currentTheme.textColor }}>{('Select Filters')}</h2>

                <div style={styles.filterList}>
                    {typeOptions.map((type) => (
                        <button
                            key={type.name}
                            style={{
                                ...styles.filterButton,
                                ...(type.name === 'All' ? styles.allButton : {}),
                                backgroundColor: selectedTypes.includes(type.name)
                                    ? type.color
                                    : currentTheme.filterButtonBackground,
                            }}
                            onClick={() => toggleTypeSelection(type.name)}
                        >
                            <span
                                style={{
                                    ...styles.filterText,
                                    color: selectedTypes.includes(type.name)
                                        ? currentTheme.textColor
                                        : currentTheme.unselectedTextColor,
                                }}
                            >
                                {(type.name)}
                            </span>
                        </button>
                    ))}
                </div>

                <h2 style={{ ...styles.title, color: currentTheme.textColor, marginTop: 20 }}>
                    {('Select Visibility')}
                </h2>

                <div style={styles.filterList}>
                    {visibilityOptions.map((option) => (
                        <button
                            key={option}
                            style={{
                                ...styles.filterButton,
                                backgroundColor: selectedVisibility === option
                                    ? '#90A4AE'
                                    : currentTheme.filterButtonBackground,
                            }}
                            onClick={() => selectVisibilityOption(option)}
                        >
                            <span
                                style={{
                                    ...styles.filterText,
                                    color: selectedVisibility === option
                                        ? currentTheme.textColor
                                        : currentTheme.unselectedTextColor,
                                }}
                            >
                                {(option[0].toUpperCase() + option.slice(1))}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
});

const styles: { [key: string]: React.CSSProperties } = {
    container: {
      display: 'flex',
      flexDirection: 'column' as 'column',  // Ajout de l'assertion de type ici
      padding: '20px',
    },
    title: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '10px',
    },
    filterList: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px',
    },
    filterButton: {
      padding: '10px 20px',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
    },
    allButton: {
      fontWeight: 'bold',
    },
    filterText: {
      fontSize: '14px',
    },
  };
  

export default BottomSheetMap;
