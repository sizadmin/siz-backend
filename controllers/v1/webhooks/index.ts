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

        
        sendOrderPlacementMessageToRenter(body)
        //sendOrderPlacementMessageToRenter("971561114006","order_placement_with_delivery",image_url,renter_name,item_name,duration,start_date,"13 July 2023",order_id);
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


        //const sendOrderPlacementMessageToRenter =  async (toNumber : any,templateName: any,headerImageUrl: any,clientName: any,itemName: any,duration: any,startDate: any,endDate: any,orderId: any) => {
const sendOrderPlacementMessageToRenter =  async (body : any) => { 
        console.log(body);
        let to_Number = body.phone ;
        let clientName = (body.billing_address.first_name.length > 0 ) ? body.billing_address.first_name : "Client Name Not Found" ;
        let headerImageUrl="https://whatsappimagessiz.s3.eu-north-1.amazonaws.com/order_received_15.png"
        let line_items_array = body.line_items ;
        let arrayLength = line_items_array.length ;
        let itemName  = "";
        let duration = "" ;
        let dateString = "" ;
        console.log(arrayLength);
        if(arrayLength > 1){
            itemName = line_items_array[0].name.split("-")[0] + "And" + (arrayLength-1) + "Others" ; 
            duration = (line_items_array[0].name.split("/").length > 0 && line_items_array[0].name.split("/").length == 4) ? line_items_array[0].name.split("/")[3] :  line_items_array[0].name.split("/")[2] ;
            if(line_items_array[0].properties.length > 0 ){
              let key = line_items_array[0].properties[0].name ;
              if(key == "Date"){
                dateString = line_items_array[0].properties[0].value ;
              }
            }else{
              dateString = "Not Found" ;
            } 
        }else if(arrayLength == 1){
          itemName = line_items_array[0].name.split("-")[0] ; 
          duration = (line_items_array[0].name.split("/").length > 0 && line_items_array[0].name.split("/").length == 4) ? line_items_array[0].name.split("/")[3] :  line_items_array[0].name.split("/")[2] ;
          if(line_items_array[0].properties.length > 0 ){
            let key = line_items_array[0].properties[0].name ;
            if(key == "Date"){
              dateString = line_items_array[0].properties[0].value ;
            }
          }else{
            dateString = "Not Found" ;
          } 
        }else{
          itemName = "Not Found";
          duration = "Not Found" ;
        }
        let startDate = (dateString.length > 0) ? dateString.split("to")[0] : "Not Found";
        let endDate = (dateString.length > 0) ? dateString.split("to")[1]: "Not Found";
        console.log(startDate)
        let orderId = body.id
        console.log(clientName)
        console.log(itemName)
        console.log(duration)
        console.log(startDate)
        console.log(orderId)

let payload = {
    messaging_product: 'whatsapp',
    to: "+971561114006",
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
      'Authorization': 'Bearer EAAIl8Exy9ZCMBABBxmqksvO8yXsXuBoZAfWXtCDcfSmQhZAZBUbrGSWKaJqtyZAOxS23XmBkZAkCxqIZCfhsTOobwUmhLZA3VJ57JLBiTdBS9ZA2JDY6rbIT1ZADcsECfJASUakyJHkB9gPEzUPpDtztLvH1VLeZCZBlrG2VCi5cZA6Px4NJWeky4CFBzfNGZBy6TJ6QvEyiogJa6ZBNwZDZD'
    },
    data: payload
  };
if(itemName != "Not Found"){
  axios.request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
    })
    .catch((error) => {
      console.log(error);
    });
  }else{
    console.log("No item found to send whatsapp notification")
  }
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