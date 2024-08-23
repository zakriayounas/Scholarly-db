import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

export const registerNewUser = async (req, res) => {
    const { name, email, password, confirm_password } = req.body;

    try {
        if (password !== confirm_password) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        const profile_color = getRandomColor()
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            profile_color
        });

        const savedUser = await newUser.save();
        res.status(201).json({
            id: savedUser._id,
            name: savedUser.name,
            email: savedUser.email,
            profile_color: savedUser.profile_color
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(404).json({ message: `email and password are required` });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        res.status(200).json({
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                profile_color: user.profile_color
            },
            token,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


