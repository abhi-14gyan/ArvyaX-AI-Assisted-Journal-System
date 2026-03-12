import { useState, useEffect } from "react";
import { getEntries } from "../api/journalApi";

export default function JournalList({ userId, refreshKey }) {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!userId) return;
        setLoading(true);
        getEntries(userId)
            .then(setEntries)
            .catch(() => setEntries([]))
            .finally(() => setLoading(false));
    }, [userId, refreshKey]);

    if (loading) return <div className="card"><p>Loading entries...</p></div>;
    if (entries.length === 0) return <div className="card"><h2>📖 Journal Entries</h2><p className="muted">No entries yet. Write your first one!</p></div>;

    return (
        <div className="card">
            <h2>📖 Journal Entries ({entries.length})</h2>
            <div className="entries-list">
                {entries.map((entry) => (
                    <div key={entry._id} className="entry-item">
                        <div className="entry-header">
                            <span className="badge">{entry.ambience}</span>
                            <span className="entry-date">
                                {new Date(entry.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </span>
                        </div>
                        <p className="entry-text">{entry.text}</p>
                        {entry.emotion && (
                            <div className="entry-analysis">
                                <span className="analysis-label">Emotion:</span> {entry.emotion} |{" "}
                                <span className="analysis-label">Keywords:</span>{" "}
                                {entry.keywords?.join(", ")}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
