import { signInWithGoogle, onAuthReady } from "./auth.js";

const googleBtn = document.getElementById("btn-google-signin");
const statusBox = document.getElementById("auth-status");

function setStatus(message, type = "loading") {
    statusBox.textContent = message;
    statusBox.className = type;
}

function clearStatus() {
    statusBox.className = "";
    statusBox.textContent = "";
}

function setButtonLoading(loading) {
    googleBtn.classList.toggle("is-loading", loading);
    googleBtn.setAttribute("aria-busy", loading);
    googleBtn.disabled = loading;
}

googleBtn.addEventListener("click", async () => {
    clearStatus();
    setButtonLoading(true);
    setStatus("Opening sign-in window…", "loading");

    try {
        const { user } = await signInWithGoogle();
        setStatus(`Welcome back, ${user.displayName || "writer"} ✨`, "success");
        setTimeout(() => {
            window.location.href = "/dashboard";
        }, 900);
    } catch (err) {
        setButtonLoading(false);

        const messages = {
            "auth/popup-closed-by-user": "Sign-in was cancelled.",
            "auth/popup-blocked": "Popup blocked. Please allow popups for this site.",
            "auth/network-request-failed": "Network error. Check your connection and try again.",
            "auth/cancelled-popup-request": "Another sign-in is already in progress.",
            "auth/api-key-not-valid": "Firebase is not configured yet. Add your API key to firebase-config.js.",
        };

        const code = err?.code ?? "";
        setStatus(messages[code] ?? `Sign-in failed: ${err.message}`, "error");
        console.error("[Journal iT]", err);
    }
});

onAuthReady((user) => {
    if (user) {
        setStatus(`Welcome back, ${user.displayName || "writer"} ✨`, "success");
        setTimeout(() => { window.location.href = "/dashboard"; }, 600);
    }
});

(function drawNotebookLines() {
    const container = document.querySelector(".notebook-lines");
    if (!container) return;
    const lineHeight = 40;
    const count = Math.ceil(window.innerHeight / lineHeight) + 2;
    for (let i = 0; i < count; i++) {
        const line = document.createElement("span");
        line.style.top = `${i * lineHeight + 20}px`;
        container.appendChild(line);
    }
})();

(function setDateStamp() {
    const el = document.getElementById("js-date");
    if (!el) return;
    el.textContent = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });
})();
