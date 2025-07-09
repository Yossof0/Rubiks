// Function to handle tab navigation
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.tab-content');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    // Show the selected section
    const activeSection = document.getElementById(sectionId);
    if (activeSection) activeSection.classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
    showSection('introduction');
});

// Theme Switcher
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

// Timer & Scramble
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

// --- Spacebar logic: Start/stop on release ---
let spaceDown = false;

document.addEventListener('keydown', function(e) {
    if (
        e.code === 'Space' &&
        !spaceDown &&
        document.activeElement.tagName !== 'INPUT' &&
        document.activeElement.tagName !== 'SELECT'
    ) {
        e.preventDefault();
        spaceDown = true;
        // Optionally: add a "ready" visual cue here
    }
});

document.addEventListener('keyup', function(e) {
    if (
        e.code === 'Space' &&
        spaceDown &&
        document.activeElement.tagName !== 'INPUT' &&
        document.activeElement.tagName !== 'SELECT'
    ) {
        e.preventDefault();
        spaceDown = false;
        toggleTimer();
    }
});

// Button logic: Start/stop on mouse/touch release
let buttonDown = false;

timerBtn.addEventListener('mousedown', function(e) {
    buttonDown = true;
});
timerBtn.addEventListener('mouseup', function(e) {
    if (buttonDown) {
        buttonDown = false;
        toggleTimer();
    }
});
timerBtn.addEventListener('touchstart', function(e) {
    buttonDown = true;
});
timerBtn.addEventListener('touchend', function(e) {
    if (buttonDown) {
        buttonDown = false;
        toggleTimer();
    }
});

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
    let time = parseFloat(timerDisplay.textContent);
    if (!isNaN(time) && time > 0.01) {
        addSolve(time);
    }
    setScramble();
}

function toggleTimer() {
    if (!running) {
        startTimer();
    } else {
        stopTimer();
    }
}

// --- Timer Statistics & Chart ---
let solves = JSON.parse(localStorage.getItem('solves') || '[]');
let sessionName = localStorage.getItem('sessionName') || 'Default';

const bestElem = document.getElementById('best-solve');
const worstElem = document.getElementById('worst-solve');
const avgElem = document.getElementById('avg-solve');
const solvesCountElem = document.getElementById('solves-count');
const sessionNameElem = document.getElementById('session-name');
const deleteSolvesBtn = document.getElementById('delete-solves-btn');
const newSessionBtn = document.getElementById('new-session-btn');
const chartCanvas = document.getElementById('solve-chart');
let chartCtx = chartCanvas.getContext('2d');

// Solves Table
const solvesTableBody = document.querySelector('#solves-table tbody');

// Render the solves table
function renderSolvesTable() {
    if (!solvesTableBody) return;
    solvesTableBody.innerHTML = '';
    solves.forEach((solve, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${i + 1}</td>
            <td>${typeof solve === 'object' ? solve.time.toFixed(2) : parseFloat(solve).toFixed(2)}</td>
            <td>${typeof solve === 'object' ? solve.date : '-'}</td>
            <td><button class="delete-solve-btn" data-index="${i}">🗑️</button></td>
        `;
        solvesTableBody.appendChild(tr);
    });
    // Add delete event listeners
    document.querySelectorAll('.delete-solve-btn').forEach(btn => {
        btn.onclick = function() {
            const idx = parseInt(this.getAttribute('data-index'));
            solves.splice(idx, 1);
            saveSolves();
            updateStats();
            renderSolvesTable();
        };
    });
}

// Update addSolve to store objects with time and date
function addSolve(time) {
    solves.push({ time, date: new Date().toLocaleString() });
    saveSolves();
    updateStats();
    renderSolvesTable();
}

function resetSolves() {
    solves = [];
    saveSolves();
    updateStats();
    renderSolvesTable();
}

function newSession() {
    sessionName = prompt("Enter new session name:", "Session " + (Math.floor(Math.random() * 1000)));
    if (!sessionName) sessionName = "Default";
    solves = [];
    saveSolves();
    updateStats();
    renderSolvesTable();
}

function updateStats() {
    if (solves.length === 0) {
        bestElem.textContent = '-';
        worstElem.textContent = '-';
        avgElem.textContent = '-';
        solvesCountElem.textContent = '0';
    } else {
        let times = solves.map(s => typeof s === 'object' ? s.time : s);
        let best = Math.min(...times).toFixed(2);
        let worst = Math.max(...times).toFixed(2);
        let avg = (times.reduce((a, b) => a + b, 0) / times.length).toFixed(2);
        bestElem.textContent = best;
        worstElem.textContent = worst;
        avgElem.textContent = avg;
        solvesCountElem.textContent = solves.length;
    }
    sessionNameElem.textContent = sessionName;
    drawChart();
}

function drawChart() {
    chartCtx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
    if (solves.length === 0) return;
    let times = solves.map(s => typeof s === 'object' ? s.time : s);
    let max = Math.max(...times);
    let min = Math.min(...times);
    let range = max - min || 1;
    let w = chartCanvas.width, h = chartCanvas.height;
    let step = w / Math.max(times.length - 1, 1);

    chartCtx.strokeStyle = "#39ff14";
    chartCtx.lineWidth = 2;
    chartCtx.beginPath();
    times.forEach((solve, i) => {
        let x = i * step;
        let y = h - ((solve - min) / range) * (h - 20) - 10;
        if (i === 0) chartCtx.moveTo(x, y);
        else chartCtx.lineTo(x, y);
    });
    chartCtx.stroke();

    // Draw points
    chartCtx.fillStyle = "#ffb347";
    times.forEach((solve, i) => {
        let x = i * step;
        let y = h - ((solve - min) / range) * (h - 20) - 10;
        chartCtx.beginPath();
        chartCtx.arc(x, y, 3, 0, 2 * Math.PI);
        chartCtx.fill();
    });
}

function saveSolves() {
    localStorage.setItem('solves', JSON.stringify(solves));
    localStorage.setItem('sessionName', sessionName);
}

// Button events
deleteSolvesBtn.addEventListener('click', () => {
    if (confirm("Delete all solves for this session?")) resetSolves();
});
newSessionBtn.addEventListener('click', newSession);

// Initial stats and table render
renderSolvesTable();
updateStats();