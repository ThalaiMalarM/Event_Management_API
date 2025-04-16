const express = require("express");
const router = express.Router();
const {
     createEvent, getAllEvents, getEventById, updateEvent, deleteEvent, registerForEvent, getRegisteredUsers,
     checkIn, getParticipantList
    } = require("../controllers/eventController");
const authMiddleware = require("../middleware/authMiddleware");

// Protected route for event creation
router.post("/create", authMiddleware, createEvent);
router.get("/", authMiddleware, getAllEvents);
router.get("/:id", authMiddleware, getEventById);
router.put("/:id", authMiddleware, updateEvent);
router.delete("/:id", authMiddleware, deleteEvent);
router.post("/:id/register", authMiddleware, registerForEvent);
router.get("/:id/registrations", authMiddleware, getRegisteredUsers);
router.post("/check-in", checkIn);
router.get("/participants/:eventId", authMiddleware, getParticipantList);

module.exports = router;
