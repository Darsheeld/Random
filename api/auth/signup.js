import { hashPassword, validateEmail, validatePassword, createSessionCookie, createSession } from '../_lib/auth.js';
import { readUsers, writeUsers, readProgress, writeProgress } from '../_lib/storage.js';

export default async function handler(req, res) {
    try {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        const { email, password } = req.body || {};
        if (!validateEmail(email) || !validatePassword(password)) {
            return res.status(400).json({ error: 'Please provide a valid email and a password with at least 6 characters.' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const users = await readUsers();
        if (users[normalizedEmail]) {
            return res.status(409).json({ error: 'An account with that email already exists.' });
        }

        const { salt, hash } = hashPassword(password);
        users[normalizedEmail] = { salt, passwordHash: hash };
        await writeUsers(users);

        const progress = await readProgress();
        progress[normalizedEmail] = { completedCourses: {}, completedLessons: {} };
        await writeProgress(progress);

        const token = await createSession(normalizedEmail);
        res.setHeader('Set-Cookie', createSessionCookie(token));
        return res.status(200).json({ email: normalizedEmail });
    } catch (error) {
        console.error('Signup error:', error);
        return res.status(500).json({ error: 'Server error during signup.' });
    }
}
