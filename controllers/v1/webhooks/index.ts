import axios from 'axios';
import { IOrder } from '../../../types/order';
import Order from '../../../models/order';
import { IProduct } from '../../../types/product';
import product from '../../../models/product';
import lender from '../../../models/lender';
import WhatsappMessage from '../../../models/WhatsappMessage';
import { IOrderStatus } from '../../../types/orderstatus';
import { IWhatsappMessage } from '../../../types/whatsappMessage';
import orderstatus from '../../../models/orderstatus';
import user from '../../../models/user';
import markettingusers from '../../../models/markettingusers';
import { basicLogger } from '../../../middleware/logger';
const { AUTHORIZATION_TOKEN, WHATSAPP_VERSION, WHATSAPP_PHONE_VERSION } = process.env;
let options = { new: true };

// import { IProduct } from '../../../types/product';
// import Product from '../../../models/product';


const verifyTokenWhatsapp = async (req: any, res: any) => {
  /**
   * UPDATE YOUR VERIFY TOKEN
   *This will be the Verify Token value when you set up webhook
  **/
  const verify_token = "qwaszxcderfvbgthSDD";

  // Parse params from the webhook verification request
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Check if a token and mode were sent
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === "subscribe" && token === verify_token) {
      // Respond with 200 OK and challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }

}

const listenRepliesFromWebhook = async (req: any, res: any) => {
  try {
    // Extract relevant data from the request body
    console.log(req.body);


    // [{"id":"104160086072686","changes":[{"value":{"messaging_product":"whatsapp","metadata":{"display_phone_number":"971543909650","phone_number_id":"105942389228737"},"contacts":[{"profile":{"name":"Yuvraj"},"wa_id":"971561114006"}],"messages":[{"from":"971561114006","id":"wamid.HBgMOTcxNTYxMTE0MDA2FQIAEhgUM0FBRUVBNDhCMTdCQkZGNENGNUIA","timestamp":"1731401647","text":{"body":"Hiiifkkd"},"type":"text"}]},"field":"messages"}]}]

    const { entry } = req.body;
    const { from, name, text } = entry[0].changes[0].value.messages[0];
    console.log("ENTRYYYYY: ", JSON.stringify(entry));
    basicLogger.info({
      controller: 'listenRepliesFromWebhook',
      method: 'GET',
      terror: 'listenRepliesFromWebhook method',
      body: entry
    });
    var sender_name = entry[0].changes[0].value.contacts[0].profile.name;
    var sender_phone = entry[0].changes[0].value.contacts[0].wa_id;
    var type = entry[0].changes[0].value.messages[0].type;
    var timestamp = entry[0].changes[0].value.messages[0].timestamp;
    var message = "";
    if (type == "button") {
      message = entry[0].changes[0].value.messages[0].button.text;
    } else if (type == "text") {
      message = entry[0].changes[0].value.messages[0].text.body;
    }
    console.log(message)
    // Insert data into RDS table
    await insertMessage(sender_phone, sender_name, message, timestamp,req.body);

    // Respond with success
    res.status(200).json({ message: 'Data inserted successfully' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function insertMessage(from:any, name:any, text:any, timestamp:any,body:any) {
  try {
    const existingMessage = await WhatsappMessage.find({ timestamp: timestamp,phone_number:from });
    if (existingMessage.length === 0) {
      const newMessage: IWhatsappMessage = new WhatsappMessage({
        phone_number: from,
        name: name,
        message: text,
        timestamp: timestamp,
        log:body
      });
      const savedMessage: IWhatsappMessage = await newMessage.save();
    }
    basicLogger.info({
      controller: 'insertMessage',
      method: 'GET',
      terror: 'insertMessage method',
      body: { from, name, text, timestamp }
    });
      if (text && text.toLowerCase().includes('stop')) {
        const phoneNumber = from;
        const existingUser = await markettingusers.findOne({ phone_number: phoneNumber });
        
        if (existingUser) {
          existingUser.whatsapp_messaging = false;
          const updatedUser = await markettingusers.findByIdAndUpdate({ _id: existingUser._id }, existingUser, options);
        }
      }
  } catch (error) {
    console.error('Error inserting data into RDS:', error);
    throw error; // Rethrow the error to handle it in the caller function
  }
}

async function convertUnixEpochToMySQLDatetime(epoch: any) {
  return new Date(epoch * 1000).toISOString().slice(0, 19).replace('T', ' ');
}


const fetchShopifyOrderUsingWebhook = async (req: any, res: any) => {
  try {
    const { body } = req;
    // console.log(body);

    basicLogger.info({
      controller: 'fetchShopifyOrderUsingWebhook',
      method: 'GET',
      terror: 'Saved Order in fetchShopifyOrderUsingWebhook method',
      body: body
    });

    await saveOrderInDb(body);
    console.log("Order saved in DB");

    //sendOrderPlacementMessageToRenter("971561114006","order_placement_with_delivery",image_url,renter_name,item_name,duration,start_date,"13 July 2023",order_id);
    res.status(200).json({
      success: true,
      message: "Shopify products fetched successfully.",
      data: body
    });

  } catch (error) {
    // Handle errors and send an error response back to the client
    console.error("Failed to fetch shopify products:", error);
    basicLogger.error({
      controller: 'fetchShopifyOrderUsingWebhook',
      method: 'GET',
      terror: 'Error in fetchShopifyOrderUsingWebhook method',
      body: error
    });
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch shopify products" });
  }
}


//const sendOrderPlacementMessageToRenter =  async (toNumber : any,templateName: any,headerImageUrl: any,clientName: any,itemName: any,duration: any,startDate: any,endDate: any,orderId: any) => {
const sendOrderPlacementMessageToRenter = async (body: any) => {
  console.log("sending message to renter")
  console.log(body);
  let to_Number = (body.billing_address?.phone.length > 0) ? body.billing_address.phone : "Phone Not Found";;
  let clientName = (body.billing_address?.first_name.length > 0) ? body.billing_address.first_name : "Client Name Not Found";
  let headerImageUrl = "https://whatsappimagessiz.s3.eu-north-1.amazonaws.com/siz-logo.png"
  let line_items_array = body.line_items;
  let arrayLength = line_items_array?.length;
  let itemName = "";
  let duration = "";
  let dateString = "";
  let backupPieceName = "";
  console.log(arrayLength);
  if (arrayLength > 1) {
    itemName = line_items_array[0]?.name.split("-")[0] + " & " + (arrayLength - 1) + "Others";
    duration = (line_items_array[0]?.name.split("/").length > 0 && line_items_array[0].name.split("/").length == 4) ? line_items_array[0].name.split("/")[3] : line_items_array[0].name.split("/")[2];
    if (line_items_array[0]?.properties?.length > 0) {
      let key = line_items_array[0].properties[0].name;
      if (key == "Date") {
        dateString = line_items_array[0].properties[0].value;
      }
    } else {
      dateString = "Not Found";
    }
  } else if (arrayLength == 1) {
    itemName = line_items_array[0]?.name.split("-")[0];
    duration = (line_items_array[0]?.name.split("/").length > 0 && line_items_array[0].name.split("/").length == 4) ? line_items_array[0].name.split("/")[3] : line_items_array[0].name.split("/")[2];
    if (line_items_array[0]?.properties?.length > 0) {
      let key = line_items_array[0].properties[0].name;
      if (key == "Date") {
        dateString = line_items_array[0].properties[0].value;
      }
    } else {
      dateString = "Not Found";
    }
  } else {
    itemName = "Not Found";
    duration = "Not Found";
  }
  let startDate = (dateString?.length > 0) ? dateString?.split(" to ")[0] : "Not Found";
  let endDate = (dateString?.length > 0) ? dateString?.split(" to ")[1] : "Not Found";
  console.log(startDate)
  let orderId = body.id
  let note = body.note;
  const backup_product_handle = note?.split('/').pop();
  console.log("Last Part " + backup_product_handle)
  const findBackupProduct: any | null = await product.findOne({
    "product_details.handle": backup_product_handle
  });

  console.log(findBackupProduct)
  let backupProduct = findBackupProduct ? findBackupProduct.product_details.title : "No Backup Product Selected";
  if (clientName == "" || clientName == null) return;
  if (itemName == "" || itemName == null) return;
  if (duration == "" || duration == null) duration = "Not Selected";
  if (startDate == "" || startDate == null) startDate = "Not Selected";
  if (endDate == "" || endDate == null) endDate = "Not Selected";
  if (backupProduct == "" || backupProduct == null || backupProduct == "No Backup Product Selected") backupProduct = "Not Selected";

  duration = duration.trim();
  itemName = itemName.trim();
  clientName = clientName.trim();
  backupProduct = backupProduct.trim();
  setTimeout(() => {
    let payload = {
      messaging_product: 'whatsapp',
      to: to_Number,
      type: 'template',
      template: {
        name: "order_placement_with_delivery",
        language: {
          code: 'en_US',
          policy: 'deterministic'
        },
        components: [
          {
            "type": "header",
            "parameters": [
              { "type": "image", "image": { "link": headerImageUrl, } }
            ]
          },
          {
            type: 'body',
            parameters: [
              { type: 'text', text: clientName },
              { type: 'text', text: itemName },
              { type: 'text', text: duration },
              { type: 'text', text: startDate },
              { type: 'text', text: endDate },
              { type: 'text', text: backupProduct },

            ]
          },
          {
            type: 'button',
            sub_type: 'url',
            index: '0',
            parameters: [
              { type: 'text', text: orderId }
            ]
          }
        ]
      }
    };
    console.log(orderId, "order id");
    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://graph.facebook.com/v17.0/105942389228737/messages',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': "Bearer " + process.env.AUTHORIZATION_TOKEN,
      },
      data: payload
    };
    if (itemName != "Not Found") {
      axios.request(config)
        .then((response) => {
          console.log(JSON.stringify(response.data));
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      console.log("No item found to send whatsapp notification")
    }
  }, 5000)


}

const sendWhatsappMessageToRenter = async (body: any) => {
  //const renterPhoneNumber = body.phone ;
  const axios = require('axios');
  let data = '{\n    "messaging_product": "whatsapp",\n    "to": "+971588086958",\n    "type": "template",\n    "template": {\n       "name": "order_placement_with_delivery",\n       "language": {\n           "code": "en_US",\n           "policy": "deterministic"\n       },\n       "components": [\n          {\n           "type": "body",\n           "parameters": [\n               {\n                   "type": "text",\n                   "text": "Annabel"\n               },\n                {\n                   "type": "text",\n                   "text": "Freya Dress"\n               }, {\n                   "type": "text",\n                   "text": "07 July 2023"\n               } ]\n         },\n         {\n          "type": "button",\n          "sub_type": "url",\n           "index": "0",\n          "parameters": [\n            {\n              "type": "text",\n              "text": "23493282245"\n            }\n          ]\n        }\n\n       ]\n    }\n}';

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://graph.facebook.com/v17.0/105942389228737/messages',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': "Bearer " + process.env.AUTHORIZATION_TOKEN,
    },
    data: data
  };

  axios.request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
    })
    .catch((error) => {
      console.log(error);
    });

}

const saveOrderInDb = async (body: any) => {

  let lenderObj = await findLenderDetails(body);
  let line_items = await populateLineItems(body.line_items);
  let renter_phone_number = (body.billing_address?.phone.length > 0) ? body.billing_address.phone : "Phone Not Found";;
  let clientName = (body.billing_address?.first_name.length > 0) ? body.billing_address.first_name : "Client Name Not Found";
  let line_items_array = body.line_items;
  let arrayLength = line_items_array?.length;
  let itemName = "";
  let duration = "";
  let dateString = "";
  let backupPieceName = "";
  let lender_name = "";
  let lender_address = "";
  let lender_phone_call = "";
  let lender_phone_whatsapp = "";
  console.log(arrayLength);
  if (arrayLength > 1) {
    itemName = line_items_array[0]?.name.split("-")[0] + " & " + (arrayLength - 1) + " More";
    duration = (line_items_array[0]?.name.split("/").length > 0 && line_items_array[0].name.split("/").length == 4) ? line_items_array[0].name.split("/")[3] : line_items_array[0].name.split("/")[2];
    lender_name = line_items[0].lender.name + " & " + " More";
    lender_address = line_items[0].lender.address + " & " + " More";
    if (line_items_array[0]?.properties?.length > 0) {
      let key = line_items_array[0].properties[0].name;
      if (key == "Date") {
        dateString = line_items_array[0].properties[0].value;
      }
    } else {
      dateString = "Not Found";
    }
  } else if (arrayLength == 1) {
    itemName = line_items_array[0]?.name.split("-")[0];
    duration = (line_items_array[0]?.name.split("/").length > 0 && line_items_array[0].name.split("/").length == 4) ? line_items_array[0].name.split("/")[3] : line_items_array[0].name.split("/")[2];
    lender_name = line_items[0].lender.name;
    lender_address = line_items[0].lender.address;
    if (line_items_array[0]?.properties?.length > 0) {
      let key = line_items_array[0].properties[0].name;
      if (key == "Date") {
        dateString = line_items_array[0].properties[0].value;
      }
    } else {
      dateString = "Not Found";
    }
  } else {
    itemName = "Not Found";
    duration = "Not Found";
  }
  let startDate = (dateString?.length > 0) ? dateString?.split(" to ")[0] : "Not Found";
  let endDate = (dateString?.length > 0) ? dateString?.split(" to ")[1] : "Not Found";
  console.log(startDate)
  console.log("endDate in renter message: " + endDate)
  let orderId = body.id
  let note = body.note;
  const backup_product_handle = note?.split('/').pop();
  console.log("Last Part " + backup_product_handle)
  const findBackupProduct: any | null = await product.findOne({
    "product_details.handle": backup_product_handle
  });

  console.log(findBackupProduct)
  let backupProduct = findBackupProduct ? findBackupProduct.product_details.title : "No Backup Product Selected";
  if (clientName == "" || clientName == null) return;
  if (itemName == "" || itemName == null) return;
  if (duration == "" || duration == null) duration = "Not Selected";
  if (startDate == "" || startDate == null) startDate = null;
  if (endDate == "" || endDate == null) endDate = null;
  if (lender_name == "" || lender_name == null) lender_name = " Not Found";
  if (lender_address == "" || lender_address == null) lender_address = " Not Found";
  if (backupProduct == "" || backupProduct == null || backupProduct == "No Backup Product Selected") backupProduct = "Not Selected";



  const newOrder: IOrder = new Order({
    order_id: body.id,
    order_date: body.created_at,
    email: body.contact_email,
    phone_number: body.phone,
    order_details: body,
    order_number: body.order_number,
    total_price: body.total_price,
    renter_phone_number: renter_phone_number,
    rental_start_date: startDate,
    rental_end_date: endDate,
    renter_name: clientName,
    rental_duration: duration,
    rental_piece_name: itemName,
    backup_piece: backupProduct,
    order_items: line_items,
    order_note: body.note,
    lender_name: lender_name,
    lender_address: lender_address,
    lender_phone_call: lenderObj?.phone_number_call,
    lender_phone_whatsapp: lenderObj?.phone_number_whatsapp,

  });
  const savedOrder: IOrder = await newOrder.save();
  const newOrderStatus: IOrderStatus = new orderstatus({
    orderID: body.id,
    product_delivery_date: null,
    product_pickup_date: null,
    notes: null,
    product_delivery_timeslot: null,
    product_pickup_timeslot: null,
    product_pickup_date_from_renter: null,
    product_pickup_timeslot_from_renter: null,
    return_picked_up: null,
  });

  const savedOrderStatus: IOrderStatus = await newOrderStatus.save();
  await sendOrderPlacementMessageToRenter(body);
  await (lender) ? sendOrderReceivedMessageToLender(newOrder) : "No Lender Details Found";
}

const populateLineItems = async (line_items: any) => {
  for (let itm of line_items) {
    let product_id = itm.product_id;
    console.log(product_id)
    let product = await findProductFromId(product_id);
    console.log(product)
    let lenderObj = await findLenderfromProduct(product);
    console.log(lenderObj)
    itm.lender = lenderObj;
    itm.images = product.product_details.images;
  }
  return line_items;
}


const sendOrderReceivedMessageToLender = async (newOrder: any) => {
  console.log("sending message to lender")
  console.log(newOrder);
  let to_Number = (newOrder?.lender_phone_whatsapp?.length > 0) ? newOrder.lender_phone_whatsapp : "Phone Not Found";;
  let LenderName = (newOrder?.lender_name?.length > 0) ? newOrder.lender_name : "Lender Name Not Found";
  let headerImageUrl = "https://whatsappimagessiz.s3.eu-north-1.amazonaws.com/siz-logo.png"
  console.log("URL");
  let line_items_array = newOrder?.order_items;
  console.log("array captured");
  let arrayLength = line_items_array?.length;
  console.log("array length captured");
  let itemName = "";
  let duration = "";
  let dateString = "";
  let backupPieceName = "";
  console.log(arrayLength);
  if (arrayLength > 1) {
    itemName = line_items_array[0]?.name.split("-")[0] + " & " + (arrayLength - 1) + "Others";
    duration = (line_items_array[0]?.name.split("/").length > 0 && line_items_array[0].name.split("/").length == 4) ? line_items_array[0].name.split("/")[3] : line_items_array[0].name.split("/")[2];
    if (line_items_array[0]?.properties?.length > 0) {
      let key = line_items_array[0].properties[0].name;
      if (key == "Date") {
        dateString = line_items_array[0].properties[0].value;
      }
    } else {
      dateString = "Not Found";
    }
  } else if (arrayLength == 1) {
    itemName = line_items_array[0]?.name.split("-")[0];
    duration = (line_items_array[0]?.name.split("/").length > 0 && line_items_array[0].name.split("/").length == 4) ? line_items_array[0].name.split("/")[3] : line_items_array[0].name.split("/")[2];
    if (line_items_array[0]?.properties?.length > 0) {
      let key = line_items_array[0].properties[0].name;
      if (key == "Date") {
        dateString = line_items_array[0].properties[0].value;
      }
    } else {
      dateString = "Not Found";
    }
  } else {
    itemName = "Not Found";
    duration = "Not Found";
  }
  let startDate = (dateString?.length > 0) ? dateString?.split(" to ")[0] : "Not Found";
  let endDate = (dateString?.length > 0) ? dateString?.split(" to ")[1] : "Not Found";
  console.log(startDate)
  let orderId = newOrder.order_id
  let note = newOrder.order_note;
  const backup_product_handle = note?.split('/').pop();
  console.log("Last Part " + backup_product_handle)
  const findBackupProduct: any | null = await product.findOne({
    "product_details.handle": backup_product_handle
  });

  console.log(findBackupProduct)
  let backupProduct = findBackupProduct ? findBackupProduct.product_details.title : "No Backup Product Selected";

  if (LenderName == "" || LenderName == null) return;
  if (itemName == "" || itemName == null) return;
  if (duration == "" || duration == null) duration = "Not Selected";
  if (startDate == "" || startDate == null) startDate = "Not Selected";
  if (endDate == "" || endDate == null) endDate = "Not Selected";
  // if(backupProduct == "" || backupProduct == null || backupProduct == "No Backup Product Selected"  ) endDate = "Not Selected" ;

  duration = duration.trim();
  itemName = itemName.trim();
  LenderName = LenderName.trim();
  for await (const itm of newOrder.order_details.line_items) {

    let lender_name = itm.lender.name;
    let itemName = itm.title;
    let duration = (itm?.name.split("/").length > 0 && itm.name.split("/").length == 4) ? itm.name.split("/")[3] : itm.name.split("/")[2];
    let lender_number = itm.lender.phone_number_whatsapp;
    if (itm?.properties?.length > 0) {
      let key = itm.properties[0].name;
      if (key == "Date") {
        dateString = itm.properties[0].value;
      }
    } else {
      dateString = "Not Found";
    }
    let startDate = (dateString?.length > 0) ? dateString?.split(" to ")[0] : "Not Found";
    let endDate = (dateString?.length > 0) ? dateString?.split(" to ")[1] : "Not Found";
    setTimeout(() => {

      let payload = {
        messaging_product: 'whatsapp',
        to: lender_number,
        type: 'template',
        template: {
          name: "order_placement_pickup_schedule_lender",
          language: {
            code: 'en_US',
            policy: 'deterministic'
          },
          components: [
            {
              "type": "header",
              "parameters": [
                { "type": "image", "image": { "link": headerImageUrl, } }
              ]
            },
            {
              type: 'body',
              parameters: [
                { type: 'text', text: lender_name },
                { type: 'text', text: itemName },
                { type: 'text', text: duration },
                { type: 'text', text: startDate },
                { type: 'text', text: endDate },
              ]
            },
            {
              type: 'button',
              sub_type: 'url',
              index: '0',
              parameters: [
                { type: 'text', text: orderId }
              ]
            }
          ]
        }
      };
      console.log("token " + process.env.AUTHORIZATION_TOKEN);
      const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://graph.facebook.com/v17.0/105942389228737/messages',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': "Bearer " + process.env.AUTHORIZATION_TOKEN,
        },
        data: payload
      };
      if (itemName != "Not Found") {
        axios.request(config)
          .then((response) => {
            console.log(JSON.stringify(response.data));
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        console.log("No item found to send whatsapp notification")
      }
    }, 5000)

  }

}
const findLenderDetails = async (body: any) => {
  let product = await findProductFromOrder(body);
  let product_id = product?.product_id;
  let tags = product?.product_details?.tags;
  const regex = /(INFLUENCER_[A-Za-z0-9_\\s]+)/;
  const matches = tags?.toUpperCase().match(regex);
  let influencerTag = "";
  if (matches && matches.length >= 2) {
    influencerTag = matches[1];
    console.log("Influencer Tag:", influencerTag);
    const findLender: any | null = await lender.findOne({
      "shopify_id": influencerTag
    });
    return findLender;
  } else {
    console.log("Influencer Tag not found.");
    return null;
  }
}

const findLenderfromProduct = async (product: any) => {
  //  let product = await findProductFromOrder(body);
  let product_id = product?.product_id;
  let tags = product?.product_details?.tags;
  const regex = /(INFLUENCER_[A-Za-z0-9_\\s]+)/;
  const matches = tags?.toUpperCase().match(regex);
  let influencerTag = "";
  if (matches && matches.length >= 2) {
    influencerTag = matches[1];
    console.log("Influencer Tag:", influencerTag);
    const findLender: any | null = await lender.findOne({
      "shopify_id": influencerTag
    });
    return findLender;
  } else {
    console.log("Influencer Tag not found.");
    return null;
  }
}



const findProductFromOrder = async (body: any) => {
  let product_title = body.line_items[0]?.title;
  const findProduct: any | null = await product.findOne({
    "product_details.title": product_title
  });
  console.log(findProduct)
  return findProduct;

}

const findProductFromId = async (productId: any) => {
  //let product_title = body.line_items[0]?.title ;
  const findProduct: any | null = await product.findOne({
    "product_id": productId
  });
  console.log(findProduct)
  return findProduct;

}

export { fetchShopifyOrderUsingWebhook, populateLineItems, listenRepliesFromWebhook, verifyTokenWhatsapp }