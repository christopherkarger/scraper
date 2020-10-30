const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.Email,
    pass: process.env.Password,
  },
});

const mailOptions = {
  from: process.env.Email,
  to: "karger1986@gmail.com",
  subject: "Sending Email using Node.js",
  text: "That was easy!",
};

export const sendEmail = () =>
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
