const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");
const app = express();

// Middleware for handling file uploads
const upload = multer();
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.status(200).send("Express server is working!");
});



app.post("/send-email", upload.single("file"), async (req, res) => {
    try {
        const { email } = req.body; // Extract email from the request
        const file = req.file;

        // Nodemailer setup
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: "srmistnetwork@gmail.com",
                pass: "@itsupport2019",
            },
        });

        const mailOptions = {
            from: "srmistnetwork@gmail.com",
            to: "srmistnetwork@gmail.com", // Common email
            subject: "Generated PDF",
            text: "Please find the attached PDF.",
            attachments: [
                {
                    filename: file.originalname,
                    content: file.buffer,
                },
            ],
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Email sent successfully!" });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ error: "Failed to send email" });
    }
});




module.exports = app;
