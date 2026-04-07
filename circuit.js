console.log("WEBSITE RUNNING")
document.getElementById("year").textContent = new Date().getFullYear();

const COURSE_STORAGE_KEY = 'circuitCompletedCourses';

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

function showPracticeCompletionBanner(courseId) {
    let banner = document.getElementById('practice-completion-banner');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'practice-completion-banner';
        banner.className = 'completion-panel';
        banner.innerHTML = `
            <div class="completion-panel-box">
                <p>✅ Perfect score! This course is now marked complete and will show a check mark on the Courses page.</p>
            </div>
        `;
        const container = document.querySelector('.container');
        if (container) {
            container.insertBefore(banner, container.firstChild);
        }
    }
    banner.style.display = 'block';
}

window.tryCompleteCourseIfPerfect = function(courseId) {
    const problems = document.querySelectorAll('.problem');
    if (!problems.length) return false;

    const allCorrect = Array.from(problems).every(problem => problem.classList.contains('correct'));
    if (!allCorrect) return false;

    const justCompleted = markCourseCompleted(courseId);
    showPracticeCompletionBanner(courseId);
    return justCompleted;
};

function createPracticeCompletionBanner(courseId) {
    const container = document.querySelector('.container');
    if (!container) return;

    const banner = document.createElement('div');
    banner.id = 'practice-completion-banner';
    banner.className = 'completion-panel';
    banner.style.display = 'none';
    banner.innerHTML = `
        <div class="completion-panel-box">
            <p>✅ Perfect score! This course is now marked complete and will show a check mark on the Courses page.</p>
        </div>
    `;

    container.insertBefore(banner, container.firstChild);

    if (getCompletedCourses()[courseId]) {
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