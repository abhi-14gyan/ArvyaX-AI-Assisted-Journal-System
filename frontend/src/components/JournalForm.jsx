import { useState } from "react";
import { createEntry } from "../api/journalApi";

const AMBIENCE_OPTIONS = ["forest", "beach", "mountain", "garden", "rain"];

export default function JournalForm({ userId, onEntryCreated }) {
    const [ambience, setAmbience] = useState("forest");
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;

        setLoading(true);
        setError("");
        try {
            await createEntry({ userId, ambience, text: text.trim() });
            setText("");
            setAmbience("forest");
            if (onEntryCreated) onEntryCreated();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card">
            <h2>📝 New Journal Entry</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="ambience-select">Ambience</label>
                    <select
                        id="ambience-select"
                        value={ambience}
                        onChange={(e) => setAmbience(e.target.value)}
                    >
                        {AMBIENCE_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt.charAt(0).toUpperCase() + opt.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="journal-text">Your Experience</label>
                    <textarea
                        id="journal-text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Describe your nature session experience..."
                        rows={4}
                        required
                    />
                </div>
                {error && <p className="error-text">{error}</p>}
                <button type="submit" disabled={loading || !text.trim()}>
                    {loading ? "Saving..." : "Save Entry"}
                </button>
            </form>
        </div>
    );
}
