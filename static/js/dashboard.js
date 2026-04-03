import { onAuthReady, signOutUser } from "./auth.js";
import { getAllEntries, saveEntry, getEntry } from "./db.js";
import { initSidebar, refreshSidebar } from "./sidebar.js";
import { initRightPanel, setRightPanelDate, clearRightPanelDate } from "./right-panel.js";

const userWelcome = document.getElementById("user-welcome");
const btnSignOut = document.getElementById("btn-sign-out");
const monthDisplay = document.getElementById("month-display");
const calendarGrid = document.getElementById("calendar-grid");
const prevMonthBtn = document.getElementById("prev-month");
const nextMonthBtn = document.getElementById("next-month");

const entryDialog = document.getElementById("entry-dialog");
const btnCloseDialog = document.getElementById("btn-close-dialog");
const btnDoneEntry = document.getElementById("btn-done-entry");
const btnFullscreenEditor = document.getElementById("btn-fullscreen-editor");
const dialogDateTitle = document.getElementById("dialog-date");
const journalInput = document.getElementById("journal-input");
const saveStatus = document.getElementById("save-status");
const lastUpdated = document.getElementById("last-updated");
const wordCount = document.getElementById("word-count");
const charCount = document.getElementById("char-count");

let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

let entryDates = new Map();
let currentDialogDateStr = null;
let selectedMood = "neutral";

onAuthReady(async (user) => {
    if (!user) {
        window.location.href = "/";
        return;
    }
    userWelcome.textContent = `Signed in as ${user.displayName || user.email}`;

    const datesData = await getAllEntries();
    entryDates = new Map(Object.entries(datesData));
    renderCalendar(currentMonth, currentYear);

    initSidebar(entryDates, (year, month, day, dateStr) => {
        currentMonth = month;
        currentYear = year;
        renderCalendar(currentMonth, currentYear);
        selectDate(year, month, day, dateStr);
    });
    initRightPanel(entryDates);
});

async function selectDate(year, month, day, dateStr) {
    document.querySelectorAll('.date-tablet').forEach(t => t.classList.remove('selected-tablet'));
    const entryData = entryDates.get(dateStr) || null;
    setRightPanelDate(dateStr, entryData);
}

window.addEventListener("rp-open-date", (e) => {
    const dateStr = e.detail.dateStr;
    const parts = dateStr.split('-');
    openDialog(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), dateStr);
});

window.addEventListener("rp-clear", () => {
    document.querySelectorAll('.date-tablet').forEach(t => t.classList.remove('selected-tablet'));
    clearRightPanelDate();
});

btnSignOut.addEventListener("click", async () => {
    await signOutUser();
    window.location.href = "/";
});

const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

function formatDate(year, month, day) {
    const yyyy = year;
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function renderCalendar(month, year) {
    calendarGrid.innerHTML = "";
    monthDisplay.textContent = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement("div");
        emptyCell.className = "date-tablet empty";
        calendarGrid.appendChild(emptyCell);
    }

    const today = new Date();

    for (let i = 1; i <= daysInMonth; i++) {
        const tablet = document.createElement("div");
        tablet.className = "date-tablet";

        const dateStr = formatDate(year, month, i);

        if (entryDates.has(dateStr)) {
            const entryMeta = entryDates.get(dateStr);
            tablet.classList.add("has-entry");
            tablet.classList.add(`mood-${entryMeta.mood}`);

            const moodEmojiMap = {
                happy: '<img src="/static/assets/happy.png" class="mood-icon" alt="happy">',
                neutral: '<img src="/static/assets/neutral.png" class="mood-icon" alt="neutral">',
                sad: '<img src="/static/assets/sad.png" class="mood-icon" alt="sad">',
                angry: '<img src="/static/assets/angry.png" class="mood-icon" alt="angry">'
            };
            const emojiDiv = document.createElement("div");
            emojiDiv.className = "date-mood-indicator";
            emojiDiv.innerHTML = moodEmojiMap[entryMeta.mood] || '<img src="/static/assets/neutral.png" class="mood-icon" alt="neutral">';
            tablet.appendChild(emojiDiv);
        }

        if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            tablet.classList.add("today");
        }

        const dateNum = document.createElement("span");
        dateNum.className = "date-num";
        dateNum.textContent = i;
        tablet.appendChild(dateNum);

        tablet.addEventListener("click", () => {
            document.querySelectorAll('.date-tablet').forEach(t => t.classList.remove('selected-tablet'));
            tablet.classList.add('selected-tablet');
            selectDate(year, month, i, dateStr);
        });

        calendarGrid.appendChild(tablet);
    }
}

prevMonthBtn.addEventListener("click", () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar(currentMonth, currentYear);
});

nextMonthBtn.addEventListener("click", () => {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar(currentMonth, currentYear);
});

let debounceTimer = null;

function updateCounts(htmlString) {
    const text = htmlString.replace(/<[^>]*>?/gm, ' ').replace(/&nbsp;/g, ' ').trim();
    const chars = text.length;
    const words = text === "" ? 0 : text.split(/\s+/).length;
    wordCount.textContent = `${words} word${words === 1 ? '' : 's'}`;
    charCount.textContent = `${chars} character${chars === 1 ? '' : 's'}`;
}

async function openDialog(year, month, day, dateStr) {
    currentDialogDateStr = dateStr;
    const formattedDate = `${monthNames[month]} ${day}, ${year}`;
    dialogDateTitle.textContent = formattedDate;

    journalInput.innerHTML = "Loading...";
    journalInput.setAttribute("contenteditable", "false");
    saveStatus.textContent = "";

    entryDialog.classList.add("open");
    entryDialog.setAttribute("aria-hidden", "false");

    const entryData = await getEntry(dateStr);
    journalInput.innerHTML = entryData.text;
    journalInput.setAttribute("contenteditable", "true");

    selectedMood = entryData.mood;
    document.querySelectorAll(".mood-btn").forEach(btn => {
        if (btn.dataset.mood === selectedMood) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });

    updateCounts(entryData.text);

    if (entryData.updatedAt) {
        lastUpdated.textContent = `Last updated: ${entryData.updatedAt.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}`;
    } else {
        lastUpdated.textContent = "Last updated: Never";
    }

    setTimeout(() => journalInput.focus(), 300);
}

function closeDialog() {
    entryDialog.classList.remove("open");
    entryDialog.setAttribute("aria-hidden", "true");
}

btnCloseDialog.addEventListener("click", closeDialog);
btnDoneEntry.addEventListener("click", closeDialog);

btnFullscreenEditor.addEventListener("click", () => {
    if (currentDialogDateStr) {
        window.location.href = `/editor.html?date=${currentDialogDateStr}`;
    }
});

function triggerAutoSave() {
    if (!currentDialogDateStr) return;

    updateCounts(journalInput.innerHTML);
    saveStatus.textContent = "Saving...";

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
        const textVals = journalInput.innerHTML;
        const moodVal = selectedMood;

        await saveEntry(currentDialogDateStr, textVals, moodVal);

        lastUpdated.textContent = `Last updated: ${new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}`;

        if (textVals.trim() !== "") {
            entryDates.set(currentDialogDateStr, { text: textVals, mood: moodVal });
        } else {
            entryDates.delete(currentDialogDateStr);
        }

        saveStatus.textContent = "Saved";

        renderCalendar(currentMonth, currentYear);
        refreshSidebar(entryDates);

        if (currentDialogDateStr) {
            initRightPanel(entryDates);
            setRightPanelDate(currentDialogDateStr, entryDates.get(currentDialogDateStr) || null);
        }
    }, 500);
}

journalInput.addEventListener("input", triggerAutoSave);

document.querySelectorAll(".mood-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        if (selectedMood !== btn.dataset.mood) {
            document.querySelectorAll(".mood-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            selectedMood = btn.dataset.mood;
            triggerAutoSave();
        }
    });
});

entryDialog.addEventListener("click", (e) => {
    if (e.target === entryDialog) {
        closeDialog();
    }
});

renderCalendar(currentMonth, currentYear);
