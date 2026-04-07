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

function createCompletionWidget(courseId) {
    const container = document.querySelector('.container');
    if (!container) return;

    const completed = getCompletedCourses();
    const isComplete = !!completed[courseId];

    const widget = document.createElement('div');
    widget.className = 'completion-panel';
    widget.innerHTML = `
        <div class="completion-panel-box">
            <p><strong>${isComplete ? 'Lesson complete!' : 'Finish this lesson'}</strong></p>
            <p>${isComplete ? 'This lesson is already marked complete. The Courses page will show a check mark.' : 'Mark this lesson complete so you can track progress on the Courses page.'}</p>
            <button id="complete-course-btn" class="btn ${isComplete ? 'btn-secondary' : 'btn'}" type="button">
                ${isComplete ? '✓ Completed' : 'Mark lesson complete'}
            </button>
        </div>
    `;

    container.appendChild(widget);

    const button = document.getElementById('complete-course-btn');
    if (!button) return;

    button.addEventListener('click', () => {
        const current = getCompletedCourses();
        if (current[courseId]) return;
        current[courseId] = true;
        saveCompletedCourses(current);
        updateCoursesPage();
        button.textContent = '✓ Completed';
        button.classList.remove('btn');
        button.classList.add('btn-secondary');
        const message = widget.querySelector('p');
        if (message) {
            message.textContent = 'This lesson is now marked complete. Return to the Courses page to see the check mark.';
        }
    });
}

function initCompletionTracking() {
    updateCoursesPage();
    const courseId = document.body.dataset.courseId;
    if (courseId) {
        createCompletionWidget(courseId);
    }
}

initCompletionTracking();