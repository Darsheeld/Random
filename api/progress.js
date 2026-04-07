import { getSession } from './_lib/auth.js';
import { readProgress, writeProgress } from './_lib/storage.js';

export default async function handler(req, res) {
    try {
        const session = await getSession(req);
        if (!session) {
            return res.status(401).json({ error: 'Authentication required.' });
        }

        const allProgress = await readProgress();
        const userProgress = allProgress[session.email] || { completedCourses: {}, completedLessons: {} };

        if (req.method === 'GET') {
            return res.status(200).json({ progress: userProgress });
        }

        if (req.method === 'POST') {
            const { lessonId, courseId, completedLessons, completedCourses } = req.body || {};
            const updatedProgress = {
                completedCourses: { ...userProgress.completedCourses },
                completedLessons: { ...userProgress.completedLessons }
            };

            if (lessonId) {
                updatedProgress.completedLessons[lessonId] = true;
            }
            if (courseId) {
                updatedProgress.completedCourses[courseId] = true;
            }
            if (completedLessons && typeof completedLessons === 'object') {
                Object.assign(updatedProgress.completedLessons, completedLessons);
            }
            if (completedCourses && typeof completedCourses === 'object') {
                Object.assign(updatedProgress.completedCourses, completedCourses);
            }

            allProgress[session.email] = updatedProgress;
            await writeProgress(allProgress);
            return res.status(200).json({ progress: updatedProgress });
        }

        return res.status(405).json({ error: 'Method not allowed.' });
    } catch (error) {
        console.error('Progress error:', error);
        return res.status(500).json({ error: 'Server error while updating progress.' });
    }
}
