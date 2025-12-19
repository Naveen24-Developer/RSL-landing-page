"use client";

import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, useLoadScript, Marker, Polyline, InfoWindow } from '@react-google-maps/api';
import { useTripStore } from '@/store/useTripStore';
import { ItineraryItem } from '@/types/trip';
import { formatPriceRange } from '@/lib/activityUtils';
import { Star, Clock, DollarSign, MapPin } from 'lucide-react';

const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = ["places"];

const mapContainerStyle = {
    width: '100%',
    height: '100%',
};

const defaultCenter = {
    lat: 25.2324469,
    lng: 55.5555022, // NYC
};

const options = {
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
};

export function MapView() {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        libraries,
    });

    const { itinerary, currentDay, selectedActivity, setSelectedActivity } = useTripStore();
    const [hoveredActivity, setHoveredActivity] = useState<ItineraryItem | null>(null);
    const [clickedActivity, setClickedActivity] = useState<ItineraryItem | null>(null);
    const mapRef = useRef<google.maps.Map | null>(null);

    // Filter activities by current day
    const filteredActivities = useMemo(() => {
        return itinerary.filter(item => item.day === currentDay);
    }, [itinerary, currentDay]);

    // Use filtered activities for display
    const displayActivities = filteredActivities.length > 0 ? filteredActivities : itinerary;

    const center = useMemo(() => {
        if (displayActivities.length > 0 && displayActivities[0].location.lat !== 0 && displayActivities[0].location.lng !== 0) {
            return displayActivities[0].location;
        }
        return defaultCenter;
    }, [displayActivities]);

    const path = useMemo(() => {
        return displayActivities
            .filter(item => item.location.lat !== 0 && item.location.lng !== 0)
            .map(item => item.location);
    }, [displayActivities]);

    // Auto-fit bounds when day changes to show all activities
    useEffect(() => {
        if (mapRef.current && displayActivities.length > 0) {
            const bounds = new google.maps.LatLngBounds();
            let hasValidCoords = false;

            displayActivities.forEach(activity => {
                if (activity.location.lat !== 0 && activity.location.lng !== 0) {
                    bounds.extend(activity.location);
                    hasValidCoords = true;
                }
            });

            if (hasValidCoords) {
                mapRef.current.fitBounds(bounds, {
                    top: 100,
                    bottom: 50,
                    left: 50,
                    right: 50,
                });
            }
        }
    }, [displayActivities, currentDay]);

    // Handle hover from itinerary (just highlight, no info window)
    useEffect(() => {
        if (selectedActivity && !clickedActivity) {
            setHoveredActivity(selectedActivity);

            // Pan to activity but don't zoom too much
            if (mapRef.current && selectedActivity.location.lat !== 0 && selectedActivity.location.lng !== 0) {
                mapRef.current.panTo(selectedActivity.location);
            }
        } else if (!selectedActivity) {
            setHoveredActivity(null);
        }
    }, [selectedActivity, clickedActivity]);

    const handleMarkerClick = useCallback((activity: ItineraryItem) => {
        setClickedActivity(activity);
        setSelectedActivity(activity);

        // Pan and zoom on click
        if (mapRef.current && activity.location.lat !== 0 && activity.location.lng !== 0) {
            mapRef.current.panTo(activity.location);
            mapRef.current.setZoom(15);
        }
    }, [setSelectedActivity]);

    const handleInfoWindowClose = useCallback(() => {
        setClickedActivity(null);
        setSelectedActivity(null);
    }, [setSelectedActivity]);

    const handleMapLoad = useCallback((map: google.maps.Map) => {
        mapRef.current = map;
    }, []);

    if (loadError) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-muted text-destructive p-4 text-center">
                <div>
                    <p className="font-bold">Error loading map</p>
                    <p className="text-sm mt-2">Please check your API key configuration.</p>
                </div>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-muted">
                <div className="animate-pulse text-muted-foreground">Loading Map...</div>
            </div>
        );
    }

    return (
        <div className="relative h-full w-full">
            {/* Day Indicator */}
            {filteredActivities.length > 0 && (
                <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg px-4 py-2 border">
                    <p className="text-sm font-semibold text-gray-900">
                        Day {currentDay}
                    </p>
                    <p className="text-xs text-gray-500">
                        {filteredActivities.length} {filteredActivities.length === 1 ? 'activity' : 'activities'}
                    </p>
                </div>
            )}

            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                zoom={displayActivities.length > 0 ? 12 : 13}
                center={center}
                options={options}
                onLoad={handleMapLoad}
            >
                {displayActivities.map((item, index) => {
                    // Skip items with invalid coordinates
                    if (item.location.lat === 0 && item.location.lng === 0) {
                        return null;
                    }

                    const isHovered = hoveredActivity?.id === item.id;
                    const isClicked = clickedActivity?.id === item.id;
                    const isHighlighted = isHovered || isClicked;

                    return (
                        <Marker
                            key={item.id}
                            position={item.location}
                            title={item.title}
                            label={{
                                text: (item.sequence || index + 1).toString(),
                                color: "white",
                                fontWeight: "bold"
                            }}
                            onClick={() => handleMarkerClick(item)}
                            icon={{
                                path: google.maps.SymbolPath.CIRCLE,
                                scale: isHighlighted ? 14 : 12,
                                fillColor: isHighlighted ? "#1d4ed8" : "#3b82f6",
                                fillOpacity: 1,
                                strokeColor: "#ffffff",
                                strokeWeight: isHighlighted ? 3 : 2,
                            }}
                            animation={isHighlighted ? google.maps.Animation.BOUNCE : undefined}
                        />
                    );
                })}

                {/* Only show info window when clicked, not on hover */}
                {clickedActivity && clickedActivity.location.lat !== 0 && clickedActivity.location.lng !== 0 && (
                    <InfoWindow
                        position={clickedActivity.location}
                        onCloseClick={handleInfoWindowClose}
                    >
                        <div className="p-2 max-w-xs">
                            {/* Activity Image */}
                            {clickedActivity.image && (
                                <div className="mb-3 rounded-lg overflow-hidden">
                                    <img
                                        src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${clickedActivity.image}`}
                                        alt={clickedActivity.title}
                                        className="w-full h-32 object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}

                            {/* Activity Title */}
                            <h3 className="font-bold text-base mb-2 text-gray-900">
                                {clickedActivity.title}
                            </h3>

                            {/* Activity Type & Time of Day */}
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                {clickedActivity.timeOfDay && (
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                        {clickedActivity.timeOfDay}
                                    </span>
                                )}
                                {clickedActivity.activityType && (
                                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                                        {clickedActivity.activityType}
                                    </span>
                                )}
                            </div>

                            {/* Description */}
                            {clickedActivity.description && (
                                <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                                    {clickedActivity.description}
                                </p>
                            )}

                            {/* Metadata */}
                            <div className="flex items-center gap-3 text-xs text-gray-700 mb-2">
                                {clickedActivity.rating && (
                                    <div className="flex items-center gap-1">
                                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                        <span className="font-medium">{clickedActivity.rating}</span>
                                        {clickedActivity.reviews !== undefined && clickedActivity.reviews > 0 && (
                                            <span className="text-gray-500">({clickedActivity.reviews})</span>
                                        )}
                                    </div>
                                )}
                                {clickedActivity.duration && (
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        <span>{clickedActivity.duration}min</span>
                                    </div>
                                )}
                            </div>

                            {/* Price */}
                            {clickedActivity.cost !== undefined && (
                                <div className="flex items-center gap-1 text-sm font-bold text-blue-600">
                                    {clickedActivity.choices && clickedActivity.choices.length > 0 ? (
                                        <span>{formatPriceRange(clickedActivity.choices, clickedActivity.currency || 'AED')}</span>
                                    ) : (
                                        <span>{clickedActivity.currency || 'AED'} {clickedActivity.cost}</span>
                                    )}
                                </div>
                            )}

                            {/* Location */}
                            {clickedActivity.location?.address && (
                                <div className="flex items-start gap-1 mt-2 text-xs text-gray-500">
                                    <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                                    <span className="line-clamp-2">{clickedActivity.location.address}</span>
                                </div>
                            )}
                        </div>
                    </InfoWindow>
                )}

                {path.length > 1 && (
                    <Polyline
                        path={path}
                        options={{
                            strokeColor: "#2563eb",
                            strokeOpacity: 0.8,
                            strokeWeight: 4,
                            geodesic: true,
                        }}
                    />
                )}
            </GoogleMap>
        </div>
    );
}
