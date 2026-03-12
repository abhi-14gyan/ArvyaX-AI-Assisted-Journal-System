import { useState, useCallback } from "react";
import JournalForm from "./components/JournalForm";
import JournalList from "./components/JournalList";
import AnalyzePanel from "./components/AnalyzePanel";
import InsightsPanel from "./components/InsightsPanel";
import "./App.css";

function App() {
  const [userId, setUserId] = useState("123");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEntryCreated = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🌿 ArvyaX AI-Assisted Journal</h1>
        <p className="subtitle">Log your nature session experiences</p>
        <div className="user-id-bar">
          <label htmlFor="user-id-input">User ID:</label>
          <input
            id="user-id-input"
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter your User ID"
          />
        </div>
      </header>

      <main className="main-grid">
        <div className="column left-column">
          <JournalForm userId={userId} onEntryCreated={handleEntryCreated} />
          <AnalyzePanel />
        </div>
        <div className="column right-column">
          <InsightsPanel userId={userId} refreshKey={refreshKey} />
          <JournalList userId={userId} refreshKey={refreshKey} />
        </div>
      </main>
    </div>
  );
}

export default App;
