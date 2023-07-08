import axios from 'axios';
import { IOrder } from '../../../types/order';
import Order from '../../../models/order';
// import { IProduct } from '../../../types/product';
// import Product from '../../../models/product';




const fetchShopifyOrderUsingWebhook = async (req: any, res: any) => {
    try {
        const { body } = req;
        console.log(body);
        saveOrderInDb(body);
        sendWhatsappMessageToRenter(body);
        res.status(200).json({
            success: true,
            message: "Shopify products fetched successfully.",
            data: body
        });

    } catch (error) {
        // Handle errors and send an error response back to the client
        console.error("Failed to fetch shopify products:", error);
        res
            .status(500)
            .json({ success: false, error: "Failed to fetch shopify products" });
    }
}


const sendWhatsappMessageToRenter = async (body: any ) => {
    //const renterPhoneNumber = body.phone ;
    const axios = require('axios');
let data = '{\n    "messaging_product": "whatsapp",\n    "to": "971561114006",\n    "type": "template",\n    "template": {\n       "name": "order_confirmed ",\n       "language": {\n           "code": "en_US",\n           "policy": "deterministic"\n       },\n       "components": [\n          {\n           "type": "body",\n           "parameters": [\n               {\n                   "type": "text",\n                   "text": "Annabel"\n               },\n                {\n                   "type": "text",\n                   "text": "Freya Dress"\n               }, {\n                   "type": "text",\n                   "text": "07 July 2023"\n               } ]\n         },\n         {\n          "type": "button",\n          "sub_type": "url",\n           "index": "0",\n          "parameters": [\n            {\n              "type": "text",\n              "text": "23493282245"\n            }\n          ]\n        }\n\n       ]\n    }\n}';

let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://graph.facebook.com/v17.0/105942389228737/messages',
  headers: { 
    'Content-Type': 'application/json', 
    'Authorization': 'Bearer EAAIl8Exy9ZCMBAMzDV2UjtgBD9v4tr58p7auaT4S4nQay1btQ61lKJx0VFnUEq86AROVyK9ZAKp42O0R4uXuqVed04dVckklh8xGmRWt1pVKhpZAUBpbAES9RBFoEUbQz4UEDKBZCioydf7k57ZCyRtaSGXvXSyDq5ZAvstrAQkAZAkZCvFkPYMl1ciTeZCofA23PFCt67mssDbtz9aJRdTWrZCc0KhOiHYQsZD'
  },
  data : data
};

axios.request(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});

}

const saveOrderInDb = async (body :  any) => {
    const newOrder: IOrder = new Order({
        order_id: body.id,
        order_date: body.created_at,
        email: body.contact_email,
        phone_number: body.phone,
        order_details: body,
        order_number: body.order_number,
        total_price: body.total_price,
        order_items: body.line_items,

    });
    const savedOrder: IOrder = await newOrder.save();
}


export { fetchShopifyOrderUsingWebhook }