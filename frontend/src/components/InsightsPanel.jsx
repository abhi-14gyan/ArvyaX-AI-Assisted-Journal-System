import { useState, useEffect } from "react";
import { getInsights } from "../api/journalApi";

export default function InsightsPanel({ userId, refreshKey }) {
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!userId) return;
        setLoading(true);
        setError("");
        getInsights(userId)
            .then(setInsights)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [userId, refreshKey]);

    if (loading) return <div className="card"><p>Loading insights...</p></div>;
    if (error) return <div className="card"><h2>📊 Insights</h2><p className="error-text">{error}</p></div>;
    if (!insights) return null;

    return (
        <div className="card">
            <h2>📊 Insights</h2>
            {insights.totalEntries === 0 ? (
                <p className="muted">No data yet. Create some entries first!</p>
            ) : (
                <div className="insights-grid">
                    <div className="insight-item">
                        <span className="insight-value">{insights.totalEntries}</span>
                        <span className="insight-label">Total Entries</span>
                    </div>
                    <div className="insight-item">
                        <span className="insight-value">{insights.topEmotion || "—"}</span>
                        <span className="insight-label">Top Emotion</span>
                    </div>
                    <div className="insight-item">
                        <span className="insight-value">{insights.mostUsedAmbience || "—"}</span>
                        <span className="insight-label">Most Used Ambience</span>
                    </div>
                    <div className="insight-item full-width">
                        <span className="insight-label">Recent Keywords</span>
                        <div className="keywords-list">
                            {insights.recentKeywords?.length > 0 ? (
                                insights.recentKeywords.map((kw, i) => (
                                    <span key={i} className="keyword-chip">
                                        {kw}
                                    </span>
                                ))
                            ) : (
                                <span className="muted">No keywords yet</span>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
