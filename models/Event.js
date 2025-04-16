const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    date: {
      type: Date,
      required: true,
    },
    location: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    registrations: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    checkedInUsers: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        checkedInAt: { type: Date, default: null },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
