import { useState } from "react";
import { analyzeText } from "../api/journalApi";

export default function AnalyzePanel() {
    const [text, setText] = useState("");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleAnalyze = async () => {
        if (!text.trim()) return;

        setLoading(true);
        setError("");
        setResult(null);
        try {
            const analysis = await analyzeText(text.trim());
            setResult(analysis);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card">
            <h2>🔬 AI Analysis</h2>
            <div className="form-group">
                <label htmlFor="analyze-text">Text to Analyze</label>
                <textarea
                    id="analyze-text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste or type journal text to analyze with AI..."
                    rows={3}
                />
            </div>
            <button onClick={handleAnalyze} disabled={loading || !text.trim()}>
                {loading ? "Analyzing..." : "Analyze with Gemini AI"}
            </button>

            {error && <p className="error-text">{error}</p>}

            {result && (
                <div className="analysis-result">
                    <div className="result-row">
                        <span className="result-label">Emotion</span>
                        <span className="result-value emotion-badge">{result.emotion}</span>
                    </div>
                    <div className="result-row">
                        <span className="result-label">Keywords</span>
                        <div className="keywords-list">
                            {result.keywords?.map((kw, i) => (
                                <span key={i} className="keyword-chip">
                                    {kw}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="result-row">
                        <span className="result-label">Summary</span>
                        <p className="result-summary">{result.summary}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
