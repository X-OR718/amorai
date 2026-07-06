// api/generate-image.js — OPTIONAL fal.ai photo generation (CommonJS).
// NOT wired into the UI by default: this repo ships a curated SFW/NSFW image
// set that fits Sofia's look. This endpoint is here if you later want a
// "generate a custom photo" action. Requires FAL_KEY in env.
//
// POST { prompt } with header Authorization: Bearer <supabase access token>.
// Generates with fal.ai FLUX-schnell, re-uploads to Supabase Storage (so the
// URL is permanent), logs a photos + chats row, returns { url }.
const { admin, getUser } = require('./_supabase.js');

const FAL_MODEL = 'fal-ai/flux/schnell';

function buildPrompt(userPrompt) {
    const base =
        'photorealistic portrait of Sofia, a beautiful 24-year-old woman, ' +
        'olive skin, long dark wavy hair, warm brown eyes, soft natural lighting, ' +
        'high detail, instagram selfie style';
    return userPrompt ? `${base}, ${userPrompt}` : base;
}

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const user = await getUser(req);
    if (!user) return res.status(401).json({ error: 'Sign in to generate photos' });

    try {
        const { prompt } = req.body || {};

        // Enforce the free-photo quota server-side.
        const { data: profile } = await admin
            .from('profiles').select('free_images,is_premium').eq('id', user.id).single();
        if (profile && !profile.is_premium && profile.free_images <= 0) {
            return res.status(402).json({ error: 'No free photos left', paywall: true });
        }

        // 1. generate with fal.ai (synchronous endpoint)
        const falRes = await fetch(`https://fal.run/${FAL_MODEL}`, {
            method: 'POST',
            headers: {
                'Authorization': `Key ${process.env.FAL_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt: buildPrompt(prompt), image_size: 'portrait_4_3', num_images: 1 })
        });
        if (!falRes.ok) {
            return res.status(502).json({ error: 'Image generation failed' });
        }
        const falData = await falRes.json();
        const tempUrl = falData && falData.images && falData.images[0] && falData.images[0].url;
        if (!tempUrl) return res.status(502).json({ error: 'No image returned' });

        // 2. download and re-upload to Supabase Storage (makes it permanent)
        const imgResp = await fetch(tempUrl);
        const bytes = Buffer.from(await imgResp.arrayBuffer());
        const path = `${user.id}/${Date.now()}.jpg`;
        const { error: upErr } = await admin.storage.from('photos')
            .upload(path, bytes, { contentType: 'image/jpeg', upsert: false });
        if (upErr) throw upErr;
        const { data: pub } = admin.storage.from('photos').getPublicUrl(path);
        const url = pub.publicUrl;

        // 3. record it + decrement quota
        await admin.from('photos').insert({
            user_id: user.id, prompt: prompt || null, url, provider: 'fal.ai'
        });
        await admin.from('chats').insert({
            user_id: user.id, role: 'assistant', content: 'Just for you 😘', image_url: url
        });
        if (profile && !profile.is_premium) {
            await admin.from('profiles')
                .update({ free_images: Math.max(0, profile.free_images - 1) })
                .eq('id', user.id);
        }

        return res.status(200).json({ url });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to generate image', details: error.message });
    }
};
