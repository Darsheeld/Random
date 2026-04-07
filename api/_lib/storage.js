import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultDataDir = path.join(__dirname, '..', '_data');
const fallbackDataDir = process.env.DATA_DIR || path.join(process.env.TMPDIR || '/tmp', 'circuit_data');
let resolvedDataDir = null;

async function getDataDir() {
    if (resolvedDataDir) return resolvedDataDir;

    const candidates = [process.env.DATA_DIR, defaultDataDir, fallbackDataDir].filter(Boolean);
    for (const candidate of candidates) {
        try {
            await fs.mkdir(candidate, { recursive: true });
            await fs.access(candidate, fs.constants.R_OK | fs.constants.W_OK);
            resolvedDataDir = candidate;
            return candidate;
        } catch (error) {
            if (error.code === 'EACCES' || error.code === 'EROFS' || error.code === 'ENOENT') {
                continue;
            }
            console.warn(`Storage directory probe failed for ${candidate}:`, error.message);
        }
    }

    throw new Error('No writable storage directory available');
}

async function getFilePath(filename) {
    const dir = await getDataDir();
    return path.join(dir, filename);
}

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
    return readJson(await getFilePath('users.json'));
}

export async function writeUsers(data) {
    return writeJson(await getFilePath('users.json'), data);
}

export async function readSessions() {
    return readJson(await getFilePath('sessions.json'));
}

export async function writeSessions(data) {
    return writeJson(await getFilePath('sessions.json'), data);
}

export async function readProgress() {
    return readJson(await getFilePath('progress.json'));
}

export async function writeProgress(data) {
    return writeJson(await getFilePath('progress.json'), data);
}
