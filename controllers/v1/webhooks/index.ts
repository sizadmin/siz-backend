import axios from 'axios';
import { IOrder } from '../../../types/order';
import Order from '../../../models/order';
import { IProduct } from '../../../types/product';
import product from '../../../models/product';
import lender from '../../../models/lender';
import { IOrderStatus } from '../../../types/orderstatus';
import orderstatus from '../../../models/orderstatus';
const { AUTHORIZATION_TOKEN, WHATSAPP_VERSION, WHATSAPP_PHONE_VERSION } = process.env;


// import { IProduct } from '../../../types/product';
// import Product from '../../../models/product';




const fetchShopifyOrderUsingWebhook = async (req: any, res: any) => {
    try {
        const { body } = req;
        console.log(body);
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
        res
            .status(500)
            .json({ success: false, error: "Failed to fetch shopify products" });
    }
}


        //const sendOrderPlacementMessageToRenter =  async (toNumber : any,templateName: any,headerImageUrl: any,clientName: any,itemName: any,duration: any,startDate: any,endDate: any,orderId: any) => {
const sendOrderPlacementMessageToRenter =  async (body : any) => { 
  console.log("sending message to renter")
        console.log(body);
        let to_Number = (body.billing_address?.phone.length > 0 ) ? body.billing_address.phone : "Phone Not Found" ; ;
        let clientName = (body.billing_address?.first_name.length > 0 ) ? body.billing_address.first_name : "Client Name Not Found" ;
        let headerImageUrl="https://whatsappimagessiz.s3.eu-north-1.amazonaws.com/siz-logo.png"
        let line_items_array = body.line_items ;
        let arrayLength = line_items_array?.length ;
        let itemName  = "";
        let duration = "" ;
        let dateString = "" ;
        let backupPieceName = "" ;
        console.log(arrayLength);
        if(arrayLength > 1){
            itemName = line_items_array[0]?.name.split("-")[0] + " & " + (arrayLength-1) + "Others" ; 
            duration = (line_items_array[0]?.name.split("/").length > 0 && line_items_array[0].name.split("/").length == 4) ? line_items_array[0].name.split("/")[3] :  line_items_array[0].name.split("/")[2] ;
            if(line_items_array[0]?.properties?.length > 0 ){
              let key = line_items_array[0].properties[0].name ;
              if(key == "Date"){
                dateString = line_items_array[0].properties[0].value ;
              }
            }else{
              dateString = "Not Found" ;
            } 
        }else if(arrayLength == 1){
          itemName = line_items_array[0]?.name.split("-")[0] ; 
          duration = (line_items_array[0]?.name.split("/").length > 0 && line_items_array[0].name.split("/").length == 4) ? line_items_array[0].name.split("/")[3] :  line_items_array[0].name.split("/")[2] ;
          if(line_items_array[0]?.properties?.length > 0 ){
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
        let startDate = (dateString?.length > 0) ? dateString?.split(" to ")[0] : "Not Found";
        let endDate = (dateString?.length > 0) ? dateString?.split(" to ")[1]: "Not Found";
        console.log(startDate)
        let orderId = body.id
        let note = body.note ;
        const backup_product_handle = note?.split('/').pop();
        console.log("Last Part "+backup_product_handle)
        const findBackupProduct: any| null = await product.findOne({
              "product_details.handle": backup_product_handle
        });

        console.log(findBackupProduct)
        let backupProduct = findBackupProduct? findBackupProduct.product_details.title : "No Backup Product Selected" ;
        if(clientName == "" || clientName == null) return ;
        if(itemName == "" || itemName == null) return ;
        if(duration == "" || duration == null) duration = "Not Selected" ;
        if(startDate == "" || startDate == null) startDate = "Not Selected" ;
        if(endDate == "" || endDate == null) endDate = "Not Selected" ;
        if(backupProduct == "" || backupProduct == null || backupProduct == "No Backup Product Selected"  ) backupProduct = "Not Selected" ;


        setTimeout(() => {let payload = {
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
      console.log(orderId,"order id");
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
        }},5000) 


}

const sendWhatsappMessageToRenter = async (body: any ) => {
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

    let lenderObj = await findLenderDetails(body);
    let order_items_array = await populateLineItems(body.line_items);
    console.log("line itesms populated "+ order_items_array)
        let renter_phone_number = (body.billing_address?.phone.length > 0 ) ? body.billing_address.phone : "Phone Not Found" ; ;
        let clientName = (body.billing_address?.first_name.length > 0 ) ? body.billing_address.first_name : "Client Name Not Found" ;
        let line_items_array = body.line_items ;
        let arrayLength = line_items_array?.length ;
        let itemName  = "";
        let lender_name_string  = "";
        let lender_address_string  = "";
        let lender_phone_string  = "";
        let duration = "" ;
        let dateString = "" ;
        let backupPieceName = "" ;
        console.log(arrayLength);
        if(arrayLength > 1){
          lender_name_string = order_items_array[0].lender[0].name + " & " + (arrayLength-1) + " Others" ;
          lender_address_string = order_items_array[0].lender[0].address + " & " + (arrayLength-1) + " Others" ;
          lender_phone_string = order_items_array[0].lender[0].phone_number_call + " & " + (arrayLength-1) + " Others" ;
          itemName = order_items_array[0]?.name.split("-")[0] + " & " + (arrayLength-1) + " Others" ; 
            duration = (order_items_array[0]?.name.split("/").length > 0 && order_items_array[0].name.split("/").length == 4) ? order_items_array[0].name.split("/")[3] :  order_items_array[0].name.split("/")[2] ;
            if(order_items_array[0]?.properties?.length > 0 ){
              let key = order_items_array[0].properties[0].name ;
              if(key == "Date"){
                dateString = order_items_array[0].properties[0].value ;
              }
            }else{
              dateString = "Not Found" ;
            } 
        }else if(arrayLength == 1){
          itemName = order_items_array[0]?.name.split("-")[0] ; 
          lender_name_string = order_items_array[0].lender[0].name  ;
          lender_address_string = order_items_array[0].lender[0].address ;
          lender_phone_string = order_items_array[0].lender[0].phone_number_call ;
          duration = (order_items_array[0]?.name.split("/").length > 0 && order_items_array[0].name.split("/").length == 4) ? order_items_array[0].name.split("/")[3] :  order_items_array[0].name.split("/")[2] ;
          if(order_items_array[0]?.properties?.length > 0 ){
            let key = order_items_array[0].properties[0].name ;
            if(key == "Date"){
              dateString = order_items_array[0].properties[0].value ;
            }
          }else{
            dateString = "Not Found" ;
          } 
        }else{
          itemName = "Not Found";
          duration = "Not Found" ;
        }
        let startDate = (dateString?.length > 0) ? dateString?.split(" to ")[0] : "Not Found";
        let endDate = (dateString?.length > 0) ? dateString?.split(" to ")[1]: "Not Found";
        console.log(startDate)
        console.log("endDate in renter message: "+endDate)
        let orderId = body.id
        let note = body.note ;
        const backup_product_handle = note?.split('/').pop();
        console.log("Last Part "+backup_product_handle)
        const findBackupProduct: any| null = await product.findOne({
              "product_details.handle": backup_product_handle
        });

        console.log(findBackupProduct)
        let backupProduct = findBackupProduct? findBackupProduct .product_details.title : "No Backup Product Selected" ;
        if(clientName == "" || clientName == null) return ;
        if(itemName == "" || itemName == null) return ;
        if(duration == "" || duration == null) duration = "Not Selected" ;
        if(startDate == "" || startDate == null) startDate = null ;
        if(endDate == "" || endDate == null) endDate = null ;
        if(backupProduct == "" || backupProduct == null || backupProduct == "No Backup Product Selected"  ) backupProduct = "Not Selected" ;


   
    const newOrder: IOrder = new Order({
        order_id: body.id,
        order_date: body.created_at,
        email: body.contact_email,
        phone_number: body.phone,
        order_details: body,
        order_number: body.order_number,
        total_price: body.total_price,
        renter_phone_number : renter_phone_number,
        rental_start_date : startDate ,
        rental_end_date : endDate ,
        renter_name : clientName,
        rental_duration : duration ,
        rental_piece_name : itemName ,
        backup_piece : backupProduct ,
        order_items: order_items_array,
        order_note:body.note,
        lender_name:lender_name_string,
        lender_address:lender_address_string,
        lender_phone_call : lender_phone_string,
        lender_phone_whatsapp : lender_phone_string,
        profit: 0,
        expenses: 0,
        lenders_share: 0,
        rental_fees:body.total_price

    });
    const savedOrder: IOrder = await newOrder.save();
    const newOrderStatus: IOrderStatus = new orderstatus({
      orderID: body.id,
      product_delivery_date: null,
      product_pickup_date: null,
      notes: null,
      product_delivery_timeslot : null,
      product_pickup_timeslot : null,
      product_pickup_date_from_renter : null,
      product_pickup_timeslot_from_renter : null,
      return_picked_up : null,
  });

  const savedOrderStatus: IOrderStatus = await newOrderStatus.save();
    await sendOrderPlacementMessageToRenter(body);
    await (lender)?sendOrderReceivedMessageToLender(newOrder):"No Lender Details Found";
}

const populateLineItems =  async (line_items : any) => {
  console.log("In populate function: "+line_items.length) ;
  let order_items_array = line_items ;
  for (const item of line_items) {
      let product_id = item.product_id ;
      let lender = await findLenderFromProductId(product_id);
      order_items_array.lender = lender ;
  };
  return order_items_array;
}



const sendOrderReceivedMessageToLender = async (newOrder : any) =>{
  console.log("sending message to lender")
  console.log(newOrder);
  //let to_Number = (newOrder?.lender_phone_whatsapp?.length > 0 ) ? newOrder.lender_phone_whatsapp : "Phone Not Found" ; ;
  //let LenderName = (newOrder?.lender_name?.length > 0 ) ? newOrder.lender_name : "Lender Name Not Found" ;
  let headerImageUrl="https://whatsappimagessiz.s3.eu-north-1.amazonaws.com/siz-logo.png"
  console.log("URL");
  let line_items_array = newOrder?.order_items ;
  console.log("array captured");
  let orderId = newOrder.order_id ;
  line_items_array.forEach(item => {
    let to_Number = item.lender.lender_phone_whatsapp ;
    let LenderName = item.lender.name ;
    let headerImageUrl="https://whatsappimagessiz.s3.eu-north-1.amazonaws.com/siz-logo.png" ;
    let itemName = item.title ;
    let dateString = "" ;
    let duration = (item.name.split("/").length > 0 && item.name.split("/").length == 4) ? item.name.split("/")[3] :  item.name.split("/")[2] ;
    if(item?.properties?.length > 0 ){
      let key = item.properties[0].name ;
      if(key == "Date"){
        dateString = item.properties[0].value ;
      }
    }else{
      dateString = "Not Found" ;
    } 

    let startDate = (dateString?.length > 0) ? dateString?.split(" to ")[0] : "Not Found";
    let endDate = (dateString?.length > 0) ? dateString?.split(" to ")[1]: "Not Found";

    if(LenderName == "" || LenderName == null) return ;
    if(itemName == "" || itemName == null) return ;
    if(duration == "" || duration == null) duration = "Not Selected" ;
    if(startDate == "" || startDate == null) startDate = "Not Selected" ;
    if(endDate == "" || endDate == null) endDate = "Not Selected" ;

    setTimeout(() => {let payload = {
      messaging_product: 'whatsapp',
      to: to_Number,
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
        { "type": "image", "image": {  "link": headerImageUrl, } }     
      ]      
      },
          {
            type: 'body',
            parameters: [
              { type: 'text', text: LenderName },
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
  console.log(orderId,"order id");
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
    }},5000) 
  

  });

  
  
  
  
  
  
}
const findLenderDetails = async (body : any ) => {
  let product = await findProductFromOrder(body);
  let product_id = product?.product_id ;
  let tags = product?.product_details?.tags ;
  const regex = /(INFLUENCER_[A-Za-z0-9_\\s]+)/;
  const matches = tags?.toUpperCase().match(regex);
  let influencerTag = "" ;
  if (matches && matches.length >= 2) {
    influencerTag = matches[1];
    console.log("Influencer Tag:", influencerTag);
    const findLender: any| null = await lender.findOne({
      "shopify_id": influencerTag
    });
    return findLender;
  } else {
    console.log("Influencer Tag not found.");
    return null ;
  }
}

const findLenderFromProductId = async (product_id : any ) => {
  console.log("in findLenderFromProductId");
  let product = await findProductByProductId(product_id);
  let tags = product?.product_details?.tags ;
  const regex = /(INFLUENCER_[A-Za-z0-9_\\s]+)/;
  const matches = tags?.toUpperCase().match(regex);
  let influencerTag = "" ;
  if (matches && matches.length >= 2) {
    influencerTag = matches[1];
    console.log("Influencer Tag:", influencerTag);
    const findLender: any| null = await lender.findOne({
      "shopify_id": influencerTag
    });
    return findLender;
  } else {
    console.log("Influencer Tag not found.");
    return null ;
  }
}

const findProductByProductId = async (product_id : any) => {
  console.log("in findProductByProductId");
  const findProduct: any| null = await product.findOne({
    "product_id": product_id 
  });
  console.log(findProduct)
  return findProduct ;
  
}


const findProductFromOrder = async (body : any) => {
  let product_title = body.line_items[0]?.title ;
  const findProduct: any| null = await product.findOne({
    "product_details.title": product_title 
  });
  console.log(findProduct)
  return findProduct ;
  
}

export { fetchShopifyOrderUsingWebhook }