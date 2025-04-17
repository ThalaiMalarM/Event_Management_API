const cron = require("node-cron");
const Event = require("../models/Event");
const sendEmail = require("../utils/sendEmail");
// const sendSMS = require("../utils/sendSMS");

const moment = require("moment");

// Run every day at 9 AM
cron.schedule("0 9 * * *", async () => {
  const now = new Date();
  const nextDay = new Date(now);
  nextDay.setDate(now.getDate() + 1);

  // Normalize date to ignore time difference
  const startOfDay = new Date(nextDay.setHours(0, 0, 0, 0));
  const endOfDay = new Date(nextDay.setHours(23, 59, 59, 999));

  try {
    const events = await Event.find({
      date: { $gte: startOfDay, $lte: endOfDay },
    }).populate("registrations", "name email phone");

    for (const event of events) {
      for (const user of event.registrations) {
        await sendEmail(
            user.email,
            `Reminder: ${event.title} is tomorrow!`,
            `
              <h2>Hello ${user.name},</h2>
              <p>This is a reminder that <strong>${event.title}</strong> is scheduled for <b>${moment(event.eventDate).format("dddd, MMMM Do YYYY")}</b>.</p>
              <p>Please be ready and don’t forget your QR code!</p>
            `);
      }
    }

    console.log("1-day reminder job completed.");
  } catch (err) {
    console.error("Error sending reminders:", err);
  }
});
