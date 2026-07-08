// api/history.js — load a signed-in user's saved chat + photos.
// GET with header:  Authorization: Bearer <supabase access token>
import { admin, getUser } from './_supabase.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const user = await getUser(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    try {
        const [{ data: profile }, { data: chats }, { data: photos }] = await Promise.all([
            admin.from('profiles').select('*').eq('id', user.id).single(),
            admin.from('chats').select('role,content,image_url,created_at')
                 .eq('user_id', user.id).order('created_at', { ascending: true }).limit(500),
            admin.from('photos').select('url,prompt,created_at')
                 .eq('user_id', user.id).order('created_at', { ascending: false }).limit(100)
        ]);
        return res.status(200).json({ profile, chats: chats || [], photos: photos || [] });
    } catch (error) {
        console.error('History error:', error);
        return res.status(500).json({ error: 'Failed to load history', details: error.message });
    }
}
