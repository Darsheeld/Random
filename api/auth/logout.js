import { getSession, deleteSession, clearSessionCookie } from '../_lib/auth.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const session = await getSession(req);
    if (session) {
        await deleteSession(session.token);
    }

    res.setHeader('Set-Cookie', clearSessionCookie());
    return res.status(200).json({ success: true });
}
