import { latLngToCell, cellToBoundary } from 'h3-js';
import { supabase } from '../lib/supabase';

// No Mapbox import on web!

export const MAP_STYLE_DARK = 'mapbox://styles/mapbox/dark-v11';
export const H3_RESOLUTION = 9;

export function getH3CellForLocation(lat: number, lng: number): string {
    return latLngToCell(lat, lng, H3_RESOLUTION);
}

export function getH3CellBoundary(cellId: string): [number, number][] {
    const boundary = cellToBoundary(cellId);
    // h3 returns [lat, lng], Mapbox usually needs [lng, lat], keeping consistent
    const coords = boundary.map(([lat, lng]) => [lng, lat] as [number, number]);
    coords.push(coords[0]);
    return coords;
}

export async function fetchNearbyCells(lat: number, lng: number, radiusKm: number = 2) {
    const latDelta = radiusKm / 111;
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
                    ? (cell.crew_color || '#84cc16')
                    : '#ef4444',
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
