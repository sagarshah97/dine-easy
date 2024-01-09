const nodemailer = require('nodemailer');
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", 
  port: 465,
  secure: true,
  auth: {
    user: process.env.USER,
    pass: process.env.PASSWORD,
  },
});

exports.handler = async (event, context) => {
  try {
    const requestBody = JSON.parse(event.body);
    console.log(requestBody); 

    // Send emails
    await transporter.sendMail({
      from: {
        name: 'DineEasy',
        address: process.env.USER,
      },
      to: requestBody.receiverEmail, 
      subject: requestBody.subject,
      text: requestBody.text,
      html: requestBody.html, 
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Success",
      }),
    };
  } catch (error) {
    console.error("Error: ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error!!!" }),
    };
  }
};
