// api/send-email.js
const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Setup Nodemailer transporter
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'your-email@gmail.com', // Replace with your email
          pass: 'your-email-password',   // Replace with your password or app password
        },
      });

      // Email options
      const mailOptions = {
        from: 'your-email@gmail.com', // Sender address
        to: 'recipient-email@example.com', // List of receivers
        subject: 'Subject of the email',
        text: 'Body of the email',
        attachments: [
          {
            filename: 'GrievanceForm.pdf',
            content: req.body, // Assuming the PDF is in the body
            encoding: 'base64',
          },
        ],
      };

      // Send email
      await transporter.sendMail(mailOptions);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }
}
