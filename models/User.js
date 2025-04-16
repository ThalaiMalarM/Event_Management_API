const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please provide name"],
        },
        email: {
            type: String,
            required: [true, "Please provide email"],
            unique: true,
            lowercase: true,
        },
        phone: {
            type: Number,
            required: [true, "Please provide phone number"],
            unique: true,
        },
        password: {
            type: String,
            required: [true, "Please provide password"],
            minlength: 6,
            select: false,
        },
        role: {
            type: String,
            enum: ["admin", "organizer", "attendee"],
            default: "attendee",
        },
    },
    { timestamps: true }
);

userSchema.pre("save", async function (next){
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);    
};

module.exports = mongoose.model("User", userSchema);
