import crypto from 'crypto';
import { readUsers, writeUsers, readSessions, writeSessions } from './storage.js';

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return { salt, hash };
}

export function verifyPassword(password, salt, hash) {
    const derivedHash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(derivedHash, 'hex'), Buffer.from(hash, 'hex'));
}

export function createSessionCookie(token) {
    return `sessionToken=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE_SECONDS}`;
}

export function clearSessionCookie() {
    return 'sessionToken=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0';
}

export async function createSession(email) {
    const sessions = await readSessions();
    const token = crypto.randomUUID();
    sessions[token] = {
        email,
        createdAt: Date.now(),
        expiresAt: Date.now() + SESSION_MAX_AGE_SECONDS * 1000
    };
    await writeSessions(sessions);
    return token;
}

export async function getSession(req) {
    const cookie = req.headers.cookie || '';
    const match = cookie.match(/(?:^|;)\s*sessionToken=([^;]+)/);
    if (!match) return null;
    const token = match[1];
    const sessions = await readSessions();
    const session = sessions[token];
    if (!session || session.expiresAt < Date.now()) {
        return null;
    }
    return { token, email: session.email };
}

export async function deleteSession(token) {
    const sessions = await readSessions();
    if (sessions[token]) {
        delete sessions[token];
        await writeSessions(sessions);
    }
}

export function validateEmail(email) {
    return typeof email === 'string' && email.trim().length >= 5 && /@/.test(email);
}

export function validatePassword(password) {
    return typeof password === 'string' && password.length >= 6;
}
