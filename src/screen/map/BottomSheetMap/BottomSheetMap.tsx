import React, { useRef, forwardRef, useImperativeHandle, useState, PropsWithChildren } from 'react';
import './BottomSheetMap.css';
import { MarkerData } from '../map/map';
import RatingDisplay from '../map/RatingDisplay';
import { useTheme } from '../../../context/ThemeContext';
import { darkTheme, lightTheme } from '../../../componnent/Header/theme/themeHeader';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Navigation, Thumbs } from 'swiper/modules';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface BottomSheetProps {
    marker: MarkerData;
    setMarkers: React.Dispatch<React.SetStateAction<MarkerData[]>>;
    setSelectedMarker: React.Dispatch<React.SetStateAction<MarkerData | null>>;
}

const BottomSheetMap = forwardRef((props: PropsWithChildren<BottomSheetProps>, ref) => {
    const sheetRef = useRef<HTMLDivElement | null>(null);
    const navigate = useNavigate();  // Initialize the hook
    const { token } = useAuth();
    const { theme } = useTheme();
    const currentTheme = theme === 'light' ? lightTheme : darkTheme;
    const [thumbsSwiper,] = useState(null);

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

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

    let images = [];

    if (typeof props.marker?.images === 'string') {
        images = JSON.parse(props.marker.images);
    } else {
        images = props.marker?.images || [];
    }

    const averageRating = props.marker?.ratings?.length
        ? (props.marker.ratings.reduce((sum, r) => sum + r.rating, 0) / props.marker.ratings.length).toFixed(2)
        : 'No ratings available';

    const shareMarker = () => {
        if (props.marker) {
            const { title, description, latitude, longitude } = props.marker;
            const message = `${title}\n\n${description}\n\nLocation: ${latitude}, ${longitude}`;
            if (navigator.share) {
                navigator.share({
                    title: 'Check out this place',
                    text: message,
                    url: window.location.href,
                }).then(() => {
                    console.log('Shared successfully');
                }).catch(console.error);
            } else {
                console.log('Share API not supported');
            }
        }
    };

    const openMap = (latitude: number, longitude: number) => {
        const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        window.open(googleMapsUrl, '_blank');
    };

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

    const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleBlockMarker = async (markerId: number, shouldBeBlocked: boolean) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/markers/blocked`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`  // Ensure your token is correctly managed
                },
                body: JSON.stringify({
                    markerId,
                    blocked: shouldBeBlocked
                })
            });

            if (response.ok) {  // Check if status code is in the range 200-299
                const responseData = await response.json();  // Assuming server sends back JSON response

                // Update marker in the local state
                props.setMarkers((prevMarkers: MarkerData[]) =>
                    prevMarkers.map((marker: MarkerData) => {
                        if (marker.id === markerId) {
                            // Ensure the entire structure of MarkerData is returned with the updated 'blocked' status
                            return { ...marker, blocked: shouldBeBlocked };
                        }
                        return marker;
                    })
                );

                props.setSelectedMarker({ ...props.marker, blocked: shouldBeBlocked });
            } else {
                console.error('Failed to update marker status:', await response.json());
                alert('Failed to update marker status'); // Provide user feedback
            }
        } catch (error) {
            console.error('Error fetching markers:', error);
            alert('Error updating marker status');
        }
    };

    const handleEditMarker = () => {
        navigate(`/markers/edit/${props.marker.id}`)
        handleMenuClose();
    };

    return (
        <div ref={sheetRef} className="bottom-sheet" style={currentTheme.navButton}>
            {props.marker && (
                <>
                    <div className={`bottom-sheet-header`}>
                        <div className="bottom-sheet-header-left">
                            <h2>{props.marker.title}</h2>
                            {props.marker.blocked ? (
                                <span style={{ color: '#ff0000', fontWeight: 'bold' }}>BLOCKED</span>
                            ) : (
                                <span style={{ color: '#008000', fontWeight: 'bold' }}>Not BLOCKED</span>  // Green color for "Not BLOCKED"
                            )}

                            <p>{props.marker.type}</p>
                            <p>{props.marker.visibility}</p>
                            <br />
                            <RatingDisplay showRating={false} rating={Number(averageRating) || 0} />
                            <p>{props.marker.description}</p>
                        </div>
                        {/* <div className="bottom-sheet-header-right">
                            <img src={images[0]?.url || 'https://via.placeholder.com/300'} alt="Marker" className="profile-image" />
                        </div> */}
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton
                                aria-label="more"
                                aria-controls="long-menu"
                                aria-haspopup="true"
                                onClick={handleMenuClick}
                            >
                                <MoreVertIcon style={{ transform: 'rotate(90deg)', color: theme === 'light' ? 'black' : 'white', height: '20px', width: '20px' }} />
                            </IconButton>
                        </div>



                        <Menu
                            id="long-menu"
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleMenuClose}
                            PaperProps={{
                                style: {
                                    maxHeight: 48 * 4.5,
                                    width: '20ch',
                                    backgroundColor: theme === 'light' ? '#fff' : '#333',
                                    color: theme === 'light' ? '#000' : '#fff',
                                },
                            }}
                        >
                            <MenuItem style={{ color: !props.marker.blocked ? '#ff0000' : '#008000' }} onClick={() => handleBlockMarker(props.marker.id, !props.marker.blocked)}>{props.marker.blocked ? 'Unblock Marker' : 'Block Marker'}</MenuItem>
                            <MenuItem onClick={handleEditMarker}>Edit Marker</MenuItem>
                        </Menu>
                        <button onClick={handleClose} className="close-button" style={currentTheme.close}>X</button>
                    </div>

                    <div className="bottom-sheet-body">
                        <div className="bottom-sheet-buttons">
                            <button onClick={() => openMap(Number(props.marker?.latitude), Number(props.marker?.longitude))}>
                                Open in Google Maps
                            </button>
                            <button onClick={shareMarker}>Share</button>
                        </div>
                        <Swiper
                            loop={true}
                            spaceBetween={10}
                            navigation={true}
                            thumbs={{ swiper: thumbsSwiper }}
                            modules={[FreeMode, Navigation, Thumbs]}
                            className="mySwiper2"
                        >
                            {images.map((image: { url: string | undefined; }, index: any) => (
                                <SwiperSlide key={index} virtualIndex={index}>
                                    <img className="carousel-image" src={image.url} alt={`Slide ${index}`} />
                                </SwiperSlide>
                            ))}
                        </Swiper>

                        <div className="marker-details">
                            {props.marker.ratings.map((rating, index) => (
                                <div key={index}>
                                    <p>{rating.label}</p>
                                    <RatingDisplay showRating={false} rating={Number(rating.rating) || 0} />
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
});

export default BottomSheetMap;
