// AIHelp-template.js - Copy to AIHelp.js & add your Groq API key for local/private use
// Committed version for GitHub Pages (demo, prompts for key)

const API_KEY = ''; // Paste your Groq key here (gsk_...) - gitignore AIHelp.js for local

const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

async function askAI(question) {
  hideAll();

  if (!API_KEY) {
    showError('🔑 Get free key: console.groq.com/keys → Copy file to AIHelp.js & paste key');
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
      body:
