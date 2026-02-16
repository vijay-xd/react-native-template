import { supabase } from '../lib/supabase';

// ─────────────────────────────────────────────
// FRIEND REQUESTS
// ─────────────────────────────────────────────

export async function sendFriendRequest(receiverId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('friend_requests')
        .insert({ sender_id: user.id, receiver_id: receiverId });

    if (error) throw error;
}

export async function acceptFriendRequest(requestId: string) {
    const { error } = await supabase.rpc('accept_friend_request', {
        request_id: requestId,
    });
    if (error) throw error;
}

export async function rejectFriendRequest(requestId: string) {
    const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);
    if (error) throw error;
}

export async function fetchPendingRequests() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('friend_requests')
        .select(`
      id,
      sender_id,
      status,
      created_at,
      profiles!friend_requests_sender_id_fkey (
        username,
        avatar_url,
        level,
        total_distance_km
      )
    `)
        .eq('receiver_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching requests:', error);
        return [];
    }
    return data || [];
}

export async function fetchFriends() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('friends')
        .select(`
      id,
      friend_id,
      created_at,
      profiles!friends_friend_id_fkey (
        username,
        avatar_url,
        level,
        total_distance_km,
        xp,
        city
      )
    `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching friends:', error);
        return [];
    }
    return data || [];
}

export async function removeFriend(friendId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Remove both directions
    const { error: err1 } = await supabase
        .from('friends')
        .delete()
        .eq('user_id', user.id)
        .eq('friend_id', friendId);

    const { error: err2 } = await supabase
        .from('friends')
        .delete()
        .eq('user_id', friendId)
        .eq('friend_id', user.id);

    if (err1) throw err1;
    if (err2) throw err2;
}

export async function searchUsers(query: string) {
    const { data, error } = await supabase
        .from('profiles')
        .select('user_id, username, avatar_url, level, city, total_distance_km')
        .ilike('username', `%${query}%`)
        .limit(20);

    if (error) {
        console.error('Error searching users:', error);
        return [];
    }
    return data || [];
}

// ─────────────────────────────────────────────
// CREWS
// ─────────────────────────────────────────────

export async function createCrew(name: string, tag: string, color: string, description?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('crews')
        .insert({
            name,
            tag,
            color,
            description,
            leader_id: user.id,
            member_count: 1,
        })
        .select()
        .single();

    if (error) throw error;

    // Add creator as leader member
    await supabase.from('crew_members').insert({
        crew_id: data.id,
        user_id: user.id,
        role: 'leader',
    });

    return data;
}

export async function fetchCrews(city?: string) {
    let query = supabase
        .from('crews')
        .select('*')
        .order('total_area_km2', { ascending: false })
        .limit(50);

    if (city) {
        query = query.eq('city', city);
    }

    const { data, error } = await query;
    if (error) {
        console.error('Error fetching crews:', error);
        return [];
    }
    return data || [];
}

export async function fetchCrewDetails(crewId: string) {
    const { data, error } = await supabase
        .from('crews')
        .select(`
      *,
      crew_members (
        user_id,
        role,
        contribution_area,
        contribution_runs,
        joined_at,
        profiles!crew_members_user_id_fkey (
          username,
          avatar_url,
          level,
          total_distance_km
        )
      )
    `)
        .eq('id', crewId)
        .single();

    if (error) {
        console.error('Error fetching crew details:', error);
        return null;
    }
    return data;
}

export async function joinCrew(crewId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('crew_members')
        .insert({ crew_id: crewId, user_id: user.id, role: 'member' });

    if (error) throw error;

    // Increment member count
    await supabase.rpc('increment_crew_member_count', { p_crew_id: crewId });
}

export async function leaveCrew(crewId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('crew_members')
        .delete()
        .eq('crew_id', crewId)
        .eq('user_id', user.id);

    if (error) throw error;
}

// ─────────────────────────────────────────────
// RUN HISTORY
// ─────────────────────────────────────────────

export async function fetchRunHistory(limit: number = 20) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('runs')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'finished')
        .order('started_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching run history:', error);
        return [];
    }
    return data || [];
}

export async function fetchRunDetails(runId: string) {
    const { data, error } = await supabase
        .from('runs')
        .select('*')
        .eq('id', runId)
        .single();

    if (error) {
        console.error('Error fetching run:', error);
        return null;
    }
    return data;
}

// ─────────────────────────────────────────────
// LEADERBOARD
// ─────────────────────────────────────────────

export type LeaderboardScope = 'nearby' | 'city' | 'state' | 'global';

export async function fetchLeaderboard(scope: LeaderboardScope, params?: {
    city?: string;
    state?: string;
    lat?: number;
    lng?: number;
}) {
    if (scope === 'nearby' && params?.lat && params?.lng) {
        const { data, error } = await supabase.rpc('get_nearby_leaderboard', {
            p_lat: params.lat,
            p_lng: params.lng,
            p_radius_km: 5,
        });
        if (error) {
            console.error('Leaderboard error:', error);
            return [];
        }
        return data || [];
    }

    let query = supabase
        .from('profiles')
        .select('user_id, username, avatar_url, level, xp, total_distance_km, city')
        .order('xp', { ascending: false })
        .limit(50);

    if (scope === 'city' && params?.city) {
        query = query.eq('city', params.city);
    }
    if (scope === 'state' && params?.state) {
        query = query.eq('state', params.state);
    }

    const { data, error } = await query;
    if (error) {
        console.error('Leaderboard error:', error);
        return [];
    }
    return data || [];
}

// ─────────────────────────────────────────────
// PROFILE
// ─────────────────────────────────────────────

export async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (error) {
        console.error('Error fetching profile:', error);
        return null;
    }
    return data;
}

export async function updateProfile(updates: Record<string, any>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);

    if (error) throw error;
}

// ─────────────────────────────────────────────
// PARTIES
// ─────────────────────────────────────────────

export async function createParty(name: string, objectiveType: string, objectiveTarget?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('parties')
        .insert({
            leader_id: user.id,
            name,
            objective_type: objectiveType,
            objective_target: objectiveTarget,
        })
        .select()
        .single();

    if (error) throw error;

    // Add creator as leader member
    await supabase.from('party_members').insert({
        party_id: data.id,
        user_id: user.id,
        role: 'leader',
        status: 'accepted',
    });

    return data;
}

export async function fetchActiveParty() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('party_members')
        .select(`
      party_id,
      role,
      parties!party_members_party_id_fkey (
        id,
        name,
        leader_id,
        status,
        objective_type,
        objective_target,
        max_size,
        created_at
      )
    `)
        .eq('user_id', user.id)
        .eq('status', 'accepted')
        .in('parties.status', ['lobby', 'running'])
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error('Error fetching party:', error);
        return null;
    }
    return data;
}
