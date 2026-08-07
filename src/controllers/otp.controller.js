const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER_GMAIL,             // Your Gmail address from the .env file 
    pass: process.env.NODEMAILER_GMAIL_PASSWORD,             // Your Gmail app password from the .env file
  }
});

// Configure the mailoptions object


// Send the email
async function sendEmail(otp, email) {
    const mailOptions = {
  from: process.env.NODEMAILER_GMAIL,               // Sender address from the .env file
  to: email,
  subject: 'Your OTP Code',
  text: `Your OTP code is: ${otp}`
};
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });
  
}

  module.exports = { sendEmail };