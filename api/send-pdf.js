import nodemailer from "nodemailer";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).send({ error: "Only POST requests are allowed" });
    }

    try {
        // Extract PDF file from the request
        const file = req.body.pdf;

        if (!file) {
            return res.status(400).send({ error: "No PDF file received" });
        }

        // Create a Nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: "Gmail", // Use Gmail for simplicity
            auth: {
                user: process.env.EMAIL_USER, // Add your email here
                pass: process.env.EMAIL_PASS, // Add your app password here
            },
        });

        // Mail options
        const mailOptions = {
            from: process.env.EMAIL_USER, // Sender email
            to: "srmistnetwork@gmail.com", // Recipient email
            subject: "ATR Report",
            text: "Please find the attached ATR report.",
            attachments: [
                {
                    filename: "atrReport.pdf",
                    content: file,
                    encoding: "base64", // Set encoding if required
                },
            ],
        };

        // Send email
        await transporter.sendMail(mailOptions);

        res.status(200).send({ success: "PDF sent successfully!" });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).send({ error: "Failed to send PDF" });
    }
}
