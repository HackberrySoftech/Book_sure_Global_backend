import axios from "axios";
import db from "../config/db.js";
import cron from "node-cron";

const CALENDLY_TOKEN = process.env.CALENDLY_PAT;

/* ================================
   🔹 INTERNAL SYNC FUNCTION
================================ */

const syncCalendlyEventsInternal = async () => {
  try {
    const userRes = await axios.get(
      "https://api.calendly.com/users/me",
      {
        headers: {
          Authorization: `Bearer ${CALENDLY_TOKEN}`,
        },
      }
    );

    const userUri = userRes.data.resource.uri;

    const eventsRes = await axios.get(
      `https://api.calendly.com/scheduled_events?user=${userUri}`,
      {
        headers: {
          Authorization: `Bearer ${CALENDLY_TOKEN}`,
        },
      }
    );

    const events = eventsRes.data.collection;

    for (let event of events) {
      const eventId = event.uri.split("/").pop();

      const inviteeRes = await axios.get(
        `https://api.calendly.com/scheduled_events/${eventId}/invitees`,
        {
          headers: {
            Authorization: `Bearer ${CALENDLY_TOKEN}`,
          },
        }
      );

      const invitee = inviteeRes.data.collection[0];

      if (invitee) {
        await db.promise().query(
          `INSERT INTO calendly_events 
          (calendly_event_id, invitee_name, invitee_email, event_start, event_end, timezone, status)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
          invitee_name = VALUES(invitee_name),
          invitee_email = VALUES(invitee_email),
          event_start = VALUES(event_start),
          event_end = VALUES(event_end),
          timezone = VALUES(timezone),
          status = VALUES(status)`,
          [
            eventId,
            invitee.name,
            invitee.email,
            event.start_time,
            event.end_time,
            invitee.timezone,
            event.status,
          ]
        );
      }
    }

    console.log("Calendly auto sync completed");
  } catch (error) {
    console.error("Cron Sync Error:", error.message);
  }
};

/* ================================
   🔹 CRON JOB (Every 5 Minutes)
================================ */

cron.schedule("*/5 * * * *", async () => {
  console.log("Auto syncing Calendly...");
  await syncCalendlyEventsInternal();
});

export const syncCalendlyEvents = async (req, res) => {
  try {
    await syncCalendlyEventsInternal();

    res.json({
      success: true,
      message: "Calendly events synced successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCalendlyEvents = async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      "SELECT * FROM calendly_events ORDER BY event_start DESC"
    );

    res.json({
      success: true,
      data: rows,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: [],
    });
  }
};

export const getTodayActiveMeetings = async (req, res) => {
  try {
  const now = new Date();
const istOffset = 5.5 * 60 * 60 * 1000;
const istDate = new Date(now.getTime() + istOffset);
const today = istDate.toISOString().split("T")[0];

    const [rows] = await db.promise().query(
      `SELECT * FROM calendly_events
       WHERE status = 'active'
       AND DATE(event_start) = ?
       ORDER BY event_start ASC`,
      [today]
    );

    res.json({
      success: true,
      data: rows,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: [],
    });
  }
};