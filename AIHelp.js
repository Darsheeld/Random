// AI Help JavaScript - Backend proxy integration for electronics tutoring
// Calls local /api/ask endpoint which securely uses Groq API with server-side credentials

async function askAI(question) {
    const thinkingEl = document.getElementById('thinking');
    const responseEl = document.getElementById('response');
    const answerEl = document.getElementById('answer');
    const errorEl = document.getElementById('error');
    const errorMsgEl = document.getElementById('error-message');

    thinkingEl.style.display = 'block';
    responseEl.style.display = 'none';
    errorEl.style.display = 'none';

    try {
        const apiResponse = await fetch('/api/ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                question: question
            })
        });

        if (!apiResponse.ok) {
            const errText = await apiResponse.text();
            console.error('Full API Error:', errText);
            throw new Error(`HTTP ${apiResponse.status}: ${apiResponse.statusText}. See console for details.`);
        }

        const data = await apiResponse.json();
        const answer = data.answer || 'No response.';

        // Simple Markdown to HTML
        let formatted = answer
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^\\*\\*\\*(.*?)\\*\\*\\*/gm, '<h3>$1</h3>')
            .replace(/^-\\s+(.*)$/gm, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/g, '<ul>$&</ul>');

        answerEl.innerHTML = formatted;
        responseEl.style.display = 'block';

    } catch (error) {
        console.error('AI Error:', error);
        errorMsgEl.textContent = error.message + ' (Check console F12). Local dev should work.';
        errorEl.style.display = 'block';
    } finally {
        thinkingEl.style.display = 'none';
    }
}
