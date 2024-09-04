import { Response, Request } from 'express';
import template from '../../../models/template';
import { IWTemplate } from "../../../types/WTemplate"
import { createTemplate, deleteTemplateFromFB, updateTemplateToFB } from '../whatsapp';
import { htmlToText } from 'html-to-text';
const { Upload } = require('@aws-sdk/lib-storage');
const { S3Client } = require('@aws-sdk/client-s3');

require("dotenv").config();

var _ = require('lodash');

import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import axios from "axios";

// Set up AWS S3 client
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        // accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        // secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,

        accessKeyId: process.env.AWS_ACCESS_KEY_ID,  // Use your own AWS access key
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,  // Use your own AWS secret key
        // region: process.env.AWS_REGION  // Your bucket's region
    },
});

const getTemplates = async (req: Request, res: Response): Promise<void> => {
    try {

        const contactList: IWTemplate[] = await template.find();

        res.status(200).json({ count: contactList.length, results: contactList });

    } catch (error) {
        console.log(error);
        res.status(400).json({ error });
        throw error;
    }
};

const addTemplates = async (req: Request, res: Response): Promise<void> => {
    try {
        let options = { new: true };
        const { body } = req;
        body.status = "CREATED";
        let newTemplate: IWTemplate = new template(body);

        let savedList: IWTemplate = await newTemplate.save();
        res.status(201).json({ message: 'Template Created', result: [savedList] });
        return;
    } catch (error) {

        res.status(400).json({ message: 'Something went wrong', error });
        throw error;
    }
};
const SubmitTemplateForReview = async (req: Request, res: Response): Promise<void> => {
    try {
        let options = { new: true };
        const { body } = req;
        let templateDetails: any = await template.find({ _id: body._id })
        const textContent = htmlToText(templateDetails[0].body);
        const textContentHeader = htmlToText(templateDetails[0].headerText);
        templateDetails = { ...templateDetails, body: textContent, headerText: textContentHeader }
        let templateStatus: any = {}
        if (templateDetails[0].status === 'CREATED') {
            templateStatus = await createTemplate(req, res, templateDetails[0]);
            templateDetails[0].status = templateStatus.status;
            templateDetails[0].templateId = templateStatus.id;

        }
        if (templateDetails[0].status === 'UPDATED') {
            templateStatus = await updateTemplateToFB(req, res, templateDetails[0]);
            templateDetails[0].status = 'PENDING'
        }


        const savedList2: IWTemplate | null = await template.findByIdAndUpdate({ _id: templateDetails[0]._id }, templateDetails[0], options);
        res.status(201).json({ message: 'Template Submitted for Review', result: [savedList2] });
        return;
    } catch (error) {
        res.status(400).json({ message: error.error.error_user_msg, error: error.error });
        // throw error;
    }
};

const updateTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            params: { id },
            body,
        } = req;

        let options = { new: true };

        let updatedList: IWTemplate | null = await template.findByIdAndUpdate({ _id: id }, body, options);
        res.status(201).json({ message: 'Template Updated', result: [updatedList] });
        return;
    } catch (error) {

        res.status(400).json({ message: 'Something went wrong', error });
        // throw error;
    }
};



const deleteTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
        const deletedList: IWTemplate | null = await template.findByIdAndRemove(req.params.id);
        let templateStatus: any = await deleteTemplateFromFB(req, res, deletedList);

        res.status(200).json({
            message: 'Template List deleted',
            result: [deletedList],
        });
        return;
    } catch (error) {

        res.status(400).json({ error });
        // throw error;
    }
};

const getTemplatesById = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            params: { id },
            body,
        } = req;
        const contactList: IWTemplate[] = await template.find({ _id: id });

        res.status(200).json({ count: contactList.length, results: contactList });

    } catch (error) {
        console.log(error);
        res.status(400).json({ error });
        throw error;
    }
};

const uploadImageToFB = async (req: any, res: any) => {
    // try {

    // console.log(req.file.location, "req.file.location")
    // console.log(process.env.AWS_REGION, "vvv")




    try {
        const file = req.file;

        if (!file) {
            return res.status(400).send('No file uploaded.');
        }
        // File key for S3
        const fileKey = file.originalname;


        // Upload the file to S3
        const uploadParams = {
            Bucket: process.env.S3_BUCKET_NAME, // S3 bucket name
            Key: file.originalname, // File name in S3
            Body: file.buffer, // File content
            'ContentType':file.mimetype,
        };
        // console.log(uploadParams,"file")

        const upload = new Upload({
            client: s3,
            params: uploadParams,
        });

        await upload.done();

        // Generate the file URL
        const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;


        const accessToken = process.env.AUTHORIZATION_TOKEN;

        let binaryData: any = ''

        let url = '?file_length=' + Number(file.size) + '&file_type=' + file.mimetype + '&access_token=' + accessToken
        const imageUrl = fileUrl;
        imageUrlToBinary(imageUrl)
            .then(binaryData1 => {
                // console.log('Binary data:', binaryData1);
                binaryData = binaryData1
                // You can now use this binary data for further processing (e.g., uploading)
            })
            .catch(error => console.error('Failed to convert image URL to binary:', error));



        try {
            const response = await axios.post(
                'https://graph.facebook.com/v17.0/604663958403059/uploads' + url,
                {},
                {
                    headers: {
                        Authorization: `${accessToken}` // Replace with your access token
                    }
                }
            );

            console.log('Image upload id:', response.data);
            try {
                let url2 = response.data.id
                console.log(url2, "url2")
                const response1 = await axios.post(
                    'https://graph.facebook.com/v17.0/' + url2,
                    binaryData,
                    {
                        headers: {
                            Authorization: `OAuth ${accessToken}`, // Replace with your access token
                            file_offset: 0,

                        }
                    }
                );

                console.log('Image uploaded data:', response1.data);
                // return response1.data
                res.status(200).json({ message: 'Image Uploaded successfully', data: { ...response1.data, fileUrl }});


            } catch (error) {
                console.error('Error uploading image:', error.response ? error.response.data : error.message);
            }



        } catch (error) {
            console.error('Error uploading image:', error.response ? error.response.data : error.message);
        }




        // res.send(`File Uploaded: ${req.file.filename}`);
        // }
        // });





    } catch (e) {
        console.log(e)
    }

}

async function imageUrlToBinary(imageUrl) {
    try {
        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer' // Ensures the response is in the form of a binary buffer
        });

        const binaryData = response.data;
        return binaryData;
    } catch (error) {
        console.error('Error fetching the image:', error);
        throw error;
    }
}


export {
    addTemplates,
    updateTemplate,
    deleteTemplate,
    getTemplates,
    getTemplatesById,
    SubmitTemplateForReview,
    uploadImageToFB
};
