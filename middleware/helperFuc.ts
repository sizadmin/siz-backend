import path from "path";
import multer from 'multer';
import multerS3 from 'multer-s3';
const nodemailer = require('nodemailer');
import AWS from 'aws-sdk';
require("dotenv").config();

// Set up multer storage (memory storage for this example)
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });


const transporter = nodemailer.createTransport({
    host: 'smtp-relay.sendinblue.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        // user: '7a7ef6001@smtp-brevo.com', // Your Sendinblue email
        // pass: 'nKLGjya93tZhbrO0', // Your Sendinblue API key
    },

});
// // Configure AWS SDK
// AWS.config.update({
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,  // Use your own AWS access key
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,  // Use your own AWS secret key
//     region: process.env.AWS_REGION  // Your bucket's region
// });

// const s3 = new AWS.S3();
// // Set up Multer with S3
// const upload = multer({
//     storage: multerS3({
//         s3: s3,
//         bucket: process.env.AWS_BUCKET_NAME,
//         acl: 'public-read',  // You can set 'private' if you want to restrict access
//         metadata: (req, file, cb) => {
//             cb(null, { fieldName: file.fieldname });
//         },
//         key: (req, file, cb) => {
//             cb(null, Date.now().toString() + path.extname(file.originalname)); // Rename file with current timestamp
//         }
//     }),
//     limits: { fileSize: 10 * 1024 * 1024 },  // Limit file size to 10MB
//     fileFilter: (req, file, cb) => {
//         if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
//             cb(null, true);
//         } else {
//             cb(new Error('Invalid file type, only JPEG and PNG is allowed!'), false);
//         }
//     }
// });
export { transporter }