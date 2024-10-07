import React from 'react';
import { useTheme } from '../../../context/ThemeContext';


interface RatingDisplayProps {
    rating: number;
    maxStars?: number;
    showRating?: boolean;
}

const RatingDisplay: React.FC<RatingDisplayProps> = ({ showRating = true, rating, maxStars = 5 }) => {
    const { theme } = useTheme(); // Assuming you have a theme context for light/dark modes
    const currentTheme = theme === 'light' ? '#000' : '#fff'; // Light or dark mode

    return (
        <div >
            {showRating && (
                <p style={styles.ratingText}>Average Rating: {rating.toFixed(1)}</p>
            )}
            <div >
                {[...Array(maxStars)].map((_, index) => {
                    const starNumber = index + 1;
                    let starIcon = '☆'; // Default to an empty star

                    if (rating >= starNumber) {
                        starIcon = '★'; // Full star
                    } else if (rating >= starNumber - 0.5) {
                        starIcon = '★'; // Half star (using unicode)
                    }

                    return (
                        <span
                            key={starNumber}
                            style={{ ...styles.star, color: '#FFD700' }} // Gold color for stars
                        >
                            {starIcon}
                        </span>
                    );
                })}
                <span style={{ color: currentTheme }}>
                    {rating}
                </span>
            </div>
        </div>
    );
};

// Inline styles for the React component
const styles = {
    container: {
        textAlign: 'center' as const,
        marginBottom: '10px',
    },
    ratingText: {
        fontSize: '18px',
        fontWeight: 'bold',
        marginBottom: '5px',
    },
    starsContainer: {
        display: 'flex',
        flexDirection: 'row' as const,
        alignItems: 'center',
        justifyContent: 'center',
    },
    star: {
        fontSize: '30px',
        margin: '0 2px',
    },
};

export default RatingDisplay;
