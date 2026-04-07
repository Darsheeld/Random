function selectElement(id) {
    return document.getElementById(id);
}

function setMode(mode) {
    const loginTab = selectElement('login-tab');
    const signupTab = selectElement('signup-tab');
    const submitBtn = selectElement('submit-btn');
    const message = selectElement('auth-message');

    loginTab.classList.toggle('active', mode === 'login');
    signupTab.classList.toggle('active', mode === 'signup');
    submitBtn.textContent = mode === 'login' ? 'Login' : 'Create Account';
    message.textContent = '';
    message.classList.remove('error');
    message.classList.remove('success');
    return mode;
}

function showAuthMessage(text, type = 'error') {
    const message = selectElement('auth-message');
    message.textContent = text;
    message.classList.toggle('error', type === 'error');
    message.classList.toggle('success', type === 'success');
}

async function submitAuthForm(mode) {
    const emailField = selectElement('email');
    const passwordField = selectElement('password');
    const email = emailField.value.trim();
    const password = passwordField.value;

    if (!email || !password) {
        showAuthMessage('Please enter your email and password.');
        return;
    }

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();
        if (!response.ok) {
            showAuthMessage(result.error || 'Unable to sign in right now.');
            return;
        }

        showAuthMessage('Success! Redirecting to Courses...', 'success');
        window.location.href = 'courses.html';
    } catch (error) {
        showAuthMessage('Network error. Please try again.');
        console.error(error);
    }
}

async function initAuthPage() {
    let currentMode = 'login';
    setMode(currentMode);

    selectElement('login-tab').addEventListener('click', () => {
        currentMode = setMode('login');
    });
    selectElement('signup-tab').addEventListener('click', () => {
        currentMode = setMode('signup');
    });

    selectElement('auth-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        await submitAuthForm(currentMode);
    });

    try {
        const response = await fetch('/api/auth/me', { credentials: 'include' });
        if (response.ok) {
            const result = await response.json();
            if (result.authenticated) {
                showAuthMessage(`Already signed in as ${result.email}. Redirecting...`, 'success');
                setTimeout(() => {
                    window.location.href = 'courses.html';
                }, 1000);
            }
        }
    } catch (error) {
        console.error('Auth check failed', error);
    }
}

document.addEventListener('DOMContentLoaded', initAuthPage);
