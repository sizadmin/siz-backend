import axios from 'axios';
import { IOrder } from '../../../types/order';
import Order from '../../../models/order';
import { IProduct } from '../../../types/product';
import Product from '../../../models/product';
import product from '../../../models/product';
import lender from '../../../models/lender';
import orderstatus from '../../../models/orderstatus';
import { IOrderStatus } from '../../../types/orderstatus';
import moment from "moment";


const fetchShopifyOrder = async (req: any, res: any) => {
    try {
        let url = `https://siz-ae.myshopify.com/admin/api/2023-04/orders.json?status=any&created_at_min=2023-01-01T00:00:00-00:00&limit=250`;

        let config = {
            headers: {
                'X-Shopify-Access-Token': process.env.SHOPIFY_TOKEN,
            },
        };
        const response = await axios.get(url, config);


        // const response = await axios.post(
        //     '/api/webhook',
        //     {},
        //     {
        //       headers: {
        //         'X-Shopify-Hmac-Sha256': process.env.REACT_APP_SHOPIFY_WEBHOOK_SECRET,
        //       },
        //     }
        //   );

        for await (const order of response.data.orders) {

            const findOrder: Array<IOrder> | null = await Order.find({
                $and: [
                    { order_id: order.id },
                ],
            });
            if (findOrder.length == 0) {
                let product_title = order.line_items[0]?.title ;
                const findProduct: any| null = await product.findOne({
                  "product_details.title": product_title 
                });

                let tags = findProduct?.product_details?.tags ;
                const regex = /(influencer_[A-Za-z0-9_]+)/;
                const matches = tags?.match(regex);
                let influencerTag = "" ;
                let lender_name = "" ;
                let lender_address = "" ;
                let lender_phone_call = "" ;
                let lender_phone_whatsapp = "" ;
                if (matches && matches.length >= 2) {
                    influencerTag = matches[1];
                    console.log("Influencer Tag:", influencerTag);
                    const findLender: any| null = await lender.findOne({
                        "shopify_id": influencerTag
                    });
                     lender_name = findLender?findLender.name : "Not Found";
                     lender_address = findLender?findLender.address : "Not Found";
                     lender_phone_call = findLender?findLender.phone_number_call : "Not Found";
                     lender_phone_whatsapp = findLender?findLender.phone_number_whatsapp : "Not Found";
                } else {
                    console.log("Influencer Tag not found.");
                }
                const newOrder: IOrder = new Order({
                    order_id: order.id,
                    order_date: order.created_at,
                    email: order.contact_email,
                    phone_number: order.phone,
                    order_details: order,
                    order_number: order.order_number,
                    total_price: order.total_price,
                    lender_name:lender_name,
                    lender_address:lender_address,
                    lender_phone_call : lender_phone_call,
                    lender_phone_whatsapp : lender_phone_whatsapp,

                });
                const savedOrder: IOrder = await newOrder.save();
            }
        }

        res.status(200).json({
            success: true,
            message: "Shopify orders fetched successfully.",
            // data: response.data
        });



    } catch (error) {
        // Handle errors and send an error response back to the client
        console.error("Failed to fetch shopify orders:", error);
        res
            .status(500)
            .json({ success: false, error: "Failed to fetch shopify orders" });
    }
}

const sendDeliveryReminderToRenter = async (req: any, res: any) => {
    try{
        const today = new Date();

        // Subtract one day from the current date to get yesterday's date
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1)
        today.setHours(23, 59, 0, 0);
        tomorrow.setHours(23, 59, 0, 0); // Set time to 00:00:00.000
        const formattedToday = today.toISOString().replace("Z", "+00:00");;
        const formattedTomorrow = tomorrow.toISOString().replace("Z", "+00:00");;
        
        const queryTomorrow = new Date(formattedTomorrow);
        const queryToday = new Date(formattedToday);
        console.log("TOMORROW:"+queryTomorrow) ;
        console.log("TODAY:"+queryToday) ;
        const query = {
            $and: [
                { product_delivery_date: {$gte : queryToday,$lt:queryTomorrow } },
            ],          
          };
        const findOrders: Array<IOrderStatus> | null = await orderstatus.find(query);

        console.log("Orders for tomorrow : " + findOrders)
        if (findOrders) {
            console.log("sending reminder message day before orders");
            findOrders.forEach(async (orderstatus) => {
              let order_id = await orderstatus.orderID;
              let delivery_time = await orderstatus.product_delivery_timeslot ;
              const findOrder: Array<IOrder> | null = await Order.find({
                $and: [
                    { order_id: order_id },
                ],
            });

                if(findOrder){
                    findOrder.forEach(async (newOrder) => {
                        let renter_name = newOrder.renter_name ;
                        console.log("order found to send reminder:" + newOrder.renter_name);
                        sendDeliveryReminderWhatsappMessage(newOrder,renter_name,delivery_time);
                        });
                }else {
                    console.log("No matching orders found.");
                  }
           
                });
          } else {
            console.log("No matching orders found.");
          }


    }catch(error){
        // Handle errors and send an error response back to the client
        console.error("Failed to send reminder to renter", error);
        res
            .status(500)
            .json({ success: false, error: "Failed to send reminder to renter" });
    }
}

const sendDeliveryReminderWhatsappMessage =  async (newOrder : any,renter_name:any,delivery_time: any) => { 
    console.log("in sendReminderMessage Function: "+newOrder);
    console.log(delivery_time);
    let renterName = renter_name ;
    if(delivery_time == "" || delivery_time == null || delivery_time == undefined) delivery_time = "Not Selected" ;
    let deliverySlot = delivery_time ;
    let itemName =  newOrder.rental_piece_name ;
    let duration = newOrder.rental_duration ;
    let startDate = newOrder.rental_start_date ;
    let endDate = newOrder.rental_end_date ;
    let headerImageUrl="https://whatsappimagessiz.s3.eu-north-1.amazonaws.com/siz-logo.png"

    console.log("PARAMS: " +renterName + "," + deliverySlot + "," +itemName+ "," +duration+ "," +startDate+ "," +endDate)
    setTimeout(() => {let payload = {
        messaging_product: 'whatsapp',
        to: newOrder.renter_phone_number,
        type: 'template',
        template: {
          name: "delivery_reminder",
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
                { type: 'text', text: renterName },
                { type: 'text', text: deliverySlot },
                { type: 'text', text: itemName },
                { type: 'text', text: duration },
                { type: 'text', text: startDate },
                { type: 'text', text: endDate },
              ]
            }
          ]
        }
      };
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
    if(newOrder.rental_piece_name != "Not Found"){
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

const fetchShopifyProducts = async (req: any, res: any) => {
    try {
        const today = new Date();

        // Subtract one day from the current date to get yesterday's date
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const formattedYesterday = yesterday.toISOString().replace("Z", "-04:00");
        let url = `https://siz-ae.myshopify.com/admin/api/2023-04/products.json?created_at_min=`+formattedYesterday;
        console.log("URL : ",url);
        let config = {
            headers: {
                'X-Shopify-Access-Token': process.env.SHOPIFY_TOKEN,
            },
        };
        const response = await axios.get(url, config);

        for await (const product of response.data.products) {
            console.log(response.data.products.length)

            const findProduct: Array<IProduct> | null = await Product.find({
                $and: [
                    { product_id: product.id },
                ],
            });
            if (findProduct.length == 0) {
                const newProduct: IProduct = new Product({
                    product_id: product.id,
                    product_name: product.title,
                    product_created_date: product.created_at,
                    product_details: product

                });
                const savedProduct: IProduct = await newProduct.save();
            }
        }

        res.status(200).json({
            success: true,
            message: "Shopify products fetched successfully.",
            data: response.data
        });



    } catch (error) {
        // Handle errors and send an error response back to the client
        console.error("Failed to fetch shopify products:", error);
        res
            .status(500)
            .json({ success: false, error: "Failed to fetch shopify products" });
    }
}

const fetchShopifyLenders = async (req: any, res: any) => {
    try {
        let url = `https://siz-ae.myshopify.com/admin/products/7697209852124/metafields.json`;

        let config = {
            headers: {
                'X-Shopify-Access-Token': process.env.SHOPIFY_TOKEN,
            },
        };
        const response = await axios.get(url, config);

        // for await (const product of response.data.products) {

        //     const findProduct: Array<IProduct> | null = await Product.find({
        //         $and: [
        //             { product_id: product.id },
        //         ],
        //     });
        //     if (findProduct.length == 0) {
        //         const newProduct: IProduct = new Product({
        //             product_id: product.id,
        //             product_name: product.title,
        //             product_created_date: product.created_at,
        //             product_details: product

        //         });
        //         const savedProduct: IProduct = await newProduct.save();
        //     }
        // }

        res.status(200).json({
            success: true,
            message: "Shopify products fetched successfully.",
            data: response.data
        });



    } catch (error) {
        // Handle errors and send an error response back to the client
        console.error("Failed to fetch shopify products:", error);
        res
            .status(500)
            .json({ success: false, error: "Failed to fetch shopify products" });
    }
}

const getOrderById = async (req: any, res: any) => {
    try {
        let orderID = req.params.id;
        console.log(orderID)
        const findOrder: Array<IOrder> | null = await Order.find({ order_id: orderID });
        console.log(findOrder)


        res.status(200).json({
            success: true,
            message: "Shopify product fetched successfully.",
            data: findOrder
        });
    } catch (err) {
        console.error("Failed to fetch shopify products:", err);
        res
            .status(500)
            .json({ success: false, error: "Failed to fetch shopify product" });

    }

}


export { fetchShopifyOrder, fetchShopifyProducts, fetchShopifyLenders, getOrderById,sendDeliveryReminderToRenter }
