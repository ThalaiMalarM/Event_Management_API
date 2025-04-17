const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const feedbackController = require("../controllers/feedbackController");

// Submit feedback
router.post("/:eventId", authMiddleware, feedbackController.submitFeedback);

// Get feedback for an event
router.get("/:eventId", feedbackController.getFeedbackForEvent);

module.exports = router;
