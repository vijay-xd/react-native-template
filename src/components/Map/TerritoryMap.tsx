import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import * as Location from 'expo-location';
import {
    MAP_STYLE_DARK,
    fetchNearbyCells,
    cellsToGeoJSON,
    fetchActiveSeason,
} from '../../services/MapService';
import { useAuth } from '../../context/AuthContext';

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN || '');

type Season = {
    id: string;
    number: number;
    name: string;
    ends_at: string;
    status: string;
};

type Props = {
    onLocationReady?: (lat: number, lng: number) => void;
};

export default function TerritoryMap({ onLocationReady }: Props) {
    const { user } = useAuth();
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [cellGeoJSON, setCellGeoJSON] = useState<any>(null);
    const [season, setSeason] = useState<Season | null>(null);
    const [timeRemaining, setTimeRemaining] = useState('');
    const [ownCellCount, setOwnCellCount] = useState(0);
    const [enemyCellCount, setEnemyCellCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const cameraRef = useRef<Mapbox.Camera>(null);

    // Get user location
    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.warn('Location permission not granted');
                setLoading(false);
                return;
            }

            const loc = await Location.getCurrentPositionAsync({});
            const coords = { lat: loc.coords.latitude, lng: loc.coords.longitude };
            setLocation(coords);
            onLocationReady?.(coords.lat, coords.lng);
            setLoading(false);
        })();
    }, []);

    // Fetch territory cells & season
    useEffect(() => {
        if (!location) return;

        const loadData = async () => {
            const [cells, seasonData] = await Promise.all([
                fetchNearbyCells(location.lat, location.lng),
                fetchActiveSeason(),
            ]);

            if (cells.length > 0 && user) {
                const geoJSON = cellsToGeoJSON(cells, user.id);
                setCellGeoJSON(geoJSON);

                const own = cells.filter((c: any) => c.owner_id === user.id).length;
                const enemy = cells.filter(
                    (c: any) => c.owner_id && c.owner_id !== user.id
                ).length;
                setOwnCellCount(own);
                setEnemyCellCount(enemy);
            }

            if (seasonData) {
                setSeason(seasonData);
            }
        };

        loadData();
    }, [location, user]);

    // Countdown timer
    useEffect(() => {
        if (!season?.ends_at) return;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const end = new Date(season.ends_at).getTime();
            const diff = end - now;

            if (diff <= 0) {
                setTimeRemaining('Season ended');
                clearInterval(interval);
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            setTimeRemaining(`${days}d ${hours}h remaining`);
        }, 60000);

        // Initial calculation
        const now = new Date().getTime();
        const end = new Date(season.ends_at).getTime();
        const diff = end - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        setTimeRemaining(`${days}d ${hours}h remaining`);

        return () => clearInterval(interval);
    }, [season]);

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#84cc16" />
                <Text style={{ color: '#888', marginTop: 12, fontFamily: 'Inter-Regular' }}>
                    Loading territory...
                </Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            {/* Map Header */}
            <View
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 10,
                    paddingHorizontal: 16,
                    paddingTop: 8,
                    paddingBottom: 12,
                    backgroundColor: 'rgba(0,0,0,0.75)',
                }}
            >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                        <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', fontFamily: 'Inter-Bold' }}>
                            Territory Map
                        </Text>
                        {season && (
                            <Text style={{ color: '#888', fontSize: 13, fontFamily: 'Inter-Regular' }}>
                                Season {season.number}: {season.name} •{' '}
                                <Text style={{ color: '#84cc16' }}>{timeRemaining}</Text>
                            </Text>
                        )}
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#84cc16' }} />
                            <Text style={{ color: '#ccc', fontSize: 12, fontFamily: 'SpaceMono-Regular' }}>
                                {ownCellCount} CELLS
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444' }} />
                            <Text style={{ color: '#ccc', fontSize: 12, fontFamily: 'SpaceMono-Regular' }}>ENEMY</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' }} />
                            <Text style={{ color: '#22c55e', fontSize: 12, fontWeight: 'bold', fontFamily: 'SpaceMono-Regular' }}>
                                LIVE
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Mapbox Map */}
            <Mapbox.MapView
                style={{ flex: 1 }}
                styleURL={MAP_STYLE_DARK}
                logoEnabled={true}
                compassEnabled={false}
                attributionEnabled={false}
                scaleBarEnabled={false}
            >
                <Mapbox.Camera
                    ref={cameraRef}
                    zoomLevel={15}
                    centerCoordinate={location ? [location.lng, location.lat] : [80.2707, 13.0827]}
                    animationMode="flyTo"
                    animationDuration={1500}
                />

                {/* User location marker */}
                <Mapbox.UserLocation
                    visible={true}
                />

                {/* Territory Hexagonal Cells */}
                {cellGeoJSON && (
                    <Mapbox.ShapeSource id="territory-cells" shape={cellGeoJSON}>
                        {/* Fill layer */}
                        <Mapbox.FillLayer
                            id="territory-fill"
                            style={{
                                fillColor: ['get', 'fillColor'],
                                fillOpacity: 0.3,
                            }}
                        />
                        {/* Stroke/outline layer */}
                        <Mapbox.LineLayer
                            id="territory-stroke"
                            style={{
                                lineColor: ['get', 'strokeColor'],
                                lineWidth: 2,
                                lineOpacity: 0.9,
                            }}
                        />
                    </Mapbox.ShapeSource>
                )}
            </Mapbox.MapView>
        </View>
    );
}
