import { createToken } from '../lib/utils.js';
import User from '../models/user.model.js';
import bcrypt from 'bcrypt';

export const signup = async(req, res) => {
    const {email, password } = req.body;
    try {
        const user = await User.findOne({email});
        if (user) return res.status(400).json({ message: "Email already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const newUser = new User({
            email,
            password: hashedPassword,
        })

        if (newUser) {
            createToken(newUser._id, res);
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
            });
        } else {
            console.log("Error in signup controller:", error.message);
            res.status(500).json({ message: "Internal Server Error" });
        }

    } catch (error) {
        console.log("Error in signup controller:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
  
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
  
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
    
        createToken(user._id, res);
  
        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
        });
    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}