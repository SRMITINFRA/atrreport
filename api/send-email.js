import nodemailer from "nodemailer";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false, // Required for `formidable`
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send({ message: "Method Not Allowed" });
  }

  try {
    // Parse the incoming form data
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Error parsing form data:", err);
        return res.status(500).send({ success: false, message: "Form parsing error" });
      }

      // Check for the uploaded file
      const pdfFile = files.file;
      if (!pdfFile || !pdfFile.filepath) {
        return res.status(400).send({ success: false, message: "No file uploaded" });
      }

      // Read the file
      const fileData = fs.readFileSync(pdfFile.filepath);

      // Configure the Nodemailer transporter
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com", // Use your SMTP provider's host (e.g., Gmail, Outlook)
        port: 465, // Typically 465 for secure connections
        secure: true, // Use SSL/TLS
        auth: {
          user: process.env.EMAIL_USER, // Your email
          pass: process.env.EMAIL_PASS, // Your email password/app password
        },
      });

      // Define the email content
      const mailOptions = {
        from: process.env.EMAIL_USER, // Sender address
        to: "srmistnetwork@gmail.com", // Recipient address
        subject: "Grievance Form Submission",
        text: "Attached is the generated Grievance Form PDF.",
        attachments: [
          {
            filename: "GrievanceForm.pdf",
            content: fileData,
          },
        ],
      };

      // Send the email
      await transporter.sendMail(mailOptions);
      return res.status(200).send({ success: true, message: "Email sent successfully" });
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).send({ success: false, message: "Error sending email" });
  }
}
