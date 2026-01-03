module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { messages } = req.body;

    try {
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
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to connect' });
    }
};
