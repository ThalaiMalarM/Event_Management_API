const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");
    }
    catch(error){
        console.log("Error occurred", error.message);
    }
};

module.exports = connectDB;