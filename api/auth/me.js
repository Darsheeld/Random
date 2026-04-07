import { getSession, clearSessionCookie } from '../_lib/auth.js';

export default async function handler(req, res) {
    try {
        const session = await getSession(req);
        if (!session) {
            res.setHeader('Set-Cookie', clearSessionCookie());
            return res.status(200).json({ authenticated: false });
        }

        return res.status(200).json({ authenticated: true, email: session.email });
    } catch (error) {
        console.error('Session check error:', error);
        res.setHeader('Set-Cookie', clearSessionCookie());
        return res.status(500).json({ authenticated: false, error: 'Server error checking session.' });
    }
}
