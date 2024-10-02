const nodemailer = require('nodemailer');
require("dotenv").config();



const transporter = nodemailer.createTransport({
    host: 'smtp-relay.sendinblue.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SENDINBLUE_AUTH_EMAIL, // Your Sendinblue email
        pass: process.env.SENDINBLUE_API_KEY, // Your Sendinblue API key
    },

});
export { transporter }