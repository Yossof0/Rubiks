// Function to handle tab navigation
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.tab-content');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    // Show the selected section
    const activeSection = document.getElementById(sectionId);
    activeSection.classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
    showSection('introduction');
});
const themeSelect = document.getElementById('theme-select');
const themeIcon = document.getElementById('theme-icon');
const body = document.body;

// Load saved theme or default
const savedTheme = localStorage.getItem('theme') || 'default';
body.classList.add('theme-' + savedTheme);
themeSelect.value = savedTheme;

// Show/hide dropdown when icon is clicked
themeIcon.addEventListener('click', () => {
    themeSelect.classList.toggle('show');
    themeSelect.classList.toggle('hidden');
    if (themeSelect.classList.contains('show')) {
        themeSelect.focus();
    }
});

// Hide dropdown when it loses focus
themeSelect.addEventListener('blur', () => {
    themeSelect.classList.remove('show');
    themeSelect.classList.add('hidden');
});

// Change theme when selection changes
themeSelect.addEventListener('change', function () {
    body.classList.remove(
        ...Array.from(body.classList).filter(c => c.startsWith('theme-'))
    );
    body.classList.add('theme-' + this.value);
    localStorage.setItem('theme', this.value);
});
const scrambleElem = document.getElementById('scramble');
const timerDisplay = document.getElementById('timer-display');
const timerBtn = document.getElementById('timer-btn');

const moves = ["R", "R'", "L", "L'", "U", "U'", "D", "D'", "F", "F'", "B", "B'"];
function generateScramble(len = 20) {
    let scramble = [];
    let prev = '';
    for (let i = 0; i < len; i++) {
        let move;
        do {
            move = moves[Math.floor(Math.random() * moves.length)];
        } while (move[0] === prev);
        scramble.push(move);
        prev = move[0];
    }
    return scramble.join(' ');
}
function setScramble() {
    scrambleElem.textContent = generateScramble();
}
setScramble();

let timer = null;
let startTime = 0;
let running = false;

function startTimer() {
    running = true;
    startTime = Date.now();
    timerDisplay.textContent = "0.00";
    timerBtn.textContent = "Stop";
    timer = setInterval(() => {
        let elapsed = (Date.now() - startTime) / 1000;
        timerDisplay.textContent = elapsed.toFixed(2);
    }, 10);
}

function stopTimer() {
    running = false;
    clearInterval(timer);
    timerBtn.textContent = "Start";
    setScramble();
}

function toggleTimer() {
    if (!running) {
        startTimer();
    } else {
        stopTimer();
    }
}

timerBtn.addEventListener('click', toggleTimer);

document.addEventListener('keydown', function(e) {
    // Only trigger on spacebar and not when typing in an input/select
    if (e.code === 'Space' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'SELECT') {
        e.preventDefault();
        toggleTimer();
    }
});