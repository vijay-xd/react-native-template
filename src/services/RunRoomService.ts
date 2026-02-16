import { supabase } from '../lib/supabase';

// ─────────────────────────────────────────────
// RUN ROOMS — Public Matchmaking Lobbies
// ─────────────────────────────────────────────

export type RoomPace = 'slow' | 'medium' | 'fast';
export type RoomStatus = 'open' | 'full' | 'running' | 'finished';

export interface RunRoom {
    id: string;
    creator_id: string;
    title: string;
    city: string;
    start_time: string;
    max_players: number;
    pace: RoomPace;
    status: RoomStatus;
    party_id?: string;
    created_at: string;
    member_count?: number;
    creator_username?: string;
}

export interface RoomMember {
    id: string;
    room_id: string;
    user_id: string;
    joined_at: string;
    username?: string;
    avatar_url?: string;
    level?: number;
}

export interface ChatMessage {
    id: string;
    room_id: string;
    user_id: string;
    message: string;
    created_at: string;
    username?: string;
}

// ─────────────────────────────────────────────
// ROOM CRUD
// ─────────────────────────────────────────────

export async function createRunRoom(params: {
    title: string;
    city: string;
    startTime: string;
    maxPlayers: number;
    pace: RoomPace;
}) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('run_rooms')
        .insert({
            creator_id: user.id,
            title: params.title,
            city: params.city,
            start_time: params.startTime,
            max_players: params.maxPlayers,
            pace: params.pace,
        })
        .select()
        .single();

    if (error) throw error;

    // Auto-join creator
    await supabase.from('room_members').insert({
        room_id: data.id,
        user_id: user.id,
    });

    return data;
}

export async function fetchOpenRooms(city?: string) {
    let query = supabase
        .from('run_rooms')
        .select(`
      *,
      room_members (count)
    `)
        .in('status', ['open', 'full'])
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(30);

    if (city) {
        query = query.eq('city', city);
    }

    const { data, error } = await query;
    if (error) {
        console.error('Error fetching rooms:', error);
        return [];
    }

    return (data || []).map((room: any) => ({
        ...room,
        member_count: room.room_members?.[0]?.count || 0,
    }));
}

export async function fetchRoomDetails(roomId: string) {
    const { data, error } = await supabase
        .from('run_rooms')
        .select('*')
        .eq('id', roomId)
        .single();

    if (error) {
        console.error('Error fetching room:', error);
        return null;
    }
    return data;
}

export async function joinRoom(roomId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('room_members')
        .insert({ room_id: roomId, user_id: user.id });

    if (error) throw error;
}

export async function leaveRoom(roomId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('room_members')
        .delete()
        .eq('room_id', roomId)
        .eq('user_id', user.id);

    if (error) throw error;
}

export async function updateRoomStatus(roomId: string, status: RoomStatus) {
    const { error } = await supabase
        .from('run_rooms')
        .update({ status })
        .eq('id', roomId);

    if (error) throw error;
}

// ─────────────────────────────────────────────
// ROOM MEMBERS
// ─────────────────────────────────────────────

export async function fetchRoomMembers(roomId: string): Promise<RoomMember[]> {
    const { data, error } = await supabase
        .from('room_members')
        .select(`
      id,
      room_id,
      user_id,
      joined_at,
      profiles!room_members_user_id_fkey (
        username,
        avatar_url,
        level
      )
    `)
        .eq('room_id', roomId)
        .order('joined_at', { ascending: true });

    if (error) {
        console.error('Error fetching members:', error);
        return [];
    }

    return (data || []).map((m: any) => ({
        id: m.id,
        room_id: m.room_id,
        user_id: m.user_id,
        joined_at: m.joined_at,
        username: m.profiles?.username,
        avatar_url: m.profiles?.avatar_url,
        level: m.profiles?.level,
    }));
}

// ─────────────────────────────────────────────
// ROOM CHAT
// ─────────────────────────────────────────────

export async function fetchRoomChat(roomId: string, limit: number = 50): Promise<ChatMessage[]> {
    const { data, error } = await supabase
        .from('room_chat')
        .select(`
      id,
      room_id,
      user_id,
      message,
      created_at,
      profiles!room_chat_user_id_fkey (
        username
      )
    `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(limit);

    if (error) {
        console.error('Error fetching chat:', error);
        return [];
    }

    return (data || []).map((msg: any) => ({
        id: msg.id,
        room_id: msg.room_id,
        user_id: msg.user_id,
        message: msg.message,
        created_at: msg.created_at,
        username: msg.profiles?.username,
    }));
}

export async function sendChatMessage(roomId: string, message: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('room_chat')
        .insert({
            room_id: roomId,
            user_id: user.id,
            message,
        });

    if (error) throw error;
}

// ─────────────────────────────────────────────
// REALTIME SUBSCRIPTIONS
// ─────────────────────────────────────────────

export function subscribeToRoomChat(
    roomId: string,
    onNewMessage: (msg: ChatMessage) => void
) {
    const channel = supabase
        .channel(`room-chat-${roomId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'room_chat',
                filter: `room_id=eq.${roomId}`,
            },
            async (payload) => {
                const newMsg = payload.new as any;
                // Fetch username for the message
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('username')
                    .eq('user_id', newMsg.user_id)
                    .single();

                onNewMessage({
                    id: newMsg.id,
                    room_id: newMsg.room_id,
                    user_id: newMsg.user_id,
                    message: newMsg.message,
                    created_at: newMsg.created_at,
                    username: profile?.username || 'Unknown',
                });
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}

export function subscribeToRoomMembers(
    roomId: string,
    onMemberChange: () => void
) {
    const channel = supabase
        .channel(`room-members-${roomId}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'room_members',
                filter: `room_id=eq.${roomId}`,
            },
            () => {
                onMemberChange();
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

export function getPaceEmoji(pace: RoomPace): string {
    switch (pace) {
        case 'slow': return '🐢';
        case 'medium': return '🏃';
        case 'fast': return '⚡';
    }
}

export function getPaceLabel(pace: RoomPace): string {
    switch (pace) {
        case 'slow': return 'Chill (> 7 min/km)';
        case 'medium': return 'Medium (5-7 min/km)';
        case 'fast': return 'Fast (< 5 min/km)';
    }
}

export function formatStartTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMin / 60);

    if (diffMin < 0) return 'Started';
    if (diffMin < 1) return 'Starting now';
    if (diffMin < 60) return `In ${diffMin}m`;
    if (diffHrs < 24) return `In ${diffHrs}h ${diffMin % 60}m`;

    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}
