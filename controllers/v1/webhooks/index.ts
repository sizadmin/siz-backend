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
        sendOrderPlacementMessageToRenter("971561114006","order_placement_with_delivery","https://siz.ae/cdn/shop/products/NADINEMERABIFREYADRESS2_600x.jpg?v=1649939352","Annabel","Freya Dress","4 Days","10 July 2023","13 July 2023","5349092393180");
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


const sendOrderPlacementMessageToRenter =  async (toNumber : any,templateName: any,headerImageUrl: any,clientName: any,itemName: any,duration: any,startDate: any,endDate: any,orderId: any) => {
  let payload = {
    messaging_product: 'whatsapp',
    to: toNumber,
    type: 'template',
    template: {
      name: templateName,
      language: {
        code: 'en_US',
        policy: 'deterministic'
      },
      components: [
		{        
		"type": "header",      
		"parameters": [         
			{ "type": "image", "image": {  "link": headerImageUrl, } }     
		]      
		},
        {
          type: 'body',
          parameters: [
            { type: 'text', text: clientName },
            { type: 'text', text: itemName },
            { type: 'text', text: duration },
			      { type: 'text', text: startDate },
            { type: 'text', text: endDate }
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
console.log(orderId,"order id");
  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://graph.facebook.com/v17.0/105942389228737/messages',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer EAAIl8Exy9ZCMBADVac6pl0ARqgiqLcdcDYAb7Bxv8ZAOfEVlDtJLZCL6Q370dwZCs2RshR01UyGQcEcq9SkWZCQGP1we8yZAMgfMkkwNu0OZBiNZB2tfcmZBtq57HI9vLD9YupIEBbVB3qAUIzZC0Lu8O9ckZAa00iPHqXWZAZCcJVm07PDCdYY6hueSm27KQayZAhWEB22OWKOc1PlnhzFmrFUsntmcFVPTpkSBcZD'
    },
    data: payload
  };

  axios.request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
    })
    .catch((error) => {
      console.log(error);
    });
}

const sendWhatsappMessageToRenter = async (body: any ) => {
    //const renterPhoneNumber = body.phone ;
    const axios = require('axios');
let data = '{\n    "messaging_product": "whatsapp",\n    "to": "971561114006",\n    "type": "template",\n    "template": {\n       "name": "order_placement_with_delivery",\n       "language": {\n           "code": "en_US",\n           "policy": "deterministic"\n       },\n       "components": [\n          {\n           "type": "body",\n           "parameters": [\n               {\n                   "type": "text",\n                   "text": "Annabel"\n               },\n                {\n                   "type": "text",\n                   "text": "Freya Dress"\n               }, {\n                   "type": "text",\n                   "text": "07 July 2023"\n               } ]\n         },\n         {\n          "type": "button",\n          "sub_type": "url",\n           "index": "0",\n          "parameters": [\n            {\n              "type": "text",\n              "text": "23493282245"\n            }\n          ]\n        }\n\n       ]\n    }\n}';

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