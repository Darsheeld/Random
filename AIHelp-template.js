// AIHelp-template.js - Copy this to AIHelp.js and add your Groq API key for local use
// Repo version for GitHub Pages demo (needs key for full function)
// Free key: https://console.groq.com/keys

const API_KEY = ''; // Add: const API_KEY = 'gsk_your_key_here';

const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

async function askAI(question) {
  hideAll();

  if (!API_KEY) {
    showError('🚀 Get free Groq key at console.groq.com/keys, paste in AIHelp.js (local, gitignored)');
    return;
  }

  showThinking();

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: "You are a friendly electronics and circuit assistant. Explain concepts simply with examples. Topics: Ohm's Law, Kirchhoff's laws (KCL/KVL), capacitance, series/parallel circuits, etc. Keep concise and helpful."
          },
          { role: 'user', content: question }
        ],
        max_tokens: 400,
        temperature: 0.7
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Groq API ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    showAnswer(data.choices[0].message.content.trim());
  } catch (error) {
    console.error('Error:', error);
    showError(`AI failed: ${error.message}`);
  }
}

function showThinking() {
  document.getElementById('thinking').style.display = 'block';
}

function showAnswer(text) {
  hideAll();
  document.getElementById('answer').textContent = text;
  document.getElementById('response').style.display = 'block';
}

function showError(message) {
  hideAll();
  document.getElementById('error-message').textContent = message;
  document.getElementById('error').style.display = 'block';
}

function hideAll() {
  document.getElementById('thinking').style.display = 'none';
  document.getElementById('response').style.display = 'none';
  document.getElementById('error').style.display = 'none';
}

setInterval(() => {
  if (document.getElementById('error').style.display === 'block') hideAll();
}, 10000);
