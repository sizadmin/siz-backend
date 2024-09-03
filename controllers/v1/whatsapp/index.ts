import axios from 'axios';
import { Response, Request } from 'express';
import { IWTemplate } from '../../../types/WTemplate';
import template from '../../../models/template';
const express = require('express');
const app = express();
const { AUTHORIZATION_TOKEN, WHATSAPP_VERSION, WHATSAPP_PHONE_VERSION } = process.env;
import { htmlToText } from 'html-to-text';
import { uploadImageToFB } from '../wtemplate';




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
    try {
        let url = `https://graph.facebook.com/v17.0/104160086072686/message_templates?fields=name,status,language,components`;
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + process.env.AUTHORIZATION_TOKEN,
            }
        };
        const response = await axios.get(url, config);
        res.status(200).json({
            success: true,
            message: "Message Templates Fetched Successfully",
            data: response.data,
        });
    } catch (error) {
        console.error("Failed to fetch shopify orders:", error);
    }

}

const fetchTemplateStatus = async (req: any, res: any) => {

    try {
        let url = `https://graph.facebook.com/v17.0/104160086072686/message_templates?fields=name,status,language,components`;
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + process.env.AUTHORIZATION_TOKEN,
            }
        };
        const response = await axios.get(url, config);

        const options = { new: true, runValidators: true };

        let responseData = [];


        const promises = response.data.data.map(async (element: any) => {
            let name = element.name;

            const update = { status: element.status, templateId: element.id };

            // Update the template and return the result
            const updatedList: IWTemplate | null = await template.findOneAndUpdate({ name: name }, update, options);

            // Push the result to the responseData array
            if (updatedList) responseData.push(updatedList);
        });


        await Promise.all(promises);

        // response.data.data.forEach(async (element: any) => {
        //     let templateId = element.id;
        //     const update = { status: element.status }
        //     const updatedList: IWTemplate | null = await template.findOneAndUpdate({ templateId: templateId }, update, options);
        //     responseData.push(updatedList)
        // });

        res.status(200).json({
            success: true,
            message: "Whatsapp Templates Status Updated Successfully",
            data: responseData,
        });
    } catch (error) {
        console.error("Failed to Update Whatsapp Templates Status:", error);
    }

}

const createTemplate = async (req: any, res: any, savedList: any) => {
    try {

        // Set the access token for your WhatsApp Business API
        const accessToken = process.env.AUTHORIZATION_TOKEN;

        // let imageURL: any = await uploadImageToFB(req, res);
        let componentsData = []

        if (savedList.imageMediaCode && savedList.imageMediaCode !== "" ) {
            componentsData.push({

                "type": "HEADER",
                "format": "IMAGE",
                "example": {
                    "header_handle": [
                        savedList.imageMediaCode
                    ]
                }
            });
        } else if (savedList.headerText !== "") {
            let headerPayload: any = {
                type: 'header',
                text: savedList.headerText,
                format: 'text'
            }
            if (savedList.headerVariables && savedList.headerVariables.length > 0) {
                headerPayload = {
                    ...headerPayload, example: {
                        "header_text": savedList.headerVariables.map((itm: any) => itm.value)

                    }
                }

            }
            componentsData.push(headerPayload)
        }
        let body: any = {
            type: 'body',
            text: htmlToText(savedList.body),
        }
        if (savedList.body.length > 0 && savedList.bodyVariables.length > 0) {
            body = {
                ...body, example: {
                    "body_text": [
                        savedList.bodyVariables.map((itm: any) => itm.field === 'TEXT' && itm.value)
                    ]
                },
            }

        }
        componentsData.push(body)

        savedList.buttonEnabled === true && savedList.buttons.length > 0 &&
            componentsData.push({
                type: 'buttons',
                buttons: savedList.buttons.map((itm: any) => {

                    if (itm.action_type === 'callNumber') {
                        return { type: 'phone_number', text: itm.text, phone_number: itm.phoneCode + itm.phoneNumber }
                    }
                    if (itm.action_type === 'link') {
                        return { type: 'url', text: itm.text, url: itm.url }
                    }
                    if (itm.buttonType === 'QUICK_REPLY') {
                        return { type: itm.buttonType, text: itm.text }
                    }
                })
            })
        if (savedList.buttonEnabled === true && savedList.buttons.length > 0 && savedList.buttons.find((o: any) => o.action_type === 'marketingOptOut' && o.buttonType === "QUICK_REPLY")) {
            componentsData.push({
                type: 'footer',
                text: savedList.buttons.find((o: any) => o.action_type === 'marketingOptOut' && o.buttonType === "QUICK_REPLY").footerText
            })
        }



        console.log(JSON.stringify(componentsData, null, 2), "componentsData");
        // Define the WhatsApp Business API endpoint
        const apiURL = 'https://graph.facebook.com/v17.0/104160086072686/message_templates';

        // Define the payload for sending a WhatsApp template message
        const payload = {
            "name": savedList.name,
            "category": savedList.category ?? 'MARKETING', //MARKETING, UTILITY
            "allow_category_change": true,
            "language": savedList.language,
            components: componentsData
        }

        return new Promise((resolve, reject) => {
            axios.post(apiURL, payload, {
                headers: {
                    Authorization: `Bearer ${accessToken}`, // Bearer token authorization
                    'Content-Type': 'application/json',
                },
            })
                .then((response) => {
                    resolve(response.data)
                    console.log('WhatsApp Template Submitted successfully:', response.data);
                })
                .catch((error) => {
                    reject(error.response.data);
                    console.error('Error sending message:', error.response ? error.response.data : error.message);
                });
        });
    } catch (e) {
        console.log(e)
    }

}

const updateTemplateToFB = (req: any, res: any, savedList: any) => {
    try {

        // Set the access token for your WhatsApp Business API
        const accessToken = process.env.AUTHORIZATION_TOKEN;


        let componentsData = []
        // need to handle image upload to the meta first using session then upload file.

        savedList.imageMediaCode !== "" &&
            componentsData.push({
                "type": "HEADER",
                "format": "IMAGE",
                "example": {
                    "header_handle": [
                        savedList.imageMediaCode
                    ]
                }
            });
        if (savedList.headerText) {
            let headerPayload: any = {
                type: 'header',
                text: htmlToText(savedList.headerText),
                format: 'text'
            }
            if (savedList.headerVariables.length > 0) {
                headerPayload = {
                    ...headerPayload, example: {
                        "header_text": savedList.headerVariables.map((itm: any) => itm.value)

                    }
                }

            }
            componentsData.push(headerPayload)
        }
        let body: any = {
            type: 'body',
            text: htmlToText(savedList.body),
        }
        if (savedList.body.length > 0 && savedList.bodyVariables.length > 0) {
            body = {
                ...body, example: {
                    "body_text": [
                        savedList.bodyVariables.map((itm: any) => itm.field === 'TEXT' && itm.value)
                    ]
                }
            }

        }
        componentsData.push(body)

        savedList.buttonEnabled === true && savedList.buttons.length > 0 &&
            componentsData.push({
                type: 'buttons',
                buttons: savedList.buttons.map((itm: any) => {

                    if (itm.action_type === 'callNumber') {
                        return { type: 'phone_number', text: itm.text, phone_number: itm.phoneCode + itm.phoneNumber }
                    }
                    if (itm.action_type === 'link') {
                        return { type: 'url', text: itm.text, url: itm.url }
                    }
                    if (itm.buttonType === 'QUICK_REPLY') {
                        return { type: itm.buttonType, text: itm.text }
                    }
                })
            })
        if (savedList.buttonEnabled === true && savedList.buttons.length > 0 && savedList.buttons.find((o: any) => o.action_type === 'marketingOptOut' && o.buttonType === "QUICK_REPLY")) {
            componentsData.push({
                type: 'footer',
                text: savedList.buttons.find((o: any) => o.action_type === 'marketingOptOut' && o.buttonType === "QUICK_REPLY").footerText
            })
        }

        console.log(JSON.stringify(componentsData, null, 2), "componentsData update");
        console.log(JSON.stringify(savedList, null, 2), "componentsData update2", htmlToText(savedList.body));

        // Define the WhatsApp Business API endpoint
        const apiURL = 'https://graph.facebook.com/v17.0/' + savedList.templateId;

        // Define the payload for sending a WhatsApp template message
        const payload = {
            "category": savedList.category ?? 'MARKETING', //MARKETING, UTILITY
            components: componentsData
        }

        return new Promise((resolve, reject) => {
            axios.post(apiURL, payload, {
                headers: {
                    Authorization: `Bearer ${accessToken}`, // Bearer token authorization
                    'Content-Type': 'application/json',
                },
            })
                .then((response) => {
                    resolve(response.data)
                    console.log('WhatsApp Template Submitted successfully:', response.data);
                })
                .catch((error) => {
                    reject(error.response.data);
                    console.error('Error sending message:', error.response ? error.response.data : error.message);
                    //throw error;
                });
        });
    } catch (e) {
        console.log(e)
    }

}

const deleteTemplateFromFB = (req: any, res: any, savedList: any) => {
    try {

        // Set the access token for your WhatsApp Business API
        const accessToken = process.env.AUTHORIZATION_TOKEN;

        // Define the WhatsApp Business API endpoint
        const apiURL = 'https://graph.facebook.com/v17.0/104160086072686/message_templates?hsm_id=' + savedList.templateId + '&name=' + savedList.name;



        console.log(apiURL, "apiURL")
        return new Promise((resolve, reject) => {
            axios.delete(apiURL, {
                headers: {
                    Authorization: `Bearer ${accessToken}`, // Bearer token authorization
                    'Content-Type': 'application/json',
                },
            })
                .then((response) => {
                    resolve(response.data)
                    console.log('WhatsApp Template Deleted successfully:', response.data);
                })
                .catch((error) => {
                    reject(error.response.data);
                    console.error('Error sending message:', error.response ? error.response.data : error.message);
                });
        });
    } catch (e) {
        console.log(e)
    }

}

export { sendWhatsappMsg, getMessageTemplates, createTemplate, fetchTemplateStatus, updateTemplateToFB, deleteTemplateFromFB }