import React, { useEffect, useState } from "react";

type UserInfo = {
  name?: string;
  email?: string;
  picture?: string;
  username?: string;
  homeAccountId?: string;
};

type CalendarEvent = {
  id: string;
  summary: string;
  start: string;
  end: string;
};

export const TestingAuthComponent: React.FC = () => {
  const [googleUser, setGoogleUser] = useState<UserInfo | null>(null);
  const [msUser, setMsUser] = useState<UserInfo | null>(null);
  const [status, setStatus] = useState<string>("Idle");
  const [gEvents, setGEvents] = useState<CalendarEvent[]>([]);
  const [eventSummary, setEventSummary] = useState("");
  const [eventTime, setEventTime] = useState("");

  useEffect(() => {
    const googleListener = (_event: any, data: any) => {
      setGoogleUser(data.user);
      setStatus("Google login success");
    };
    const msListener = (_event: any, data: any) => {
      setMsUser(data.user);
      setStatus("Microsoft login success");
    };
    window.electronAPI.onLoginSuccess(googleListener);
    window.electronAPI.onMicrosoftLoginSuccess(msListener);

    return () => {
      window.electronAPI.removeLoginSuccessListener(googleListener);
      window.electronAPI.removeMicrosoftLoginSuccessListener(msListener);
    };
  }, []);

  const handleGoogleLogin = async () => {
    setStatus("Logging in with Google...");
    try {
      await window.electronAPI.startLoginRedirect();
    } catch (e) {
      setStatus("Google login failed");
    }
  };

  const handleGoogleLogout = async () => {
    setStatus("Logging out from Google...");
    await window.electronAPI.googleLogout();
    setGoogleUser(null);
    setStatus("Google logged out");
  };

  const handleMicrosoftLogin = async () => {
    setStatus("Logging in with Microsoft...");
    try {
      await window.electronAPI.startMicrosoftLogin();
    } catch (e) {
      setStatus("Microsoft login failed");
    }
  };

  const handleMicrosoftLogout = async () => {
    setStatus("Logging out from Microsoft...");
    await window.electronAPI.microsoftLogout();
    setMsUser(null);
    setStatus("Microsoft logged out");
  };

  const fetchGoogleCalendarEvents = async () => {
    setStatus("Fetching Google Calendar events...");
    try {
      const events = await window.electronAPI.fetchGoogleCalendarEvents();
      setGEvents(events);
      setStatus("Fetched Google Calendar events");
    } catch (e) {
      setStatus("Failed to fetch Google Calendar events");
    }
  };

  const addGoogleCalendarEvent = async () => {
    setStatus("Adding Google Calendar event...");
    try {
      await window.electronAPI.addGoogleCalendarEvent(eventSummary, eventTime);
      setStatus("Event added!");
      setEventSummary("");
      setEventTime("");
      fetchGoogleCalendarEvents();
    } catch (e) {
      setStatus("Failed to add Google Calendar event");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Auth & Calendar Testing Component</h2>
      <div>Status: {status}</div>
      <div style={{ margin: "16px 0", display: "flex", gap: 16 }}>
        <button onClick={handleGoogleLogin}>Login with Google</button>
        <button onClick={handleGoogleLogout} disabled={!googleUser}>
          Logout Google
        </button>
        <button onClick={handleMicrosoftLogin}>Login with Microsoft</button>
        <button onClick={handleMicrosoftLogout} disabled={!msUser}>
          Logout Microsoft
        </button>
      </div>
      <div style={{ margin: "16px 0", display: "flex", gap: 32 }}>
        {googleUser && (
          <div>
            <h4>Google User</h4>
            <div>Name: {googleUser.name}</div>
            <div>Email: {googleUser.email}</div>
            {googleUser.picture && (
              <img src={googleUser.picture} alt="Google profile" width={48} />
            )}
          </div>
        )}
        {msUser && (
          <div>
            <h4>Microsoft User</h4>
            <div>Name: {msUser.name}</div>
            <div>Username: {msUser.username}</div>
            <div>Account ID: {msUser.homeAccountId}</div>
          </div>
        )}
      </div>
      <hr />
      <div style={{ margin: "16px 0" }}>
        <h3>Google Calendar</h3>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <button onClick={fetchGoogleCalendarEvents} disabled={!googleUser}>
            Fetch Upcoming Events
          </button>
        </div>
        <ul>
          {gEvents.map((ev) => (
            <li key={ev.id}>
              <b>{ev.summary}</b> <br />
              {ev.start} - {ev.end}
            </li>
          ))}
        </ul>
        <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
          <input
            type="text"
            placeholder="Event summary"
            value={eventSummary}
            onChange={(e) => setEventSummary(e.target.value)}
            disabled={!googleUser}
          />
          <input
            type="datetime-local"
            value={eventTime}
            onChange={(e) => setEventTime(e.target.value)}
            disabled={!googleUser}
          />
          <button
            onClick={addGoogleCalendarEvent}
            disabled={!googleUser || !eventSummary || !eventTime}
          >
            Add Event
          </button>
        </div>
      </div>
    </div>
  );
};