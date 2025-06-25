import Calendar from "./components/Calendar";
import "./index.css";
import { useState } from "react";
import EventsList from "./components/EventsList";
import { useEffect } from "react";
import { FaSun, FaMoon } from "react-icons/fa";

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [view, setView] = useState("calendar");

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className={`app-container ${darkMode ? "dark" : "light"}`}>
      <div className="mode-toggle">
        <button onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "🌞" : "🌙"}
        </button>
      </div>

      <div className="view-toggle">
        <button onClick={() => setView("calendar")}>📅 Calendar</button>
        <button onClick={() => setView("events")}>🗂️ Events</button>
      </div>

      {view === "calendar" ? (
        <Calendar darkMode={darkMode} />
      ) : (
        <EventsList darkMode={darkMode} />
      )}
    </div>
  );
}
