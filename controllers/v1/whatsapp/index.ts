import axios from "axios";
import { Response, Request } from "express";
import { IWTemplate } from "../../../types/WTemplate";
import template from "../../../models/template";
const express = require("express");
const app = express();
const { AUTHORIZATION_TOKEN, WHATSAPP_VERSION, WHATSAPP_PHONE_VERSION } = process.env;
import { htmlToText } from "html-to-text";
import { uploadImageToFB } from "../wtemplate";
import WhatsappMessage from "../../../models/WhatsappMessage";
import { Timestamp } from "mongodb";
import { IWhatsappMessage } from "../../../types/whatsappMessage";
import path from "path";
require("dotenv").config();
const { Upload } = require("@aws-sdk/lib-storage");
const { S3Client } = require("@aws-sdk/client-s3");

const fs = require("fs");
const accessToken = process.env.AUTHORIZATION_TOKEN;

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    // accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    // secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,

    accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Use your own AWS access key
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // Use your own AWS secret key
    // region: process.env.AWS_REGION  // Your bucket's region
  },
});

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
    res.status(500).json({ success: false, error: "Failed to send WhatsApp notification" });
  }
};

const getMessageTemplates = async (req: any, res: any) => {
  // console.log("Getting Message Templates");
  try {
    let url = `https://graph.facebook.com/v17.0/104160086072686/message_templates?fields=name,status,language,components&limit=1000`;
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + process.env.AUTHORIZATION_TOKEN,
      },
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
};

const fetchTemplateStatus = async (req: any, res: any) => {
  try {
    let url = `https://graph.facebook.com/v17.0/104160086072686/message_templates?fields=name,status,language,components&limit=1000`;
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + process.env.AUTHORIZATION_TOKEN,
      },
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
      if (updatedList === null) {
        let obj: any = {};
        let footerText = "";
        obj.name = element.name;
        obj.status = element.status;
        obj.language = element.language;
        obj.body = textToHtml(element.components.filter((itm: any) => itm.type === "BODY")[0].text || "");
        obj.headerImageUrl =
          element.components.filter((itm: any) => itm.type === "HEADER" && itm.format === "IMAGE")[0]?.example?.header_handle || "";
        obj.headerEnabled = true;
        obj.headerText = textToHtml(element.components.filter((itm: any) => itm.type === "HEADER" && itm.format === "TEXT")[0]?.text || "");
        obj.templateId = element.id;
        obj.bodyVariables = [];
        obj.headerVariables = [];
        if (element.components.filter((itm: any) => itm.type === "BODY")[0]?.example) {
          let body_var = obj.bodyVariables;
          element.components
            .filter((itm: any) => itm.type === "BODY")[0]
            ?.example?.body_text.map((itm: any, index: any) => {
              body_var.push({
                label: index + 1,
                value: itm[0],
                field: "first_name",
              });
              obj.bodyVariables = body_var;
            });
        }
        if (element.components.filter((itm: any) => itm.type === "HEADER")[0]?.example) {
          let body_var = obj.headerVariables;
          element.components
            .filter((itm: any) => itm.type === "HEADER")[0]
            ?.example?.header_text?.map((itm: any, i: any) => {
              body_var.push({
                label: i + 1,
                value: itm,
                field: "first_name",
              });
              obj.headerVariables = body_var;
            });
        }
        obj.buttonEnabled = element.components.filter((itm: any) => itm.type === "BUTTONS") ? true : false;
        obj.buttons = [];
        if (element.components.filter((itm: any) => itm.type === "FOOTER")[0]) {
          if (element.components.filter((itm: any) => itm.type === "FOOTER")[0].type === "FOOTER") {
            footerText = element.components.filter((itm: any) => itm.type === "FOOTER")[0].text;
          }
        }

        if (element.components.filter((itm: any) => itm.type === "BUTTONS")[0]?.buttons) {
          let buttonVar = obj.buttons;
          element.components
            .filter((itm: any) => itm.type === "BUTTONS")[0]
            ?.buttons?.map((itm: any, i: any) => {
              if (itm.type === "PHONE_NUMBER") {
                buttonVar.push({
                  action_type: "callNumber",
                  buttonType: "callToAction",
                  type: "text",
                  text: itm.text,
                  phoneNumber: itm.phone_number,
                  phoneCode: "",
                });
                obj.buttons = buttonVar;
              }
              if (itm.type == "URL") {
                buttonVar.push({
                  action_type: "link",
                  buttonType: "callToAction",
                  text: itm.text,
                  type: itm.type,
                  url: itm.url,
                });
                obj.buttons = buttonVar;
              }

              if (itm.type === "QUICK_REPLY") {
                if (footerText) {
                  buttonVar.push({
                    action_type: "marketingOptOut",
                    buttonType: "QUICK_REPLY",
                    footerText: footerText,
                    text: itm.text,
                    type: "text",
                  });
                  obj.buttons = buttonVar;
                } else {
                  buttonVar.push({
                    action_type: "custom",
                    buttonType: "QUICK_REPLY",
                    text: itm.text,
                  });
                  obj.buttons = buttonVar;
                }
              }
            });
        }
        element.components.filter((itm: any) => itm.type === "BUTTONS") ? true : false;

        // console.log(obj, "obj")
        responseData.push(obj);
        if (obj.name === "final_test") {
          let newTemplate: IWTemplate = new template(obj);

          let savedList: IWTemplate = await newTemplate.save();
        }
      }
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
      data: response.data,
      count: response.data.data.length,
      data2: responseData,
    });
  } catch (error) {
    console.error("Failed to Update Whatsapp Templates Status:", error);
    res.status(500).json({ success: false, msg: "Failed to send WhatsApp notification", error: error });
  }
};

const createTemplate = async (req: any, res: any, savedList: any) => {
  try {
    let bodyText = savedList.body
      .replace(/<strong>/g, "*")
      .replace(/<\/strong>/g, "*")
      .replace(/<em>/g, "_")
      .replace(/<\/em>/g, "_")
      .replace(/<del>/g, "~")
      .replace(/<\/del>/g, "~")
      .replace(/<br>/g, "");
    // .replace(/<\/p>/g, '</p>\n');

    // Set the access token for your WhatsApp Business API

    // let imageURL: any = await uploadImageToFB(req, res);
    let componentsData = [];
    // console.log(savedList, "savedList")
    if (savedList?.imageMediaCode && savedList?.imageMediaCode !== "") {
      componentsData.push({
        type: "HEADER",
        format: "IMAGE",
        example: {
          header_handle: [savedList.imageMediaCode],
        },
      });
    } else if (savedList.headerText !== "") {
      let headerPayload: any = {
        type: "header",
        text: savedList.headerText,
        format: "text",
      };
      if (savedList.headerVariables && savedList.headerVariables.length > 0) {
        headerPayload = {
          ...headerPayload,
          example: {
            header_text: savedList.headerVariables.map((itm: any) => itm.value),
          },
        };
      }
      componentsData.push(headerPayload);
    }
    let body: any = {
      type: "body",
      text: htmlToText(bodyText, {
        selectors: [
          {
            selector: "p",
            format: "block", // Treat <p> as inline, to avoid extra newlines
          },
        ],
        // preserveNewlines: true,  // Optionally disable extra newlines if needed
        wordwrap: false,
      }),
    };
    if (savedList.body.length > 0 && savedList.bodyVariables.length > 0) {
      body = {
        ...body,
        example: {
          body_text: [savedList.bodyVariables.map((itm: any) => itm.value)],
        },
      };
    }
    componentsData.push(body);

    // let videoBody = {
    //     "type": "video",
    //     "video": {
    //         "link": "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    //     }
    // }
    // componentsData.push(videoBody)
    savedList.buttonEnabled === true &&
      savedList.buttons.length > 0 &&
      componentsData.push({
        type: "buttons",
        buttons: savedList.buttons.map((itm: any) => {
          if (itm.action_type === "callNumber") {
            return { type: "phone_number", text: itm.text, phone_number: itm.phoneCode + itm.phoneNumber };
          }
          if (itm.action_type === "link") {
            return { type: "url", text: itm.text, url: itm.url };
          }
          if (itm.buttonType === "QUICK_REPLY") {
            return { type: itm.buttonType, text: itm.text };
          }
        }),
      });
    if (savedList.footerText) {
      componentsData.push({
        type: "footer",
        text: savedList.footerText,
      });
    }

    console.log(JSON.stringify(componentsData, null, 2), "componentsData");
    // Define the WhatsApp Business API endpoint
    const apiURL = "https://graph.facebook.com/v17.0/104160086072686/message_templates";

    // Define the payload for sending a WhatsApp template message
    const payload = {
      name: savedList.name,
      category: savedList.category ?? "MARKETING", //MARKETING, UTILITY
      allow_category_change: true,
      language: savedList.language,
      components: componentsData,
    };

    return new Promise((resolve, reject) => {
      axios
        .post(apiURL, payload, {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Bearer token authorization
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          resolve(response.data);
          console.log("WhatsApp Template Submitted successfully:", response.data);
        })
        .catch((error) => {
          reject(error.response.data);
          console.error("Error sending message:", error.response ? error.response.data : error.message);
        });
    });
  } catch (e) {
    console.log(e);
  }
};

const updateTemplateToFB = (req: any, res: any, savedList: any) => {
  try {
    let bodyText = savedList.body
      .replace(/<strong>/g, "*")
      .replace(/<\/strong>/g, "*")
      .replace(/<em>/g, "_")
      .replace(/<\/em>/g, "_")
      .replace(/<br>/g, "")
      .replace(/<del>/g, "~")
      .replace(/<\/del>/g, "~");
    // .replace(/<\/p>/g, '</p>\n');

    // Set the access token for your WhatsApp Business API
    const accessToken = process.env.AUTHORIZATION_TOKEN;

    let componentsData = [];
    // need to handle image upload to the meta first using session then upload file.

    if (savedList?.imageMediaCode && savedList?.imageMediaCode !== null && savedList?.imageMediaCode !== "")
      componentsData.push({
        type: "HEADER",
        format: "IMAGE",
        example: {
          header_handle: [savedList.imageMediaCode],
        },
      });
    if (savedList.headerText) {
      let headerPayload: any = {
        type: "header",
        text: htmlToText(savedList.headerText),
        format: "text",
      };
      if (savedList.headerVariables.length > 0) {
        headerPayload = {
          ...headerPayload,
          example: {
            header_text: savedList.headerVariables.map((itm: any) => itm.value),
          },
        };
      }
      componentsData.push(headerPayload);
    }
    let body: any = {
      type: "body",
      text: htmlToText(bodyText, {
        selectors: [
          {
            selector: "p",
            format: "block", // Treat <p> as inline, to avoid extra newlines
          },
        ],
        // preserveNewlines: true,  // Optionally disable extra newlines if needed
        wordwrap: false,
      }),
      // .replace(/(\n{2})+/g, '\n')
    };
    if (savedList.body.length > 0 && savedList.bodyVariables.length > 0) {
      body = {
        ...body,
        example: {
          body_text: [savedList.bodyVariables.map((itm: any) => itm.value)],
        },
      };
    }
    componentsData.push(body);

    savedList.buttonEnabled === true &&
      savedList.buttons.length > 0 &&
      componentsData.push({
        type: "buttons",
        buttons: savedList.buttons.map((itm: any) => {
          if (itm.action_type === "callNumber") {
            return { type: "phone_number", text: itm.text, phone_number: itm.phoneCode + itm.phoneNumber };
          }
          if (itm.action_type === "link") {
            return { type: "url", text: itm.text, url: itm.url };
          }
          if (itm.buttonType === "QUICK_REPLY") {
            return { type: itm.buttonType, text: itm.text };
          }
        }),
      });
    if (savedList.footerText) {
      componentsData.push({
        type: "footer",
        text: savedList.footerText,
      });
    }

    // console.log(JSON.stringify(componentsData, null, 2), "componentsData update");
    console.log(JSON.stringify(componentsData, null, 2), "componentsData update2");

    // Define the WhatsApp Business API endpoint
    const apiURL = "https://graph.facebook.com/v17.0/" + savedList.templateId;
    // Define the payload for sending a WhatsApp template message
    const payload = {
      category: savedList.category ?? "MARKETING", //MARKETING, UTILITY
      components: componentsData,
    };

    return new Promise((resolve, reject) => {
      axios
        .post(apiURL, payload, {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Bearer token authorization
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          resolve(response.data);
          console.log("WhatsApp Template Submitted successfully:", response.data);
        })
        .catch((error) => {
          reject(error.response.data);
          console.error("Error sending message:", error.response ? error.response.data : error.message);
          // throw error;
        });
    });
  } catch (e) {
    console.log(e, "error in update template");
  }
};

const deleteTemplateFromFB = (req: any, res: any, savedList: any) => {
  try {
    // Set the access token for your WhatsApp Business API
    const accessToken = process.env.AUTHORIZATION_TOKEN;

    // Define the WhatsApp Business API endpoint
    const apiURL =
      "https://graph.facebook.com/v17.0/104160086072686/message_templates?hsm_id=" + savedList.templateId + "&name=" + savedList.name;

    return new Promise((resolve, reject) => {
      axios
        .delete(apiURL, {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Bearer token authorization
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          resolve(response.data);
          console.log("WhatsApp Template Deleted successfully:", response.data);
        })
        .catch((error) => {
          reject(error.response.data);
          console.error("Error sending message:", error.response ? error.response.data : error.message);
        });
    });
  } catch (e) {
    console.log(e);
  }
};

const textToHtml = (text: any) => {
  // Replace newlines with <br> for line breaks
  const html = text.replace(/\n/g, "<br>").replace(/\*(.*?)\*/g, "<strong>$1</strong>");
  return `<p>${html}</p>`;
};

const sendWhatsappMessage = async (req: any, res: any) => {
  const { phone, message } = req.body;
  const PHONE_NUMBER_ID = 105942389228737;
  try {
    const response = await axios.post(
      `${process.env.WHATSAPP_API_URL}${process.env.WHATSAPP_VERSION}/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phone,
        type: "text",
        text: {
          body: message,
        },
      },
      {
        headers: {
          Authorization: "Bearer " + process.env.AUTHORIZATION_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    const customDate = new Date(); // Replace with your custom date
    const timestamp = Math.floor(customDate.getTime() / 1000);
    const existingMessage = await WhatsappMessage.findOne({ timestamp: timestamp });
    console.log(existingMessage,"existingMessage")
    if (!existingMessage) {
      const newMessage: IWhatsappMessage = new WhatsappMessage({
        phone_number: phone,
        name: "SIZ",
        message: message,
        timestamp: timestamp,
      });
      const savedMessage: IWhatsappMessage = await newMessage.save();
    }

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error sending message:", error.response.data);
    res.status(500).json({ error: "Error sending message" });
  }
};

const downloadImageFromFB = async (mediaId: any) => {
  try {
    const mediaUrlResponse = await axios.get(`${process.env.WHATSAPP_API_URL}${process.env.WHATSAPP_VERSION}/${mediaId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`, // Bearer token authorization
      },
    });

    const mediaUrl = mediaUrlResponse.data.url;
    // Download the actual image
    const imageResponse = await axios.get(mediaUrl, {
      responseType: "stream",
      headers: {
        Authorization: `Bearer ${accessToken}`, // Include the token again if required
      },
    });

    const fileName = `${Date.now()}_image.jpg`;
    // Step 3: Upload the image to S3
    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME, // S3 bucket name
      Key: fileName, // File name in S3
      Body: imageResponse.data, // File content
      ContentType: "image/jpeg",
    };

    const upload = new Upload({
      client: s3,
      params: uploadParams,
    });

    await upload.done();
    const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    // await deleteFileFromUploads(fileName)
    console.log(fileUrl,"fileUrl")
    return fileUrl;
  } catch (error) {
    console.error("Error downloading image :", error.response?.data || error.message);
  }
};

const deleteFileFromUploads = (fileName: any) => {
  // Construct the full file path to the uploads folder
  const filePath = path.join(__dirname, "uploads", fileName);

  // Check if the file exists and then delete it
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Error deleting the file:", err);
      return;
    }
    console.log(`File ${fileName} deleted successfully.`);
  });
};

// Example usage: delete a file named 'image.jpg'
deleteFileFromUploads("image.jpg");

export {
  sendWhatsappMsg,
  getMessageTemplates,
  createTemplate,
  fetchTemplateStatus,
  updateTemplateToFB,
  deleteTemplateFromFB,
  sendWhatsappMessage,
  downloadImageFromFB,
};
