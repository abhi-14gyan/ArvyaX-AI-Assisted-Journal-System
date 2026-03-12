const API_BASE = ((import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "")) + "/api/journal";

export async function createEntry(data) {
    const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).error || "Failed to create entry");
    return res.json();
}

export async function getEntries(userId) {
    const res = await fetch(`${API_BASE}/${userId}`);
    if (!res.ok) throw new Error("Failed to fetch entries");
    return res.json();
}

export async function analyzeText(text) {
    const res = await fetch(`${API_BASE}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error((await res.json()).error || "Analysis failed");
    return res.json();
}

export async function getInsights(userId) {
    const res = await fetch(`${API_BASE}/insights/${userId}`);
    if (!res.ok) throw new Error("Failed to fetch insights");
    return res.json();
}
