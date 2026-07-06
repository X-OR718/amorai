// api/chat.js — OpenRouter proxy + optional Supabase persistence (CommonJS).
// Behaviour is unchanged for signed-out users. When an Authorization: Bearer
// token is present, the user's message and Sofia's reply are saved to Supabase.
const { admin, getUser } = require('./_supabase.js');

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { messages } = req.body;

    try {
        // Who is asking? (null when signed out — chat still works, just no save)
        const user = await getUser(req);

        // Persist the user's latest message before calling the model.
        const lastUser = Array.isArray(messages)
            ? [...messages].reverse().find(m => m.role === 'user')
            : null;
        if (user && lastUser) {
            await admin.from('chats').insert({
                user_id: user.id, role: 'user', content: lastUser.content
            });
        }

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'https://amorai-sigma.vercel.app',
                'X-Title': 'Amorai'
            },
            body: JSON.stringify({
                model: 'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
                messages: messages,
                max_tokens: 500,
                temperature: 0.9
            })
        });

        const data = await response.json();

        // Persist Sofia's reply.
        const reply = data && data.choices && data.choices[0] && data.choices[0].message
            ? data.choices[0].message.content : null;
        if (user && reply) {
            await admin.from('chats').insert({
                user_id: user.id, role: 'assistant', content: reply
            });
        }

        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to connect' });
    }
};
