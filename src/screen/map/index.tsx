import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import MapComponent, { MarkerData } from './map/map';
import BottomSheetMap from './BottomSheetMap/BottomSheetMap';
import BottomSheetFilter from './BottomSheetFilter/BottomSheetFilter';
import './BottomSheetFilter/BottomSheetFilter.css';



const MapScreen: React.FC = () => {
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';

    const { token } = useAuth();
    const [markers, setMarkers] = useState<MarkerData[]>([]);
    const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);
    const bottomSheetRef = useRef<any>(null);
    const filterSheetRef = useRef<any>(null);
    const [mapCenter,] = useState({ lat: 46.603354, lng: 1.888334 });

    const [visibility, setVisibility] = useState<string>('all');
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]); // Example default types

    const fetchMarkers = useCallback(async () => {
        try {
            const typeQuery = selectedTypes.map(type => `type=${encodeURIComponent(type.toLowerCase())}`).join('&');
            const response = await axios.get<any>(`${process.env.REACT_APP_API_URL}/admin/markers?visibility=${visibility}&${typeQuery}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                validateStatus: (status) => {
                    return status >= 200 && status < 500;
                }
            });

            if (response.status === 404) {
                alert('No markers found');
                setMarkers([]);
            } else if (!response.data.data) {
                alert('No markers found');
                setMarkers([]);
            } else {
                setMarkers(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching markers:', error);
        }
    }, [token, visibility, selectedTypes]);


    useEffect(() => {
        if (token) {
            fetchMarkers();
        }
    }, [token, selectedTypes, visibility]);

    // useEffect(() => {
    //     fetchMarkers();
    //   }, [visibility, selectedTypes]); 

    const handleMarkerClick = async (marker: MarkerData) => {
        setSelectedMarker(marker);
        await filterSheetRef.current?.close();
        bottomSheetRef.current?.open();
    };

    const handleOpenFilter = async () => {
        await bottomSheetRef.current?.close();
        filterSheetRef.current?.open();
    };

    return (
        <div className="map-container">
            <MapComponent
                onMarkerClick={handleMarkerClick}
                markers={markers}
                containerStyle={{ width: '100%', height: '100%' }}
                center={mapCenter}  // Centre initial (France)
                zoom={6}  // Niveau de zoom initial
                apiKey={apiKey}
                handleFilterClick={handleOpenFilter}
            />
            {selectedMarker && <BottomSheetMap ref={bottomSheetRef} setSelectedMarker={setSelectedMarker} marker={selectedMarker} setMarkers={setMarkers} />}
            <BottomSheetFilter
                ref={filterSheetRef}
                onVisibilityChange={setVisibility}
                onTypeChange={setSelectedTypes}
            />
        </div>
    );
};

export default MapScreen;
