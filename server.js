const express = require("express");
require("dotenv").config();
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res)=>{
    res.send("Event Management API is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);

const PORT = 5000;
app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
});