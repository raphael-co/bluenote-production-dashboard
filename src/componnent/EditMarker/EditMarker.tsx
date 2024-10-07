import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import './EditMarker.css';

import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Navigation, Thumbs } from 'swiper/modules';
import { useSnackbar } from 'notistack';

import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';

interface MarkerData {
    id: number;
    title: string;
    description: string;
    latitude: string;
    longitude: string;
    type: string;
    visibility: string;
    ratings: any;
    user_id: number;
    images: { url: string | undefined }[];
}

interface responseData {
    data: MarkerData;
}

const EditMarker: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [markerData, setMarkerData] = useState<MarkerData | null>(null);
    const [formData, setFormData] = useState<MarkerData>({
        id: 0,
        title: '',
        description: '',
        latitude: '',
        longitude: '',
        type: '',
        visibility: '',
        ratings: {},
        user_id: 0,
        images: []
    });
    const navigate = useNavigate();
    const { token } = useAuth();
    const { theme } = useTheme();
    const [ratingLabels, setRatingLabels] = useState<string[]>([]);
    const [removedImages, setRemovedImages] = useState<{ url: string | undefined }[]>([]);
    const [uploadedImages, setUploadedImages] = useState<File[]>([]);
    const [thumbsSwiper,] = useState(null);

    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        const fetchMarkerData = async () => {
            try {
                const response = await axios.get<responseData>(`${process.env.REACT_APP_API_URL}/admin/markers/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setMarkerData(response.data.data);
                setFormData(response.data.data);
            } catch (error) {
                console.error('Error fetching marker data:', error);
            }
        };

        fetchMarkerData();
    }, [id, token]);

    useEffect(() => {
        document.body.classList.remove('light-theme', 'dark-theme');
        document.body.classList.add(theme === 'light' ? 'light-theme' : 'dark-theme');
    }, [theme]);

    const handleFormSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const formSubmitData = new FormData();
        formSubmitData.append('title', formData.title);
        formSubmitData.append('description', formData.description);
        formSubmitData.append('latitude', formData.latitude);
        formSubmitData.append('longitude', formData.longitude);
        formSubmitData.append('userId', markerData?.user_id.toString() || '1');
        formSubmitData.append('type', formData.type);
        formSubmitData.append('visibility', formData.visibility);

        Object.entries(formData.ratings || {}).forEach(([label, rating]) => {
            formSubmitData.append(`ratings[${label}]`, rating ? rating.toString() : '0');
        });

        // Convert existing images (URLs) to files using fetch and Blob
        const existingImagePromises = formData.images.map(async (image) => {
            if (image.url) {
                const response = await fetch(image.url);  // Fetch the image URL
                const blob = await response.blob();  // Convert it to a Blob
                const fileName = image.url.split('/').pop() || 'image.jpg'; // Extract filename
                return new File([blob], fileName, { type: blob.type });  // Convert Blob to File
            }
            return null;
        });

        // Resolve all image file conversions
        const existingImageFiles = await Promise.all(existingImagePromises);
        existingImageFiles.forEach((file) => {
            if (file) {
                formSubmitData.append('images', file);
            }
        });

        try {
            const response = await axios.put(`${process.env.REACT_APP_API_URL}/admin/update/${id}`, formSubmitData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });
        
            if (response.status >= 200 && response.status < 300) {
                // Succès
                enqueueSnackbar('Marker updated successfully', { variant: 'success' });
            
                // Récupérer les paramètres de l'URL
                const urlSearchParams = new URLSearchParams(window.location.search);
                const params = urlSearchParams.toString();
                
                // Rediriger vers la page précédente avec les mêmes paramètres, ou vers `/admin/tabs/markers` s'il n'y a pas de params
                const redirectUrl = params ? `/tabs/markers?${params}` : '/map';
                
                navigate(redirectUrl);
                
            } else {
                // Réponse non 2xx, vous pouvez gérer les erreurs spécifiques ici
                enqueueSnackbar('Error: ' + response.data.message, { variant: 'error' });
            }
        
            // navigate(`/map`);
        } catch (error: any) {
            console.error('Error updating marker:', error);
        
            // Gérer les erreurs qui résultent directement d'une requête échouée
            const message = error.response?.data?.message || error.message || 'Unknown error';
            enqueueSnackbar('Error updating marker: ' + message, { variant: 'error' });
        }
        
    };

    useEffect(() => {
        if (formData.type) {
            fetchRatingLabels(formData.type);
        }
    }, [formData.type]);

    const fetchRatingLabels = async (type: string) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/marker/labels/${type}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to fetch rating labels');
            const data = await response.json();
            const newRatings = data.data.reduce((acc: { [key: string]: number }, item: { label: string }) => {
                const existingRating = markerData?.ratings?.find((r: { label: string; rating: number }) => r.label === item.label);
                acc[item.label] = existingRating ? existingRating.rating : 0;
                return acc;
            }, {});


            setFormData((prevFormData) => ({
                ...prevFormData,
                ratings: newRatings,
            }));

            setRatingLabels(data.data.map((item: { label: string }) => item.label));
        } catch (error) {
            console.error(error);
        }
    };
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleRatingChange = (label: string, value: number) => {
        setFormData({
            ...formData,
            ratings: { ...formData.ratings, [label]: value }
        });
    };

    const handleRemoveImage = (index: number) => {
        const imageToRemove = formData?.images[index];
        console.log(imageToRemove);

        if (imageToRemove) {
            setRemovedImages((prev) => [...prev, imageToRemove]);
            // setMarkerData((prev) => prev && { ...prev, images: prev.images.filter((_, i) => i !== index) });
            setFormData((prev) => prev && { ...prev, images: prev.images.filter((_, i) => i !== index) });
        }
    };

    const handleRestoreImages = () => {
        if (markerData) {
            // setMarkerData((prev) => ({ ...prev!, images: [...prev!.images, ...removedImages] }));
            setFormData((prev) => ({ ...prev!, images: [...prev!.images, ...removedImages] }));
            setRemovedImages([]);
        }
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const files = Array.from(event.target.files);
            setUploadedImages((prev) => [...prev, ...files]);

            // Log selected files for debugging
            console.log('Selected files:', files);

            const fileURLs = files.map((file) => ({ url: URL.createObjectURL(file) }));
            setFormData((prev) => ({
                ...prev,
                images: [...prev.images, ...fileURLs]
            }));
        }
    };

    return (
        <div className="edit-marker-container">
            <h1>Edit Marker</h1>
            {markerData ? (
                <form onSubmit={handleFormSubmit} className="edit-marker-form">
                    <label>Title</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                    />

                    <label>Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                    />

                    <label>Images</label>
                    <div style={{ display: 'flex' }}>
                        <Swiper
                            loop={true}
                            spaceBetween={10}
                            navigation={true}
                            thumbs={{ swiper: thumbsSwiper }}
                            modules={[FreeMode, Navigation, Thumbs]}
                            className="mySwiper2"
                            style={{ borderRadius: '10px', padding: 0 }}
                        >
                            {formData.images.map((image: { url: string | undefined }, index: number) => (
                                <SwiperSlide key={index} virtualIndex={index}>
                                    <div className="image-container">
                                        <img className="carousel-image" src={image.url} />
                                        <button
                                            className="remove-image-btn"
                                            onClick={(e) => {
                                                e.preventDefault(); // Empêche la soumission du formulaire
                                                handleRemoveImage(index);
                                            }}
                                        >✖</button>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>

                    <input type="file" name="images" multiple onChange={handleImageUpload} />
                    {uploadedImages.length > 0 && (
                        <ul>{uploadedImages.map((file, index) => <li key={index}>{file.name}</li>)}</ul>
                    )}

                    {removedImages.length > 0 && <button onClick={handleRestoreImages}>Restore Removed Images</button>}

                    <label>Latitude</label>
                    <input
                        type="text"
                        name="latitude"
                        value={formData.latitude}
                        onChange={handleInputChange}
                        disabled
                    />

                    <label>Longitude</label>
                    <input
                        type="text"
                        name="longitude"
                        value={formData.longitude}
                        onChange={handleInputChange}
                        disabled
                    />

                    <label>Type</label>
                    <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                    >
                        <option value="park">Park</option>
                        <option value="restaurant">Restaurant</option>
                        <option value="bar">Bar</option>
                        <option value="cafe">Cafe</option>
                        <option value="museum">Museum</option>
                        <option value="monument">Monument</option>
                        <option value="store">Store</option>
                        <option value="hotel">Hotel</option>
                        <option value="beach">Beach</option>
                        <option value="other">Other</option>
                    </select>

                    <label>Visibility</label>
                    <select
                        name="visibility"
                        value={formData.visibility}
                        onChange={handleInputChange}
                    >
                        <option value="public">Public</option>
                        <option value="friends">Friends</option>
                        <option value="private">Private</option>
                    </select>

                    {markerData && ratingLabels.length > 0 ? (
                        ratingLabels.map((label, index) => {
                            const ratingValue = markerData.ratings.find((r: any) => r.label === label)?.rating || 0;

                            return (
                                <div key={index} className="edit-marker-rating">
                                    <label>{label}</label>
                                    <input
                                        type="number"
                                        max={5}
                                        min={0}
                                        value={formData.ratings[label] || ratingValue || 0}
                                        onChange={(e) => handleRatingChange(label, parseInt(e.target.value))}
                                    />
                                </div>
                            );
                        })
                    ) : (
                        <p>No ratings available</p>
                    )}

                    <button type="submit">Save</button>
                </form>
            ) : (
                <p className="edit-marker-loading">Loading...</p>
            )}
        </div>
    );
};

export default EditMarker;
