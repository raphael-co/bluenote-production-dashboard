import React, { useState, useCallback } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import CustomMarker from './CustomMarker';
import SettingsIcon from '@mui/icons-material/Settings';
import { useTheme } from '../../../context/ThemeContext';

type RatingData = {
    label: string;
    rating: number;
};

export type MarkerData = {
    id: number;
    user_id: number;
    title: string;
    description: string;
    latitude: string;
    longitude: string;
    type: string;
    comment: string;
    visibility: string;
    images: string[];
    ratings: RatingData[];
    blocked: boolean;
};

type MapComponentProps = {
    markers: MarkerData[];
    containerStyle?: { width: string; height: string };
    center?: { lat: number; lng: number };
    zoom?: number;
    apiKey: string;
    onMarkerClick: (marker: MarkerData) => void;
    handleFilterClick: () => void;
};

const defaultContainerStyle = {
    width: '100%',
    height: '100%',
};

// Center the map on France's coordinates
const franceCenter = {
    lat: 46.603354, // Latitude of France's geographical center
    lng: 1.888334,  // Longitude of France's geographical center
};

const typeColorMapping: any = {
    park: '#4CAF50',
    restaurant: '#FF7043',
    bar: '#42A5F5',
    cafe: '#A1887F',
    museum: '#AB47BC',
    monument: '#BDBDBD',
    store: '#FFA726',
    hotel: '#F48FB1',
    beach: '#FFD54F',
    other: '#D32F2F',
};


const darkModeStyle = [
    { elementType: 'geometry', stylers: [{ color: '#212121' }] },
    { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
    { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#757575' }] },
    { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
    { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
    { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#bdbdbd' }] },
    { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#181818' }] },
    { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
    { featureType: 'poi.park', elementType: 'labels.text.stroke', stylers: [{ color: '#1b1b1b' }] },
    { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#2c2c2c' }] },
    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#8a8a8a' }] },
    { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#373737' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3c3c3c' }] },
    { featureType: 'road.highway.controlled_access', elementType: 'geometry', stylers: [{ color: '#4e4e4e' }] },
    { featureType: 'road.local', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
    { featureType: 'transit', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#000000' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3d3d3d' }] },
  ];

const MapComponent: React.FC<MapComponentProps> = ({
    markers,
    containerStyle = defaultContainerStyle,
    center = franceCenter, // Default center set to France
    zoom = 10,              // Adjust zoom level for better view of France
    apiKey,
    onMarkerClick,
    handleFilterClick
}) => {
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: apiKey,
    });

    const [map, setMap] = useState<google.maps.Map | null>(null); // Keep track of the map instance
    const { theme } = useTheme();

    const onLoad = useCallback((map: google.maps.Map) => {
        setMap(map);
        if (markers.length > 0) {
            const bounds = new window.google.maps.LatLngBounds();
            markers.forEach(marker => {
                bounds.extend({
                    lat: parseFloat(marker.latitude),
                    lng: parseFloat(marker.longitude),
                });
            });
            map.fitBounds(bounds);
        }
    }, [markers]);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    if (loadError) {
        return <div>Error loading map</div>;
    }

    if (!isLoaded) {
        return <div>Loading...</div>;
    }



    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}  // Use France as the center
            zoom={zoom}      // Adjust zoom level to fit France well
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
                styles: theme === 'dark' ? darkModeStyle : undefined, // Ajout du mode sombre ici
              }}
        >
            <button className="filter-button" onClick={handleFilterClick}>
                <div className="filter-container">
                    <span className="filter-text">Filter</span>
                    <SettingsIcon sx={{ color: 'black' }} style={{ width: '20px', height: '20px' }} />
                </div>
            </button>
            {markers.map((marker) => (
                <Marker
                    key={marker.id}
                    position={{
                        lat: parseFloat(marker.latitude),
                        lng: parseFloat(marker.longitude),
                    }}
                    title={marker.title}
                    onClick={() => onMarkerClick(marker)}
                    icon={{
                        url: `data:image/svg+xml;charset=UTF-8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='%23000000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path fill='${encodeURIComponent(typeColorMapping[marker.type] || '#4CAF50')}' d='M12 2C8.1 2 5 5.1 5 9c0 5.3 7 13 7 13s7-7.7 7-13c0-3.9-3.1-7-7-7z'/><circle fill='%23ffffff' cx='12' cy='9' r='3'/></svg>`,
                        scaledSize: new window.google.maps.Size(40, 40),  // Adjust the size here as needed
                    }}
                />
            ))}

        </GoogleMap>
    );
};

export default MapComponent;
