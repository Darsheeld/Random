// AI Help JavaScript - Backend proxy integration for electronics tutoring
// Uses local /api/ask endpoint with chat-style messages and a conversation history.

const chatWindow = document.getElementById('chat-window');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatError = document.getElementById('chat-error');
const clearChatBtn = document.getElementById('clear-chat');

let conversation = [];
let isLoading = false;

function appendMessage(role, content) {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${role}`;
    const label = role === 'user' ? 'You' : 'CIRQUI';
    messageEl.innerHTML = `<p><strong>${label}:</strong> ${formatMessage(content)}</p>`;
    chatWindow.appendChild(messageEl);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function formatMessage(text) {
    const html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>');
    return html;
}

function setLoading(state) {
    isLoading = state;
    const button = chatForm.querySelector('button[type="submit"]');
    button.disabled = state;
    button.textContent = state ? 'Thinking...' : 'Send';
}

function showError(message) {
    chatError.textContent = message;
    chatError.style.display = 'block';
}

function hideError() {
    chatError.style.display = 'none';
    chatError.textContent = '';
}

async function askAI(messages) {
    const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages })
    });

    if (!response.ok) {
        const errText = await response.text();
        console.error('Full API Error:', errText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}. Check console for details.`);
    }

    const data = await response.json();
    return data.answer || 'No response.';
}

chatForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (isLoading) return;

    const userText = chatInput.value.trim();
    if (!userText) return;

    hideError();
    chatInput.value = '';
    appendMessage('user', userText);
    conversation.push({ role: 'user', content: userText });
    setLoading(true);

    try {
        const assistantText = await askAI(conversation);
        appendMessage('assistant', assistantText);
        conversation.push({ role: 'assistant', content: assistantText });
    } catch (error) {
        console.error('AI Error:', error);
        showError(error.message + ' (See console.)');
        appendMessage('assistant', 'Sorry, I could not get a response. Please try again.');
    } finally {
        setLoading(false);
    }
});

clearChatBtn.addEventListener('click', () => {
    conversation = [];
    chatWindow.innerHTML = `
        <div class="chat-start">
            <div class="message assistant">
                <p><strong>CIRQUI:</strong> Hi! I'm your circuit assistant. Ask me anything about Ohm's Law, Kirchhoff's rules, or electrical engineering concepts.</p>
            </div>
        </div>`;
    hideError();
    chatInput.focus();
});

chatInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        chatForm.requestSubmit();
    }
});
