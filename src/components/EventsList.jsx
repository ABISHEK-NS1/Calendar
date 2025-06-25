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

  return (
    <div className="events-list-container">
      <h2 className="events-list-title">📅 Upcoming Events</h2>

      {/* 🔍 Filters */}
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

      {/* 📋 Events */}
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
