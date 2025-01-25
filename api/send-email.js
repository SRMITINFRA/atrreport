const nodemailer = require('nodemailer');
const { IncomingForm } = require('formidable');  // To handle file uploads

export const config = {
  api: {
    bodyParser: false, // Disable body parsing, as we handle it manually
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Handle file upload using formidable
    const form = new IncomingForm();
    form.parse(req, (err, fields, files) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'File upload failed.' });
      }

      // Create a Nodemailer transporter
      const transporter = nodemailer.createTransport({
        service: 'gmail',  // or any email provider
        auth: {
          user: 'process.env.EMAIL_USER',  // Add your email
          pass: 'process.env.EMAIL_PASS',  // Add your email password or app password
        },
      });

      // Email options
      const mailOptions = {
        from: process.env.EMAIL_USER,  // Your email
        to: 'srmistnetwork@gmail.com',  // Recipient email
        subject: 'Grievance Form PDF',
        text: 'Please find the attached grievance form PDF.',
        attachments: [
          {
            filename: 'GrievanceForm.pdf',
            content: files.file[0].buffer,  // Attach the uploaded file (PDF)
          },
        ],
      };

      // Send email with Nodemailer
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.status(500).json({ success: false, message: error.toString() });
        }
        return res.status(200).json({ success: true, message: 'Email sent successfully' });
      });
    });
  } else {
    res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }
}
