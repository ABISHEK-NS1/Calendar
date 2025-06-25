import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import defaultEvents from "../data/events.json";
import "../styles/events.css";

dayjs.extend(isSameOrAfter);

const EventsList = () => {
  const [events, setEvents] = useState([]);
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("calendarEvents");
    if (saved) {
      setEvents(JSON.parse(saved));
    } else {
      localStorage.setItem("calendarEvents", JSON.stringify(defaultEvents));
      setEvents(defaultEvents);
    }
  }, []);

  const today = dayjs();

  const filteredEvents = events.filter((event) => {
    const eventDate = dayjs(event.date);

    const priorityColorMap = {
      Critical: "#dc2626",
      High: "#f59e0b",
      Medium: "#0284c7",
      Low: "#10b981",
    };

    const matchesPriority =
      priorityFilter === "All" ||
      event.color === priorityColorMap[priorityFilter];

    const matchesStartDate = startDate
      ? eventDate.isSameOrAfter(dayjs(startDate), "day")
      : true;
    const matchesEndDate = endDate
      ? eventDate.isBefore(dayjs(endDate).add(1, "day"), "day")
      : true;

    return (
      eventDate.isSameOrAfter(today, "day") &&
      matchesPriority &&
      matchesStartDate &&
      matchesEndDate
    );
  });

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const uploadedEvents = JSON.parse(event.target.result);
        if (Array.isArray(uploadedEvents)) {
          setEvents(uploadedEvents);
          localStorage.setItem(
            "calendarEvents",
            JSON.stringify(uploadedEvents)
          );
          alert("Events uploaded successfully!");
        } else {
          alert("Invalid JSON format. Expected an array of events.");
        }
      } catch (error) {
        alert("Failed to parse the JSON file.");
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="events-list-container">
      <h2 className="events-list-title">📅 Upcoming Events</h2>
      <div className="upload-section">
        <button
          htmlFor="eventUpload"
          className="upload-button"
          onClick={() => setShowUploadModal(true)}
        >
          Upload Events
        </button>
        {showUploadModal && (
          <div className="modal-overlay">
            <div className="modal upload-modal">
              <h3>Upload Events (JSON Format)</h3>
              <input type="file" accept=".json" onChange={handleFileUpload} />

              <div className="sample-json">
                <p>
                  <strong>Sample Format:</strong>
                </p>
                <pre>
                  {`[
    {
      "title": "Team Meeting",
      "date": "2025-07-01",
      "time": "10:00",
      "duration": "1h",
      "endDate": "2025-07-01",
      "color": "#3b82f6"
    },
    {
      "title": "Project Deadline",
      "date": "2025-07-03",
      "time": "23:59",
      "duration": "All Day",
      "color": "#dc2626"
    }
  ]`}
                </pre>
              </div>

              <div className="modal-buttons">
                <button onClick={() => setShowUploadModal(false)}>Close</button>
              </div>
            </div>
          </div>
        )}

        <input
          id="eventUpload"
          type="file"
          accept="application/json"
          onChange={handleFileUpload}
          style={{ display: "none" }}
        />
      </div>
      <div className="filters-container">
        <select
          className="filter-dropdown"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="All">All Priorities</option>
          <option value="Critical">🔴 Critical</option>
          <option value="High">🟠 High</option>
          <option value="Medium">🔵 Medium</option>
          <option value="Low">🟢 Low</option>
        </select>

        <input
          type="date"
          className="filter-date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          className="filter-date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>
      {filteredEvents.length === 0 ? (
        <p className="no-events">No upcoming events.</p>
      ) : (
        <ul className="event-cards">
          {filteredEvents.map((event, index) => (
            <li
              key={index}
              className="event-card"
              style={{ borderLeftColor: event.color }}
            >
              <div className="event-date-time">
                <span className="event-date">
                  {dayjs(event.date).format("MMM D, YYYY")}
                </span>
                <span className="event-time">{event.time}</span>
              </div>
              <div className="event-details">
                <h3 className="event-title">{event.title}</h3>
                <p className="event-duration">⏱ Duration: {event.duration}</p>
                {event.endDate && (
                  <p className="event-end">
                    Until: {dayjs(event.endDate).format("MMM D, YYYY")}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EventsList;
