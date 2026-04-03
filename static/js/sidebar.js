
const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const monthShort = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

let miniCalMonth;
let miniCalYear;
let entryDatesRef = null;
let onDateSelectCallback = null;

function renderMoodSummary(entryDates) {
    const container = document.getElementById("mood-summary-content");
    if (!container) return;

    const moodCounts = { happy: 0, neutral: 0, sad: 0, angry: 0 };

    entryDates.forEach((value) => {
        const mood = value.mood || "neutral";
        if (moodCounts.hasOwnProperty(mood)) {
            moodCounts[mood]++;
        } else {
            moodCounts["neutral"]++;
        }
    });

    const total = Object.values(moodCounts).reduce((a, b) => a + b, 0);

    if (total === 0) {
        container.innerHTML = `<div class="mood-empty-state">No entries yet — start writing!</div>`;
        return;
    }

    const moodEmojiMap = { 
        happy: '<img src="/static/assets/happy.png" class="mood-icon" alt="happy">', 
        neutral: '<img src="/static/assets/neutral.png" class="mood-icon" alt="neutral">', 
        sad: '<img src="/static/assets/sad.png" class="mood-icon" alt="sad">', 
        angry: '<img src="/static/assets/angry.png" class="mood-icon" alt="angry">' 
    };
    const moodLabels = { happy: "Happy", neutral: "Neutral", sad: "Sad", angry: "Angry" };

    let html = "";
    for (const [mood, count] of Object.entries(moodCounts)) {
        const pct = total > 0 ? (count / total) * 100 : 0;
        html += `
            <div class="mood-summary-row">
                <span class="mood-summary-emoji" title="${moodLabels[mood]}">${moodEmojiMap[mood]}</span>
                <div class="mood-summary-bar-container">
                    <div class="mood-summary-bar mood-bar-${mood}" style="width: ${pct}%"></div>
                </div>
                <span class="mood-summary-count">${count}</span>
            </div>
        `;
    }

    container.innerHTML = html;
}

function calculateStreak(entryDates) {
    if (!entryDates || entryDates.size === 0) return 0;

    const dateStrings = Array.from(entryDates.keys()).sort().reverse();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const latestDate = parseDate(dateStrings[0]);
    if (!latestDate) return 0;
 
    let streak = 1;
    let currentDate = latestDate;

    for (let i = 1; i < dateStrings.length; i++) {
        const prevDay = new Date(currentDate);
        prevDay.setDate(prevDay.getDate() - 1);

        const entryDate = parseDate(dateStrings[i]);
        if (!entryDate) continue;

        if (entryDate.getTime() === prevDay.getTime()) {
            streak++;
            currentDate = entryDate;
        } else if (entryDate.getTime() < prevDay.getTime()) {
            break;
        }
    }

    return streak;
}

function parseDate(dateStr) {
    const parts = dateStr.split("-");
    if (parts.length !== 3) return null;
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    d.setHours(0, 0, 0, 0);
    return d;
}

function renderStreak(entryDates) {
    const valueEl = document.getElementById("streak-value");
    const subtitleEl = document.getElementById("streak-subtitle");
    if (!valueEl || !subtitleEl) return;

    const streak = calculateStreak(entryDates);

    const dayWord = streak === 1 ? "day" : "days";
    valueEl.textContent = `${streak} ${dayWord}`;

    if (streak === 0) {
        subtitleEl.textContent = "Write today to start!";
    } else if (streak < 3) {
        subtitleEl.textContent = "Good start — keep going!";
    } else if (streak < 7) {
        subtitleEl.textContent = "You're on a roll! 🔥";
    } else if (streak < 30) {
        subtitleEl.textContent = "Incredible consistency! ✨";
    } else {
        subtitleEl.textContent = "Legendary writer! 🏆";
    }
}

function renderMiniCalendar(month, year, entryDates) {
    miniCalMonth = month;
    miniCalYear = year;

    const titleEl = document.getElementById("mini-cal-month-title");
    const gridEl = document.getElementById("mini-cal-grid");
    if (!titleEl || !gridEl) return;

    titleEl.textContent = `${monthShort[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    gridEl.innerHTML = "";

    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement("button");
        empty.className = "mini-cal-day empty";
        empty.disabled = true;
        gridEl.appendChild(empty);
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const btn = document.createElement("button");
        btn.className = "mini-cal-day";
        btn.textContent = d;

        const dateStr = formatDateStr(year, month, d);

        if (d === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            btn.classList.add("today");
        }

        if (entryDates && entryDates.has(dateStr)) {
            btn.classList.add("has-entry");
        }

        btn.addEventListener("click", () => {
            if (onDateSelectCallback) {
                onDateSelectCallback(year, month, d, dateStr);
            }
        });

        gridEl.appendChild(btn);
    }
}

function formatDateStr(year, month, day) {
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
}

function initNavigation() {
    const navItems = document.querySelectorAll(".sidebar-nav-item");
    navItems.forEach(item => {
        item.addEventListener("click", () => {
            navItems.forEach(n => n.classList.remove("active"));
            item.classList.add("active");
        });
    });
}

function initMobileToggle() {
    const sidebar = document.querySelector(".sidebar");
    const toggleBtn = document.getElementById("sidebar-toggle");
    const backdrop = document.getElementById("sidebar-backdrop");

    if (!toggleBtn || !sidebar) return;

    toggleBtn.addEventListener("click", () => {
        sidebar.classList.toggle("open");
        if (backdrop) {
            backdrop.classList.toggle("visible");
            backdrop.style.display = sidebar.classList.contains("open") ? "block" : "none";
        }
    });

    if (backdrop) {
        backdrop.addEventListener("click", () => {
            sidebar.classList.remove("open");
            backdrop.classList.remove("visible");
            setTimeout(() => { backdrop.style.display = "none"; }, 300);
        });
    }
}

function initMiniCalNav() {
    const prevBtn = document.getElementById("mini-cal-prev");
    const nextBtn = document.getElementById("mini-cal-next");

    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            miniCalMonth--;
            if (miniCalMonth < 0) { miniCalMonth = 11; miniCalYear--; }
            renderMiniCalendar(miniCalMonth, miniCalYear, entryDatesRef);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            miniCalMonth++;
            if (miniCalMonth > 11) { miniCalMonth = 0; miniCalYear++; }
            renderMiniCalendar(miniCalMonth, miniCalYear, entryDatesRef);
        });
    }
}

export function initSidebar(entryDates, dateSelectCb) {
    entryDatesRef = entryDates;
    onDateSelectCallback = dateSelectCb || null;

    const now = new Date();
    miniCalMonth = now.getMonth();
    miniCalYear = now.getFullYear();

    initNavigation();
    initMobileToggle();
    initMiniCalNav();

    renderMoodSummary(entryDates);
    renderStreak(entryDates);
    renderMiniCalendar(miniCalMonth, miniCalYear, entryDates);
}


export function refreshSidebar(entryDates) {
    entryDatesRef = entryDates;
    renderMoodSummary(entryDates);
    renderStreak(entryDates);
    renderMiniCalendar(miniCalMonth, miniCalYear, entryDates);
}
