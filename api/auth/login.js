import { verifyPassword, validateEmail, validatePassword, createSessionCookie, createSession } from '../_lib/auth.js';
import { readUsers } from '../_lib/storage.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, password } = req.body || {};
    if (!validateEmail(email) || !validatePassword(password)) {
        return res.status(400).json({ error: 'Please provide a valid email and password.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const users = await readUsers();
    const user = users[normalizedEmail];
    if (!user || !verifyPassword(password, user.salt, user.passwordHash)) {
        return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = await createSession(normalizedEmail);
    res.setHeader('Set-Cookie', createSessionCookie(token));
    return res.status(200).json({ email: normalizedEmail });
}
