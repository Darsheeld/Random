console.log("WEBSITE RUNNING");
document.getElementById("year").textContent = new Date().getFullYear();

const COURSE_STORAGE_KEY = 'circuitCompletedCourses';
const LESSON_STORAGE_KEY = 'circuitCompletedLessons';
const COURSE_LESSONS = {
    BasicsOfElectronics: ['FindingEq', 'OhmsLaw', 'Capacitance', 'KCL', 'KVL']
};

let currentUser = null;
let userProgress = null;

function getLocalCompletedCourses() {
    try {
        const stored = localStorage.getItem(COURSE_STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch (error) {
        console.warn('Unable to load completed courses', error);
        return {};
    }
}

function saveLocalCompletedCourses(courses) {
    try {
        localStorage.setItem(COURSE_STORAGE_KEY, JSON.stringify(courses));
    } catch (error) {
        console.warn('Unable to save completed courses', error);
    }
}

function getLocalCompletedLessons() {
    try {
        const stored = localStorage.getItem(LESSON_STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch (error) {
        console.warn('Unable to load completed lessons', error);
        return {};
    }
}

function saveLocalCompletedLessons(lessons) {
    try {
        localStorage.setItem(LESSON_STORAGE_KEY, JSON.stringify(lessons));
    } catch (error) {
        console.warn('Unable to save completed lessons', error);
    }
}

function getCourseForLesson(lessonId) {
    return Object.keys(COURSE_LESSONS).find(courseId => COURSE_LESSONS[courseId].includes(lessonId));
}

function getCourseLessons(courseId) {
    return COURSE_LESSONS[courseId] || [];
}

function getCompletedCourses() {
    return userProgress ? (userProgress.completedCourses || {}) : getLocalCompletedCourses();
}

function getCompletedLessons() {
    return userProgress ? (userProgress.completedLessons || {}) : getLocalCompletedLessons();
}

async function updateRemoteProgress(update) {
    if (!currentUser) return;
    try {
        await fetch('/api/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(update)
        });
    } catch (error) {
        console.warn('Unable to sync progress to server', error);
    }
}

async function fetchAuthState() {
    try {
        const response = await fetch('/api/auth/me', { credentials: 'include' });
        if (!response.ok) return;
        const json = await response.json();
        if (json.authenticated) {
            currentUser = { email: json.email };
        }
    } catch (error) {
        console.warn('Unable to fetch auth state', error);
    }
}

async function fetchUserProgress() {
    if (!currentUser) return;
    try {
        const response = await fetch('/api/progress', { credentials: 'include' });
        if (!response.ok) return;
        const json = await response.json();
        userProgress = json.progress || { completedCourses: {}, completedLessons: {} };
    } catch (error) {
        console.warn('Unable to fetch user progress', error);
    }
}

function renderAuthNav() {
    const navList = document.querySelector('nav ul');
    if (!navList) return;

    const existingAuth = document.getElementById('auth-nav-item');
    if (existingAuth) {
        existingAuth.remove();
    }
    const existingLogout = document.getElementById('logout-nav-item');
    if (existingLogout) {
        existingLogout.remove();
    }

    const authItem = document.createElement('li');
    authItem.id = 'auth-nav-item';
    if (currentUser) {
        const displayName = currentUser.email.split('@')[0];
        const initial = currentUser.email.charAt(0).toUpperCase();
        authItem.innerHTML = `
            <div class="user-profile">
                <div class="profile-pic">${initial}</div>
                <span class="user-name">${displayName}</span>
            </div>
        `;
        navList.appendChild(authItem);

        const logoutItem = document.createElement('li');
        logoutItem.id = 'logout-nav-item';
        logoutItem.innerHTML = `<a href="#" id="logout-link">Logout</a>`;
        navList.appendChild(logoutItem);

        const logoutLink = logoutItem.querySelector('#logout-link');
        logoutLink.addEventListener('click', async (event) => {
            event.preventDefault();
            try {
                await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
            } catch (error) {
                console.warn('Logout failed', error);
            }
            currentUser = null;
            userProgress = null;
            renderAuthNav();
            window.location.href = 'index.html';
        });
    } else {
        authItem.innerHTML = `<a href="login.html">Login / Signup</a>`;
        navList.appendChild(authItem);
    }
}

function updateCoursesPage() {
    const cards = document.querySelectorAll('.course-card[data-course-id]');
    if (!cards.length) return;

    const completed = getCompletedCourses();
    cards.forEach(card => {
        const courseId = card.dataset.courseId;
        if (completed[courseId]) {
            card.classList.add('completed');
        } else {
            card.classList.remove('completed');
        }
    });
}

async function markCourseCompleted(courseId) {
    const current = getCompletedCourses();
    if (current[courseId]) return false;

    current[courseId] = true;
    saveLocalCompletedCourses(current);
    if (currentUser) {
        await updateRemoteProgress({ courseId });
        if (userProgress) {
            userProgress.completedCourses = { ...userProgress.completedCourses, [courseId]: true };
        }
    }
    updateCoursesPage();
    return true;
}

async function markLessonCompleted(lessonId) {
    const current = getCompletedLessons();
    if (current[lessonId]) return false;

    current[lessonId] = true;
    saveLocalCompletedLessons(current);
    if (currentUser) {
        await updateRemoteProgress({ lessonId });
        if (userProgress) {
            userProgress.completedLessons = { ...userProgress.completedLessons, [lessonId]: true };
        }
    }
    return true;
}

function isCourseCompleteByLessons(courseId) {
    const completedLessons = getCompletedLessons();
    return getCourseLessons(courseId).every(lessonId => completedLessons[lessonId]);
}

function showPracticeCompletionBanner(lessonId, courseComplete) {
    let banner = document.getElementById('practice-completion-banner');
    const message = courseComplete
        ? `✅ Perfect score! All lessons are complete, and the course is now marked complete.`
        : `✅ Perfect score! This lesson is complete. Finish every lesson to complete the full course.`;

    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'practice-completion-banner';
        banner.className = 'completion-panel';
        banner.innerHTML = `
            <div class="completion-panel-box">
                <p>${message}</p>
            </div>
        `;
        const container = document.querySelector('.container');
        if (container) {
            container.insertBefore(banner, container.firstChild);
        }
    } else {
        const paragraph = banner.querySelector('.completion-panel-box p');
        if (paragraph) {
            paragraph.textContent = message;
        }
    }
    banner.style.display = 'block';
}

window.tryCompleteCourseIfPerfect = async function(lessonId) {
    const problems = document.querySelectorAll('.problem');
    if (!problems.length) return false;

    const allCorrect = Array.from(problems).every(problem => problem.classList.contains('correct'));
    if (!allCorrect) return false;

    const lessonJustCompleted = await markLessonCompleted(lessonId);
    const courseId = getCourseForLesson(lessonId);
    let courseJustCompleted = false;
    if (courseId && isCourseCompleteByLessons(courseId)) {
        courseJustCompleted = await markCourseCompleted(courseId);
        if (!courseJustCompleted) {
            courseJustCompleted = !!getCompletedCourses()[courseId];
        }
    }

    const courseComplete = courseJustCompleted || (courseId && isCourseCompleteByLessons(courseId));
    showPracticeCompletionBanner(lessonId, courseComplete);
    return courseComplete || lessonJustCompleted;
};

function createPracticeCompletionBanner(lessonId) {
    const container = document.querySelector('.container');
    if (!container) return;

    const banner = document.createElement('div');
    banner.id = 'practice-completion-banner';
    banner.className = 'completion-panel';
    banner.style.display = 'none';
    banner.innerHTML = `
        <div class="completion-panel-box">
            <p>✅ Perfect score! This lesson is complete. Finish every lesson to complete the full course.</p>
        </div>
    `;

    container.insertBefore(banner, container.firstChild);

    const parentCourseId = getCourseForLesson(lessonId);
    if (parentCourseId && getCompletedCourses()[parentCourseId]) {
        banner.querySelector('.completion-panel-box p').textContent = '✅ All lessons are complete, and the course is now marked complete.';
        banner.style.display = 'block';
    }
}

async function initCompletionTracking() {
    await fetchAuthState();
    renderAuthNav();
    await fetchUserProgress();
    renderAuthNav();
    updateCoursesPage();

    const courseId = document.body.dataset.courseId;
    const courseType = document.body.dataset.courseType;
    if (courseId && courseType === 'practice') {
        createPracticeCompletionBanner(courseId);
    }
}

initCompletionTracking().catch(error => console.error(error));