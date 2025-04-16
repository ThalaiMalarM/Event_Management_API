const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) res.status(401).json({message: "No Token, Authorization denied"});
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password");
        if(!req.user) return res.status(401).json({message: "User not found"});
        next();
    }
    catch(error){
        return res.status(401).json({message: "Invalid token"});
    }
};

module.exports = authMiddleware;