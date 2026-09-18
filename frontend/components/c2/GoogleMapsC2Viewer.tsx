/// <reference types="@types/google.maps" />
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

declare const google: any;

interface GoogleMapsViewerProps {
    activeLayer: 'tactical' | 'satellite' | 'terrain' | 'hybrid';
    center?: { lat: number; lng: number };
    zoom?: number;
    onMarkerSelect?: (item: unknown) => void;
}

const TACTICAL_DARK_STYLE: any[] = [
    { elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
    {
        featureType: 'administrative.locality',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#38bdf8' }],
    },
    {
        featureType: 'poi',
        stylers: [{ visibility: 'off' }],
    },
    {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: '#1e293b' }],
    },
    {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#0f172a' }],
    },
    {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#0284c7' }],
    },
    {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#38bdf8' }],
    },
];

export const GoogleMapsC2Viewer: React.FC<GoogleMapsViewerProps> = ({
    activeLayer,
    center = { lat: -9.189967, lng: -75.015152 },
    zoom = 6,
}) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const apiKey =
            (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) ||
            '';

        const loader = new Loader({
            apiKey,
            version: 'weekly',
            libraries: ['places', 'geometry'],
        });

        let isMounted = true;

        const initMap = async () => {
            try {
                const anyLoader = loader as any;
                if (typeof anyLoader.load === 'function') {
                    await anyLoader.load();
                } else if (typeof anyLoader.importLibrary === 'function') {
                    await anyLoader.importLibrary('maps');
                }

                if (!mapRef.current || !isMounted) return;

                const map = new google.maps.Map(mapRef.current, {
                    center,
                    zoom,
                    disableDefaultUI: false,
                    zoomControl: true,
                    mapTypeControl: false,
                    streetViewControl: true,
                    fullscreenControl: false,
                    styles: activeLayer === 'tactical' ? TACTICAL_DARK_STYLE : undefined,
                    mapTypeId:
                        activeLayer === 'satellite'
                            ? 'satellite'
                            : activeLayer === 'hybrid'
                                ? 'hybrid'
                                : activeLayer === 'terrain'
                                    ? 'terrain'
                                    : 'roadmap',
                });

                mapInstanceRef.current = map;
                setIsLoaded(true);
            } catch (err: unknown) {
                console.error('[C2 Google Maps Loader Error]:', err);
            }
        };

        initMap();

        return () => {
            isMounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Sincronizar capa cuando cambia el estado
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || !isLoaded || typeof google === 'undefined') return;

        if (activeLayer === 'tactical') {
            map.setMapTypeId('roadmap');
            map.setOptions({ styles: TACTICAL_DARK_STYLE });
        } else if (activeLayer === 'satellite') {
            map.setOptions({ styles: [] });
            map.setMapTypeId('satellite');
        } else if (activeLayer === 'terrain') {
            map.setOptions({ styles: [] });
            map.setMapTypeId('terrain');
        } else if (activeLayer === 'hybrid') {
            map.setOptions({ styles: [] });
            map.setMapTypeId('hybrid');
        }
    }, [activeLayer, isLoaded]);

    return (
        <div className="relative w-full h-full min-h-[600px] bg-slate-950">
            <div ref={mapRef} className="w-full h-full" />
            {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm z-10 text-cyan-400 font-mono text-sm">
                    <span className="animate-pulse">INICIALIZANDO MOTOR GOOGLE MAPS C2...</span>
                </div>
            )}
        </div>
    );
};

export default GoogleMapsC2Viewer;