const nodemailer = require("nodemailer");
const { IncomingForm } = require("formidable");

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  const form = new IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Failed to parse form data." });
    }

    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const pdfFile = files.file[0];
      const fileContent = pdfFile.filepath;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: "srmistnetwork@gmail.com",
        subject: "Grievance Form PDF",
        text: "Please find the attached grievance form PDF.",
        attachments: [
          {
            filename: "GrievanceForm.pdf",
            path: fileContent,
          },
        ],
      };

      await transporter.sendMail(mailOptions);
      res.status(200).json({ success: true, message: "Email sent successfully." });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ success: false, message: "Error sending email." });
    }
  });
}
