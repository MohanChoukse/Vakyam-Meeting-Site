import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Meeting } from "../models/meeting.model.js";

const JWT_SECRET = process.env.JWT_SECRET || "vakyam_secret_key_123456";

const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Please Provide" });
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "User Not Found" });
        }

        let isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (isPasswordCorrect) {
            const token = jwt.sign(
                { id: user._id, username: user.username },
                JWT_SECRET,
                { expiresIn: "24h" }
            );

            user.token = token;
            await user.save();

            return res.status(httpStatus.OK).json({
                token: token,
                user: {
                    id: user._id,
                    name: user.name,
                    username: user.username
                }
            });
        } else {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid Username or password" });
        }
    } catch (e) {
        return res.status(500).json({ message: `Something went wrong ${e}` });
    }
};

const register = async (req, res) => {
    const { name, username, password } = req.body;

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(httpStatus.FOUND).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name: name,
            username: username,
            password: hashedPassword
        });

        await newUser.save();

        res.status(httpStatus.CREATED).json({ message: "User Registered" });
    } catch (e) {
        res.json({ message: `Something went wrong ${e}` });
    }
};

const getUserHistory = async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(httpStatus.UNAUTHORIZED).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
        }

        const meetings = await Meeting.find({ user_id: user.username });
        res.json(meetings);
    } catch (e) {
        res.status(httpStatus.UNAUTHORIZED).json({ message: `Unauthorized: ${e.message}` });
    }
};

const addToHistory = async (req, res) => {
    const { token, meeting_code } = req.body;

    if (!token) {
        return res.status(httpStatus.UNAUTHORIZED).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
        }

        const newMeeting = new Meeting({
            user_id: user.username,
            meetingCode: meeting_code
        });

        await newMeeting.save();

        res.status(httpStatus.CREATED).json({ message: "Added code to history" });
    } catch (e) {
        res.status(httpStatus.UNAUTHORIZED).json({ message: `Unauthorized: ${e.message}` });
    }
};

const updateProfile = async (req, res) => {
    // Note: Assuming JWT token is passed in Authorization header Bearer <token>
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(httpStatus.UNAUTHORIZED).json({ success: false, message: "No token provided" });
    }
    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ success: false, message: "User not found" });
        }

        const { name, bio } = req.body;
        
        if (name) user.name = name;
        if (bio !== undefined) user.bio = bio;
        
        await user.save();

        res.status(httpStatus.OK).json({ 
            success: true, 
            message: "Profile updated", 
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                bio: user.bio
            }
        });
    } catch (e) {
        res.status(httpStatus.UNAUTHORIZED).json({ success: false, message: `Unauthorized: ${e.message}` });
    }
};

export { login, register, getUserHistory, addToHistory, updateProfile };