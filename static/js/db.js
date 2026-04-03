import { auth, db } from "./auth.js";
import { doc, setDoc, getDoc, getDocs, collection } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export async function getAllEntries() {
    if (!auth.currentUser) return {};

    const entriesRef = collection(db, "journals", auth.currentUser.uid, "entries");
    try {
        const snapshot = await getDocs(entriesRef);
        const datesMap = {};
        snapshot.forEach(doc => {
            const documentData = doc.data();
            if (documentData.text && documentData.text.trim() !== "") {
                datesMap[doc.id] = { 
                    text: documentData.text, 
                    mood: documentData.mood || 'neutral',
                    updatedAt: documentData.updatedAt ? documentData.updatedAt.toDate() : null
                };
            }
        });
        return datesMap;
    } catch (e) {
        console.error("Error fetching entry dates: ", e);
        return {};
    }
}

export async function saveEntry(dateStr, text, mood) {
    if (!auth.currentUser) return;

    const docRef = doc(db, "journals", auth.currentUser.uid, "entries", dateStr);
    try {
        await setDoc(docRef, {
            text: text,
            mood: mood,
            updatedAt: new Date()
        });
    } catch (e) {
        console.error("Error saving entry: ", e);
    }
}

export async function getEntry(dateStr) {
    if (!auth.currentUser) return { text: "", mood: "neutral", updatedAt: null };

    const docRef = doc(db, "journals", auth.currentUser.uid, "entries", dateStr);
    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                text: data.text || "",
                mood: data.mood || "neutral",
                updatedAt: data.updatedAt ? data.updatedAt.toDate() : null
            };
        }
    } catch (e) {
        console.error("Error getting entry: ", e);
    }
    return { text: "", mood: "neutral", updatedAt: null };
}
