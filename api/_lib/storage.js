import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', '_data');
const usersFile = path.join(dataDir, 'users.json');
const sessionsFile = path.join(dataDir, 'sessions.json');
const progressFile = path.join(dataDir, 'progress.json');

async function ensureDataFile(filePath) {
    try {
        await fs.access(filePath);
    } catch {
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, '{}', 'utf8');
    }
}

async function readJson(filePath) {
    await ensureDataFile(filePath);
    const content = await fs.readFile(filePath, 'utf8');
    if (!content) return {};

    try {
        return JSON.parse(content);
    } catch (error) {
        console.warn(`Corrupted JSON in ${filePath}. Replacing with empty object.`, error.message);
        await fs.writeFile(filePath, '{}', 'utf8');
        return {};
    }
}

async function writeJson(filePath, data) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

export async function readUsers() {
    return readJson(usersFile);
}

export async function writeUsers(data) {
    return writeJson(usersFile, data);
}

export async function readSessions() {
    return readJson(sessionsFile);
}

export async function writeSessions(data) {
    return writeJson(sessionsFile, data);
}

export async function readProgress() {
    return readJson(progressFile);
}

export async function writeProgress(data) {
    return writeJson(progressFile, data);
}
