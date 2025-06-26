import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday.js";
import isoWeek from "dayjs/plugin/isoWeek.js";
dayjs.extend(weekday);
dayjs.extend(isoWeek);
import "../styles/calendar.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import defaultEvents from "../data/events.json";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Calendar({ darkMode }) {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem("calendarEvents");
    if (saved && JSON.parse(saved).length > 0) {
      return JSON.parse(saved);
    }
    return defaultEvents;
  });

  const [selectedDate, setSelectedDate] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    time: "",
    duration: "",
    endDate: "",
    color: "#3b82f6",
  });

  useEffect(() => {
    localStorage.setItem("calendarEvents", JSON.stringify(events));
  }, [events]);

  const startDayIndex = currentDate.startOf("month").day();
  const daysInMonth = currentDate.daysInMonth();
  const daysArray = [];

  for (let i = 0; i < startDayIndex; i++) {
    daysArray.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push(dayjs(currentDate).date(i));
  }

  const changeMonth = (amount) => {
    setCurrentDate(currentDate.add(amount, "month"));
  };

  const getEventsForDate = (date) => {
    return events.filter((event) => {
      const start = dayjs(event.date);
      const end = event.endDate ? dayjs(event.endDate) : start;
      return (
        date.isSame(start, "day") ||
        (date.isAfter(start, "day") && date.isBefore(end, "day")) ||
        date.isSame(end, "day")
      );
    });
  };

  const openModal = (date, event = null, index = null) => {
    setSelectedDate(date);
    if (event) {
      setNewEvent({
        title: event.title,
        time: event.time,
        duration: event.duration,
        endDate: event.endDate || "",
        color: event.color || "#0284c7",
      });
      setEditingEvent(index);
    } else {
      setNewEvent({
        title: "",
        time: "",
        duration: "",
        endDate: "",
        color: "#0284c7",
      });
      setEditingEvent(null);
    }
  };

  const addOrEditEvent = () => {
    if (!newEvent.title || !newEvent.time) return;
    const updatedEvents = [...events];
    const formattedEndDate = newEvent.endDate
      ? dayjs(newEvent.endDate).format("YYYY-MM-DD")
      : "";
    const eventData = {
      ...newEvent,
      date: selectedDate.format("YYYY-MM-DD"),
      endDate: formattedEndDate,
    };
    if (editingEvent !== null) {
      updatedEvents[editingEvent] = eventData;
    } else {
      updatedEvents.push(eventData);
    }
    setEvents(updatedEvents);
    setSelectedDate(null);
  };

  const handleDeleteEvent = () => {
    const updatedEvents = events.filter((_, idx) => idx !== editingEvent);
    setEvents(updatedEvents);
    setSelectedDate(null);
  };

  return (
    <div className={`calendar-container ${darkMode ? "dark" : "light"}`}>
      <div className="calendar-header">
        <button
          className="nav-button"
          onClick={() => changeMonth(-1)}
          title="Previous Month"
        >
          <FaChevronLeft />
        </button>
        <h2>{currentDate.format("MMMM YYYY")}</h2>
        <button
          className="nav-button"
          onClick={() => changeMonth(1)}
          title="Next Month"
        >
          <FaChevronRight />
        </button>
      </div>
      <div className="goto-date-container">
        <label htmlFor="goto-date" className="goto-date-label">
          Go to Date:
        </label>
        <input
          type="date"
          id="goto-date"
          className="goto-date-input"
          onChange={(e) => {
            const selectedDate = dayjs(e.target.value);
            if (selectedDate.isValid()) {
              setCurrentDate(selectedDate);
            }
          }}
        />
      </div>
      <div className="calendar-scroll-wrapper">
        <div className="calendar-grid">
          {DAYS.map((day) => (
            <div key={day} className="day-name">
              {day}
            </div>
          ))}

          {daysArray.map((day, index) => (
            <div
              key={index}
              className="day-cell"
              onClick={() => {
                if (!day) return;
                if (day.isBefore(dayjs(), "day")) {
                  alert("Cannot create events in the past.");
                  return;
                }
                openModal(day);
              }}
            >
              {day ? (
                <div
                  className={`day-cell ${
                    day.isSame(dayjs(), "day") ? "today-cell" : ""
                  }`}
                >
                  <div
                    className={`date-label ${
                      day.isSame(dayjs(), "day") ? "today" : ""
                    }`}
                  >
                    {day.date()}
                  </div>
                  <div className="events-list">
                    {getEventsForDate(day).map((event, i) => (
                      <div
                        key={i}
                        className="event-item"
                        style={{ backgroundColor: event.color || "#0284c7" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal(
                            day,
                            event,
                            events.findIndex((ev) => ev === event)
                          );
                        }}
                      >
                        {event.time} - {event.title}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {selectedDate && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>
              {editingEvent !== null ? "Edit Event" : "Add Event"} for{" "}
              {selectedDate.format("MMM D, YYYY")}
            </h3>
            <input
              type="text"
              placeholder="Title"
              value={newEvent.title}
              onChange={(e) =>
                setNewEvent({ ...newEvent, title: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Duration (e.g. 1h)"
              value={newEvent.duration}
              onChange={(e) =>
                setNewEvent({ ...newEvent, duration: e.target.value })
              }
            />
            <input
              type="time"
              value={newEvent.time}
              onChange={(e) =>
                setNewEvent({ ...newEvent, time: e.target.value })
              }
            />
            <input
              type="date"
              value={newEvent.endDate}
              onChange={(e) =>
                setNewEvent({ ...newEvent, endDate: e.target.value })
              }
              min={selectedDate.format("YYYY-MM-DD")}
            />

            <select
              className="priority-select"
              value={newEvent.color}
              onChange={(e) =>
                setNewEvent({ ...newEvent, color: e.target.value })
              }
            >
              <option value="#dc2626">🔴 Critical</option>
              <option value="#f59e0b">🟠 High</option>
              <option value="#0284c7">🔵 Medium</option>
              <option value="#10b981">🟢 Low</option>
            </select>

            <div className="modal-buttons">
              <button onClick={addOrEditEvent}>
                {editingEvent !== null ? "Update" : "Save"}
              </button>
              {editingEvent !== null && (
                <button className="delete-button" onClick={handleDeleteEvent}>
                  Delete
                </button>
              )}
              <button onClick={() => setSelectedDate(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
