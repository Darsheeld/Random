export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  try {
    const apiResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are an AI that may ask you any questions they have. YOUR NAME IS CIRQUI'
          },
          { role: 'user', content: question }
        ],
        temperature: 0.7,
        max_tokens: 800,
        stream: false
      })
    });

    if (!apiResponse.ok) {
      const errText = await apiResponse.text();
      console.error('Groq API Error:', errText);
      return res.status(apiResponse.status).json({ error: `API Error: ${apiResponse.statusText}` });
    }

    const data = await apiResponse.json();
    const answer = data.choices[0].message.content || 'No response.';

    res.status(200).json({ answer });
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}