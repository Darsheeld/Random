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

function getLocalAccounts() {
    try {
        return JSON.parse(localStorage.getItem('circuitLocalAccounts') || '{}');
    } catch {
        return {};
    }
}

function saveLocalAccounts(accounts) {
    try {
        localStorage.setItem('circuitLocalAccounts', JSON.stringify(accounts));
    } catch (error) {
        console.warn('Unable to save local accounts', error);
    }
}

async function computeHash(value) {
    if (!window.crypto || !window.crypto.subtle) {
        return value;
    }
    const data = new TextEncoder().encode(value);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function saveLocalAccount(email, password) {
    const accounts = getLocalAccounts();
    accounts[email.toLowerCase()] = await computeHash(password);
    saveLocalAccounts(accounts);
}

async function verifyLocalAccount(email, password) {
    const accounts = getLocalAccounts();
    const storedHash = accounts[email.toLowerCase()];
    if (!storedHash) return false;
    return storedHash === await computeHash(password);
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

        let result;
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            result = await response.json();
        } else {
            const text = await response.text();
            result = { error: text || 'Unexpected server response' };
        }

        if (!response.ok) {
            const detail = result.details ? ` ${result.details}` : '';
            if (mode === 'signup' && response.status >= 500) {
                await saveLocalAccount(email, password);
                currentUser = { email };
                window.renderAuthNav();
                showAuthMessage('Account created locally because the server storage is unavailable. Redirecting to Courses...', 'success');
                setTimeout(() => window.location.href = 'courses.html', 1500);
                return;
            }
            if (mode === 'login' && response.status === 401) {
                const localOk = await verifyLocalAccount(email, password);
                if (localOk) {
                    currentUser = { email };
                    window.renderAuthNav();
                    showAuthMessage('Logged in locally because the server can\'t find your account right now. Redirecting to Courses...', 'success');
                    setTimeout(() => window.location.href = 'courses.html', 1500);
                    return;
                }
            }
            showAuthMessage(`${result.error || 'Unable to sign in right now.'}${detail}`);
            return;
        }

        if (mode === 'signup') {
            await saveLocalAccount(email, password);
        }

        currentUser = { email: result.email };
        window.renderAuthNav();
        showAuthMessage('Success! You are now logged in. Redirecting to Courses...', 'success');
        setTimeout(() => window.location.href = 'courses.html', 1500);
    } catch (error) {
        const localOk = mode === 'login' ? await verifyLocalAccount(email, password) : false;
        if (localOk) {
            showAuthMessage('Logged in locally because the server is unavailable.', 'success');
            window.location.href = 'courses.html';
            return;
        }
        if (mode === 'signup') {
            await saveLocalAccount(email, password);
            showAuthMessage('Account created locally because the server is unavailable. You can log in on this device.', 'success');
            window.location.href = 'courses.html';
            return;
        }
        showAuthMessage(error && error.message ? `Network error: ${error.message}` : 'Network error. Please try again.');
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
