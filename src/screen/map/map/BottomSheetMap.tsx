import React, { useRef, forwardRef, useImperativeHandle, useState, PropsWithChildren } from 'react';
import './BottomSheetMap.css';
import { MarkerData } from './map';
import RatingDisplay from './RatingDisplay';
import { useTheme } from '../../../context/ThemeContext';
import { darkTheme, lightTheme } from './../../../componnent/Header/theme/themeHeader';
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

interface BottomSheetProps {
    marker: MarkerData | null;
}

const BottomSheetMap = forwardRef((props: PropsWithChildren<BottomSheetProps>, ref) => {
    const sheetRef = useRef<HTMLDivElement | null>(null);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const { theme } = useTheme();
    const currentTheme = theme === 'light' ? lightTheme : darkTheme;
    const [thumbsSwiper, setThumbsSwiper] = useState(null);

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
                sheetRef.current.style.display = 'none';
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

    const handleBlockMarker = () => {
        console.log('Marker blocked');
        // Add your logic to block the marker
        handleMenuClose();
    };

    const handleUnblockMarker = () => {
        console.log('Marker unblocked');
        // Add your logic to unblock the marker
        handleMenuClose();
    };

    const handleEditMarker = () => {
        console.log('Edit marker');
        // Add your logic to edit the marker
        handleMenuClose();
    };

    return (
        <div ref={sheetRef} className="bottom-sheet" style={currentTheme.navButton}>
            {props.marker && (
                <>
                    <div className={`bottom-sheet-header ${isFullScreen ? 'fullscreen' : ''}`}>
                        <div className="bottom-sheet-header-left">
                            <h2>{props.marker.title}</h2>
                            <p>{props.marker.type}</p>
                            <RatingDisplay showRating={false} rating={Number(averageRating) || 0} />
                        </div>
                        {/* <div className="bottom-sheet-header-right">
                            <img src={images[0]?.url || 'https://via.placeholder.com/300'} alt="Marker" className="profile-image" />
                        </div> */}
                        <IconButton
                            aria-label="more"
                            aria-controls="long-menu"
                            aria-haspopup="true"
                            onClick={handleMenuClick}
                        >
                            <MoreVertIcon style={{transform: 'rotate(90deg)', color: theme === 'light' ? 'black' : 'white', }}/>
                        </IconButton>
                        <Menu
                            id="long-menu"
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleMenuClose}
                            PaperProps={{
                                style: {
                                    maxHeight: 48 * 4.5,
                                    width: '20ch',
                                },
                            }}
                        >
                            <MenuItem onClick={handleBlockMarker}>Block Marker</MenuItem>
                            <MenuItem onClick={handleUnblockMarker}>Unblock Marker</MenuItem>
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
