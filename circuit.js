console.log("WEBSITE RUNNING")
document.getElementById("year").textContent = new Date().getFullYear();

const COURSE_STORAGE_KEY = 'circuitCompletedCourses';
const LESSON_STORAGE_KEY = 'circuitCompletedLessons';
const COURSE_LESSONS = {
    BasicsOfElectronics: ['FindingEq', 'OhmsLaw', 'Capacitance', 'KCL', 'KVL']
};

function getCompletedCourses() {
    try {
        const stored = localStorage.getItem(COURSE_STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch (error) {
        console.warn('Unable to load completed courses', error);
        return {};
    }
}

function saveCompletedCourses(courses) {
    try {
        localStorage.setItem(COURSE_STORAGE_KEY, JSON.stringify(courses));
    } catch (error) {
        console.warn('Unable to save completed courses', error);
    }
}

function getCompletedLessons() {
    try {
        const stored = localStorage.getItem(LESSON_STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch (error) {
        console.warn('Unable to load completed lessons', error);
        return {};
    }
}

function saveCompletedLessons(lessons) {
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

function markCourseCompleted(courseId) {
    const current = getCompletedCourses();
    if (current[courseId]) return false;
    current[courseId] = true;
    saveCompletedCourses(current);
    updateCoursesPage();
    return true;
}

function markLessonCompleted(lessonId) {
    const current = getCompletedLessons();
    if (current[lessonId]) return false;
    current[lessonId] = true;
    saveCompletedLessons(current);
    return true;
}

function isCourseCompleteByLessons(courseId) {
    const completedLessons = getCompletedLessons();
    return getCourseLessons(courseId).every(lessonId => completedLessons[lessonId]);
}

function showPracticeCompletionBanner(lessonId, courseComplete) {
    let banner = document.getElementById('practice-completion-banner');
    const courseId = getCourseForLesson(lessonId);
    const lessonLabel = lessonId ? `${lessonId} practice` : 'This practice';
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

window.tryCompleteCourseIfPerfect = function(lessonId) {
    const problems = document.querySelectorAll('.problem');
    if (!problems.length) return false;

    const allCorrect = Array.from(problems).every(problem => problem.classList.contains('correct'));
    if (!allCorrect) return false;

    const lessonJustCompleted = markLessonCompleted(lessonId);
    const courseId = getCourseForLesson(lessonId);
    let courseJustCompleted = false;
    if (courseId && isCourseCompleteByLessons(courseId)) {
        courseJustCompleted = markCourseCompleted(courseId);
        if (!courseJustCompleted) {
            courseJustCompleted = !!getCompletedCourses()[courseId];
        }
    }

    showPracticeCompletionBanner(lessonId, courseJustCompleted);
    return courseJustCompleted || lessonJustCompleted;
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
    if (parentCourseId && (getCompletedCourses()[parentCourseId] || isCourseCompleteByLessons(parentCourseId))) {
        banner.querySelector('.completion-panel-box p').textContent = '✅ All lessons are complete, and the course is now marked complete.';
        banner.style.display = 'block';
    }
}

function initCompletionTracking() {
    updateCoursesPage();
    const courseId = document.body.dataset.courseId;
    const courseType = document.body.dataset.courseType;
    if (courseId && courseType === 'practice') {
        createPracticeCompletionBanner(courseId);
    }
}

initCompletionTracking();