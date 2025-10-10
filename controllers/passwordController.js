import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

const otpStore = {}; // temporary store { email: { otp, expiresAt } }

export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) return res.json({ success: false, message: "No user found with this email" });

    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
    otpStore[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 }; // expires in 5 min

    // setup mail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // add in .env
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP - AquaShield",
      text: `Your OTP for password reset is ${otp}. It will expire in 5 minutes.`
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = otpStore[email];
    if (!record) return res.json({ success: false, message: "No OTP request found" });

    if (Date.now() > record.expiresAt) {
      delete otpStore[email];
      return res.json({ success: false, message: "OTP expired" });
    }

    if (parseInt(otp) !== record.otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    res.json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    await userModel.findByIdAndUpdate(user._id, { password: hashed });

    // cleanup
    delete otpStore[email];

    res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
