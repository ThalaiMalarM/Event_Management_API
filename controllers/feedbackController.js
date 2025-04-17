const Feedback = require("../models/Feedback");
const Event = require("../models/Event");

exports.submitFeedback = async (req, res) => {
  const { rating, comment } = req.body;
  const eventId = req.params.eventId;

  try {
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const existing = await Feedback.findOne({ event: eventId, user: req.user._id });
    if (existing) return res.status(400).json({ message: "Feedback already submitted" });

    const feedback = new Feedback({
      event: eventId,
      user: req.user._id,
      rating,
      comment,
    });

    await feedback.save();
    res.status(201).json({ message: "Feedback submitted", feedback });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getFeedbackForEvent = async (req, res) => {
  const eventId = req.params.eventId;

  try {
    const feedback = await Feedback.find({ event: eventId }).populate("user", "name email");
    res.status(200).json({ feedback });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};
