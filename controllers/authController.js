const { exist } = require("joi");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const cloudinary = require("../utils/cloudinary");
const fs = require("fs");
require("dotenv").config();

const generateToken = (user) => {
    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { name, phone, email, password, role } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });
        const user = await User.create({ name, phone, email, password, role });
        const token = generateToken(user);
        res.status(201).json({
            message: "User registered successfully",
            token,
            user: { id: user._id, name: user.name, phone: user.phone, email: user.email, role: user.role }
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select("+password");
        if (!user) return res.status(404).json({ message: "User not found" });
        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: "Password mismatch" });
        const token = generateToken(user);
        res.status(200).json({
            message: "Logged in successfully",
            token,
            user: { id: user._id, name: user.name, phone: user.phone, email: user.email, role: user.role },
        });
    }
    catch(error){
        res.status(500).json({message: "Server error"});
    }
};

