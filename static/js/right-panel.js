

const MOOD_EMOJIS = {
    happy: '<img src="/static/assets/happy.png" class="mood-icon" alt="happy">',
    neutral: '<img src="/static/assets/neutral.png" class="mood-icon" alt="neutral">',
    sad: '<img src="/static/assets/sad.png" class="mood-icon" alt="sad">',
    angry: '<img src="/static/assets/angry.png" class="mood-icon" alt="angry">'
};

const PROMPTS = [
    "What made you smile today?",
    "What challenged you today?",
    "Describe a small win you had.",
    "What are you grateful for right now?",
    "What did you learn today?",
    "How are you feeling physically and mentally?",
    "What is something you want to let go of?"
];

function getWordCount(htmlString) {
    if (!htmlString) return 0;
    const text = htmlString.replace(/<[^>]*>?/gm, ' ').replace(/&nbsp;/g, ' ');
    const cleaned = text.trim();
    return cleaned === "" ? 0 : cleaned.split(/\s+/).length;
}

function getExcerpt(htmlString, maxLength = 120) {
    if (!htmlString) return "";
    const text = htmlString.replace(/<[^>]*>?/gm, ' ').replace(/&nbsp;/g, ' ').trim();
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
}

let allEntriesMap = new Map();
let currentSelectedDateStr = null;
let currentSelectedEntry = null;

const rpStateDefault = document.getElementById("rp-state-default");
const rpStateEntry = document.getElementById("rp-state-entry");
const rpStateEmpty = document.getElementById("rp-state-empty");

function showState(state) {
    if(!rpStateDefault || !rpStateEntry || !rpStateEmpty) return;
    
    rpStateDefault.classList.remove("active");
    rpStateEntry.classList.remove("active");
    rpStateEmpty.classList.remove("active");

    if (state === "DEFAULT") rpStateDefault.classList.add("active");
    if (state === "ENTRY") rpStateEntry.classList.add("active");
    if (state === "EMPTY") rpStateEmpty.classList.add("active");
}

function renderDefaultState() {
    const totalEntriesEl = document.getElementById("rp-total-entries");
    const avgWordsEl = document.getElementById("rp-avg-words");
    
    let totalEntries = 0;
    let totalWords = 0;
    let recentList = [];

    allEntriesMap.forEach((entry, dateStr) => {
        totalEntries++;
        const wc = getWordCount(entry.text);
        totalWords += wc;
        entry._dateStr = dateStr; 
        recentList.push(entry);
    });

    if (totalEntriesEl) totalEntriesEl.textContent = totalEntries;
    if (avgWordsEl) {
        const avg = totalEntries > 0 ? Math.round(totalWords / totalEntries) : 0;
        avgWordsEl.textContent = avg;
    }

    recentList.sort((a, b) => {
        const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : new Date(a._dateStr).getTime();
        const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : new Date(b._dateStr).getTime();
        return dateB - dateA;
    });

    const recentEl = document.getElementById("rp-recent-activity");
    if (recentEl) {
        recentEl.innerHTML = "";
        const topRecent = recentList.slice(0, 4); // show last 4
        
        if (topRecent.length === 0) {
            recentEl.innerHTML = `<div class="text-faint" style="font-size: 0.85rem; padding: 12px; text-align: center;">No entries found. Start a new journal!</div>`;
        } else {
            topRecent.forEach(entry => {
                const item = document.createElement("div");
                item.className = "activity-item";
                
                const d = new Date(entry.updatedAt || entry._dateStr);
                const dateFmt = isNaN(d) ? entry._dateStr : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

                item.innerHTML = `
                    <div class="activity-date">${dateFmt} &nbsp;&bull;&nbsp; ${MOOD_EMOJIS[entry.mood] || '<img src="/static/assets/neutral.png" class="mood-icon" alt="neutral">'}</div>
                    <div class="activity-snippet">${getExcerpt(entry.text, 60)}</div>
                `;
                
                item.addEventListener("click", () => {
                    const event = new CustomEvent("rp-open-date", { detail: { dateStr: entry._dateStr } });
                    window.dispatchEvent(event);
                });

                recentEl.appendChild(item);
            });
        }
    }

    const promptEl = document.getElementById("rp-daily-prompt");
    if (promptEl) {
        const todayDay = new Date().getDate();
        const prompt = PROMPTS[todayDay % PROMPTS.length];
        promptEl.textContent = `"${prompt}"`;
    }

    showState("DEFAULT");
}

function renderEntryState(dateStr, entryData) {
    const previewEl = document.getElementById("rp-entry-preview");
    if (previewEl) previewEl.textContent = getExcerpt(entryData.text, 200);

    const moodEmojiEl = document.getElementById("rp-entry-mood-emoji");
    const moodLabelEl = document.getElementById("rp-entry-mood-label");
    const moodClass = entryData.mood || 'neutral';
    
    if (moodEmojiEl) moodEmojiEl.innerHTML = MOOD_EMOJIS[moodClass] || '<img src="/static/assets/neutral.png" class="mood-icon" alt="neutral">';
    if (moodLabelEl) moodLabelEl.textContent = moodClass;
    
    const moodDisplay = document.getElementById("rp-entry-mood-display");
    if (moodDisplay) {
        const colors = { happy: '#e8f5e9', neutral: '#f5f5f5', sad: '#e3f2fd', angry: '#ffebee' };
        moodDisplay.style.backgroundColor = colors[moodClass] || colors.neutral;
    }

    const wcEl = document.getElementById("rp-entry-wordcount");
    if (wcEl) wcEl.textContent = `${getWordCount(entryData.text)} words`;

    const updatedEl = document.getElementById("rp-entry-updated");
    if (updatedEl) {
        if (entryData.updatedAt) {
            const d = new Date(entryData.updatedAt);
            updatedEl.textContent = d.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
        } else {
            updatedEl.textContent = "Unknown";
        }
    }

    const editBtn = document.getElementById("rp-btn-edit");
    if (editBtn) {
        editBtn.onclick = () => {
             const event = new CustomEvent("rp-open-date", { detail: { dateStr: dateStr } });
             window.dispatchEvent(event);
        };
    }
    
    showState("ENTRY");
}

function renderEmptyState(dateStr) {
    const writeBtn = document.getElementById("rp-btn-write");
    if (writeBtn) {
        writeBtn.onclick = () => {
             const event = new CustomEvent("rp-open-date", { detail: { dateStr: dateStr } });
             window.dispatchEvent(event);
        };
    }
    showState("EMPTY");
}


export function initRightPanel(entriesMap) {
    allEntriesMap = entriesMap || new Map();
    if (!currentSelectedDateStr) {
        renderDefaultState();
    }
}

export function setRightPanelDate(dateStr, entryData) {
    currentSelectedDateStr = dateStr;
    currentSelectedEntry = entryData;
    
    document.querySelectorAll(".rp-selected-date-text").forEach(el => {
        const d = new Date(dateStr + "T12:00:00"); 
        el.textContent = d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
    });

    if (entryData && entryData.text && entryData.text.trim().length > 0) {
        renderEntryState(dateStr, entryData);
    } else {
        renderEmptyState(dateStr);
    }
}

export function clearRightPanelDate() {
    currentSelectedDateStr = null;
    currentSelectedEntry = null;
    renderDefaultState();
}
