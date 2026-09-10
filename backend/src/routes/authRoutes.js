import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

//create router with express
const router = express.Router();


const generateToken = (userId) => {
    return jwt.sign({userId}, process.env.JWT_SECRET, { expiresIn: "15d"});
}

//endpoints
router.post("/register",async(req, res) => {
    try {
        const { username, email, password } = req.body;

        //validate input
        if(!username || !email || !password){
            return res.status(400).json({ message: "Please provide all required fields" });
        }

        if(password.length < 6){
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        if(username.length < 3){
            return res.status(400).json({ message: "Username must be at least 3 characters long" });
        }

        //check if user already exists
        const existingEmail = await User.findOne({ email });
        if(existingEmail) { 
            return res.status(400).json({ message: "Email already exists" }); 
        }

        const existingUsername = await User.findOne({ username });
        if(existingUsername) {
            return res.status(400).json({ message: "Username already exists" });

        }

        //get a random avatar(unique profile image)

        const profileImage = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

        const user = new User({
            email,
            username,
            password,
            profileImage,
        })

        await user.save();

        const token = generateToken(user._id);

        res.status(201).json({
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage
            }
        })
    } catch (error) {
        console.log("error in register route", error);
        res.status(500).json({ message: "Server error" });
    }
});


router.post("/login", async(req, res) => {
    try{
        const { email, password } = req.body;

        if (!email || !password) return res.status(400).json({ message: "all fields are required " });

        // check if user exists
        const user = await User.findOne({ email });
        if(!user) return res.status(400).json({ message: "Invalid credentials" });

        //compare password
        const isMatch = await user.comparePassword(password);
        if(!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // generate token
        const token = generateToken(user._id);

        res.status(200).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage
            }
        });

    } catch (error) {
        console.log("error in login route", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


export default router;

