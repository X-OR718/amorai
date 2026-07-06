// api/_supabase.js
// Shared server-side helpers (CommonJS, to match this repo's api/chat.js).
// Uses the SECRET key, so this file only ever runs in Vercel serverless
// functions — never bundled to the browser.
const { createClient } = require('@supabase/supabase-js');

// Admin client: bypasses RLS. For trusted server-side writes only.
const admin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

// Resolve the authenticated user from the request's Bearer token (or null).
// This is how the server trusts "who is asking" without trusting the body.
async function getUser(req) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return null;
    const { data, error } = await admin.auth.getUser(token);
    if (error) return null;
    return data.user || null;
}

module.exports = { admin, getUser };
