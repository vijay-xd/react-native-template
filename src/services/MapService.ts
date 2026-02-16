import Mapbox from '@rnmapbox/maps';
import { latLngToCell, cellToBoundary } from 'h3-js';
import { supabase } from '../lib/supabase';

// Initialize Mapbox
Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN || '');

export const MAP_STYLE_DARK = 'mapbox://styles/mapbox/dark-v11';
export const H3_RESOLUTION = 9; // ~0.1 km² per cell — ideal for street-level territory

/**
 * Convert a lat/lng position into an H3 cell index.
 */
export function getH3CellForLocation(lat: number, lng: number): string {
    return latLngToCell(lat, lng, H3_RESOLUTION);
}

/**
 * Get the GeoJSON polygon boundary for an H3 cell.
 * Returns coordinates in [lng, lat] format for Mapbox.
 */
export function getH3CellBoundary(cellId: string): [number, number][] {
    const boundary = cellToBoundary(cellId);
    // h3 returns [lat, lng], Mapbox needs [lng, lat]
    const coords = boundary.map(([lat, lng]) => [lng, lat] as [number, number]);
    // Close the polygon
    coords.push(coords[0]);
    return coords;
}

/**
 * Get nearby cells for a given location to display on the map.
 * We query Supabase for cells within a bounding box.
 */
export async function fetchNearbyCells(lat: number, lng: number, radiusKm: number = 2) {
    const latDelta = radiusKm / 111; // rough conversion
    const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

    const { data, error } = await supabase
        .from('territory_cells')
        .select('*')
        .gte('center_lat', lat - latDelta)
        .lte('center_lat', lat + latDelta)
        .gte('center_lng', lng - lngDelta)
        .lte('center_lng', lng + lngDelta);

    if (error) {
        console.error('Error fetching cells:', error);
        return [];
    }

    return data || [];
}

/**
 * Capture a territory cell for the current user.
 */
export async function captureCell(
    cellId: string,
    centerLat: number,
    centerLng: number,
    crewId?: string,
    crewColor?: string
) {
    const { error } = await supabase.rpc('capture_territory_cell', {
        p_cell_id: cellId,
        p_center_lat: centerLat,
        p_center_lng: centerLng,
        p_crew_id: crewId || null,
        p_crew_color: crewColor || null,
    });

    if (error) {
        console.error('Error capturing cell:', error);
        throw error;
    }
}

/**
 * Convert an array of territory cells into GeoJSON FeatureCollection
 * for rendering on Mapbox as polygon layers.
 */
export function cellsToGeoJSON(
    cells: any[],
    currentUserId?: string
) {
    const features = cells.map((cell) => {
        const boundary = getH3CellBoundary(cell.id);
        const isOwn = cell.owner_id === currentUserId;

        return {
            type: 'Feature' as const,
            properties: {
                cellId: cell.id,
                ownerId: cell.owner_id,
                ownerUsername: cell.owner_username,
                crewId: cell.crew_id,
                crewColor: cell.crew_color,
                cellType: cell.cell_type,
                isOwn,
                fillColor: isOwn
                    ? (cell.crew_color || '#84cc16') // Neon green for own cells
                    : '#ef4444', // Red for enemy cells
                strokeColor: isOwn
                    ? (cell.crew_color || '#84cc16')
                    : '#ef4444',
            },
            geometry: {
                type: 'Polygon' as const,
                coordinates: [boundary],
            },
        };
    });

    return {
        type: 'FeatureCollection' as const,
        features,
    };
}

/**
 * Fetch the current active season info.
 */
export async function fetchActiveSeason() {
    const { data, error } = await supabase
        .from('seasons')
        .select('*')
        .eq('status', 'active')
        .order('number', { ascending: false })
        .limit(1)
        .single();

    if (error) {
        console.error('Error fetching season:', error);
        return null;
    }

    return data;
}
