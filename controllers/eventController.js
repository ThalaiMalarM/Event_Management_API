const Event = require("../models/Event");
const User = require("../models/User");
const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");
const cloudinary = require("../utils/cloudinary");
const sendEmail = require("../utils/sendEmail");
// const sendSMS = require('../utils/sendSMS');
const { Parser } = require("json2csv");

exports.createEvent = async (req, res) => {
    try {
        const { title, description, date, location } = req.body;
        if (req.user.role !== "admin" && req.user.role !== "organizer") {
            return res.status(403).json({ message: "Access Denied" });
        }
        const newEvent = new Event({
            title,
            description,
            date,
            location,
            createdBy: req.user._id,
        });
        await newEvent.save();
        res.status(201).json({ message: "Event added successfully", event: newEvent });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.getAllEvents = async (req, res) => {
    try {
        const events = await Event.find().populate("createdBy", "name email");
        res.status(200).json(events);
    }
    catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

exports.getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate("createdBy", "name email");
        if (!event) return res.status(404).json({ message: "Event not found" });
        res.status(200).json(event);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.updateEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: "Event not found" });
        if (req.user.role !== "admin" && !(req.user.role == "organizer" && event.createdAt.toString() == req.user._id.toString())) {
            return res.status(403).json({ message: "Access denied" });
        }
        const { title, description, date, location } = req.body;
        event.title = title || event.title;
        event.description = description || event.description;
        event.date = date || event.date;
        event.location = location || event.location;
        await event.save();
        res.status(200).json({ message: "Event Updated", event });
    }
    catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: "Event not found" });
        if (req.user.role !== "admin" && !(req.user.role == "organizer" && event.createdBy.toString() === req.user._id.toString())) {
            return res.status(403).json({ message: "Access Denied" });
        }
        await event.deleteOne();
        res.status(200).json({ message: "Event deleted" });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.registerForEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: "Event not found" });
        const alreadyRegistered = event.registrations.includes(req.user._id);
        if (alreadyRegistered) return res.status(400).json({ message: "Already registered the event" });
        event.registrations.push(req.user._id);
        await event.save();
        const user = await User.findOne(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });
        const payload = JSON.stringify({ userId: req.user._id, eventId: event._id });
        const tempDir = path.join(__dirname, "../temp");
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
        const tempPath = path.join(tempDir, `qr-${Date.now()}.png`);
        await QRCode.toFile(tempPath, payload);
        const result = await cloudinary.uploader.upload(tempPath, {
            folder: "event-qr-codes",
        });
        // fs.unlinkSync(tempPath);
        await sendEmail(
            user.email,
            "Event registration confirmation",
            `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
    <h2 style="text-align: center; color: #333;">🎉 You're Registered!</h2>
    <p style="font-size: 16px;">Hi ${user.name || "there"},</p>
    <p style="font-size: 16px;">
      Thank you for registering for <strong>${event.title}</strong> happening on <strong>${new Date(event.date).toLocaleString()}</strong> at <strong>${event.location}</strong>.
    </p>
    <p style="font-size: 16px;">Please show the following QR code at the entrance for check-in:</p>
    <div style="text-align: center; margin: 20px 0;">
      <img src="${result.secure_url}" alt="QR Code" style="width: 200px; height: 200px;" />
    </div>
    <p style="text-align: center;">
      <a href="${result.secure_url}" download="qr-code.png" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Download QR Code</a>
    </p>
    <p style="font-size: 14px; color: #555; margin-top: 30px;">
      📧 This QR code is also attached in this email as a downloadable file.<br>
      If you have any questions, feel free to reply to this email.
    </p>
    <p style="font-size: 16px;">Best regards,<br>Event Team</p>
  </div>`,
            [
                {
                    filename: "qr-code.png",
                    path: tempPath, // Path to the file before it's deleted
                    contentType: "image/png",
                },
            ]
        );
        
        res.status(200).json({ message: "Registration success..", qrCodeUrl: result.secure_url });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
    fs.unlinkSync(tempPath);
};

exports.getRegisteredUsers = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate("registrations", "name email role");
        if (!event) return res.status(404).json({ message: "Event not found" });
        if (req.user.role !== "admin" && !(req.user.role === "organizer" && event.createdAt.toString() === req.user._id.toString())) {
            return res.status(403).json({ message: "Access Denied" });
        }
        res.status(200).json(event.registrations);
    }
    catch (error) {
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
};

exports.checkIn = async (req, res) => {
    try {
        const { userId, eventId } = req.body;
        if (!userId || !eventId) {
            return res.status(400).json({ message: "userId and eventId are required" });
        }
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });
        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: "Event not found" });
        const isRegistered = event.registrations.includes(userId);
        if (!isRegistered) return res.status(400).json({ message: "User not registered" });
        const alreadyCheckedIn = event.checkedInUsers.some(
            (entry) => entry.user.toString() == userId
        );
        if (alreadyCheckedIn) return res.status(400).json({ message: "User already checked in" });
        event.checkedInUsers.push({ user: user._id, checkedInAt: new Date() });
        await event.save();

        res.status(200).json({ message: "Checked In successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.getParticipantList = async (req, res) => {
    try{
        const eventId = req.params.eventId;
        const event = await Event.findById(eventId).populate("registrations", "name email phone");
        if (!event) return res.status(404).json({message: "Event not found"});
        if (req.user.role !== "admin" && !(req.user.role === "organizer" && event.createdBy.toString() === req.user._id.toString())){
            return res.status(403).json({message: "Access denied"});
        } 
        const participants = event.registrations;
        if (req.query.export === "csv"){
            const fields = ["name", "email", "phone"];
            const parser = new Parser({fields});
            const csv = parser.parse(participants);
            res.header("Content-Type", "text/csv");
            res.attachment("participants.csv");
            return res.send(csv);
        }
        res.status(200).json({ participants });
    }
    catch(error){
        console.error(error);
        res.status(500).json({message: "Server Error"});
    }
};


