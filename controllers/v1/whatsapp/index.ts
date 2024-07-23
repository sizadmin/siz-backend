import axios from 'axios';
import { Response, Request } from 'express';
const express = require('express');
const app = express();
const { AUTHORIZATION_TOKEN, WHATSAPP_VERSION, WHATSAPP_PHONE_VERSION } = process.env;


const sendWhatsappMsg = async (req: any, res: any) => {
    try {
        const { phoneNumber } = req.body;

        // Implement the logic to send WhatsApp notifications here
        // Use the message and phoneNumber variables to send the notification
        let url = `https://graph.facebook.com/${WHATSAPP_VERSION}/${WHATSAPP_PHONE_VERSION}/messages/`;
        let payload = {
            messaging_product: "whatsapp",
            to: phoneNumber,
            type: "template",
            template: {
                name: "hello_world",
                language: {
                    code: "en_US",
                },
            },
        };
        let config = {
            headers: {
                Authorization: "Bearer " + AUTHORIZATION_TOKEN,
            },
        };
        // Example using Axios to make a POST request to the WhatsApp API
        const response = await axios.post(url, payload, config);
        // Handle the WhatsApp API response and send a success message back to the client
        res.status(200).json({
            success: true,
            message: "WhatsApp notification sent successfully",
        });
    } catch (error) {
        // Handle errors and send an error response back to the client
        console.error("Failed to send WhatsApp notification:", error);
        res
            .status(500)
            .json({ success: false, error: "Failed to send WhatsApp notification" });
    }
}

const getMessageTemplates = async (req: any, res: any) => {
    console.log("Getting Message Templates");
    setTimeout(() => {
        const config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'https://graph.facebook.com/v17.0/104160086072686/message_templates?fields=name,status,language,components&status=APPROVED',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': "Bearer " + process.env.AUTHORIZATION_TOKEN,
            }
          };
          const response =  axios.request(config);   
          res.status(200).json({
            success: true,
            message: "Shopify orders fetched successfully.",
             data: response ,
          });
          
    }, 5000) ;
   
}

export { sendWhatsappMsg ,getMessageTemplates}