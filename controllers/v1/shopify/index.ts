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
import { populateLineItems } from '../webhooks';
import { basicLogger } from '../../../middleware/logger';
const { AUTHORIZATION_TOKEN, WHATSAPP_VERSION, WHATSAPP_PHONE_VERSION } = process.env;


const fetchShopifyOrder = async (req: any, res: any) => {
  try {
    let url = `https://siz-ae.myshopify.com/admin/api/2024-01/orders.json?status=any&created_at_min=2023-01-01T00:00:00-00:00&limit=250`;

    let config = {
      headers: {
        'X-Shopify-Access-Token': process.env.SHOPIFY_TOKEN,
      },
    };
    const response = await axios.get(url, config);


    for await (const order of response.data.orders) {

      const findOrder: Array<IOrder> | null = await Order.find({
        $and: [
          { order_id: order.id },
        ],
      });
      if (findOrder.length == 0) {
        let productId = order.line_items[0]?.product_id;
        const findProduct: any | null = await product.findOne({
          "product_id": productId
        });
        console.log(findProduct)
        let line_items = await populateLineItems(order.line_items);

        let tags = findProduct?.product_details?.tags;
        const regex = /(INFLUENCER_[A-Za-z0-9_\\s]+)/;
        const matches = tags.toUpperCase()?.match(regex);
        let influencerTag = "";
        let lender_name = "";
        let lender_address = "";
        let lender_phone_call = "";
        let lender_phone_whatsapp = "";
        let dateString = "";
        if (matches && matches.length >= 2) {
          influencerTag = matches[1];
          console.log("Influencer Tag in fetchorder:", influencerTag);
          const findLender: any | null = await lender.findOne({
            "shopify_id": influencerTag
          });
          console.log(findLender);
        //  lender_name = (findLender) ? findLender.name : "Not Found";
        //   lender_address = (findLender)  ? findLender.address : "Not Found";
        //   lender_phone_call = (findLender)  ? findLender.phone_number_call : "Not Found";
        //   lender_phone_whatsapp = (findLender)  ? findLender.phone_number_whatsapp : "Not Found";
        // } else {
        //   console.log("Influencer Tag not found.");
        // }
        // let key = order.line_items[0].properties[0].name;
        // if (key == "Date") {
        //   dateString = order.line_items[0].properties[0].value;
        // }
        // let startDate = (dateString?.length > 0) ? dateString?.split(" to ")[0] : "Not Found";
        // let endDate = (dateString?.length > 0) ? dateString?.split(" to ")[1] : "Not Found";

        const newOrder: IOrder = new Order({
          order_id: order.id,
          order_date: order.created_at,
          email: order.contact_email,
          phone_number: order.phone,
          order_details: order,
          order_number: order.order_number,
          total_price: order.total_price,
          lender_name: lender_name,
          lender_address: lender_address,
          lender_phone_call: lender_phone_call,
          lender_phone_whatsapp: lender_phone_whatsapp,
          rental_start_date: startDate,
          rental_end_date: endDate,
          profit: 0,
          expenses: 0,
          lenders_share: 0,
          rental_fees: Number(order.total_price) ?? 0,
          order_items: line_items,


        });
        basicLogger.info({
          controller: 'fetchShopifyOrder',
          method: 'GET',
          terror: 'Saved Order in fetchShopifyOrder method',
          body: newOrder
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

    basicLogger.error({
      controller: 'fetchShopifyOrder',
      method: 'GET',
      terror: 'Error in fetchShopifyOrder method',
      error: error
    });

    res
      .status(500)
      .json({ success: false, error: "Failed to fetch shopify orders" });
  }
}
const sendUpdateOnPickupFromRenter = async (req: any, res: any) => {
  try {
    const today = new Date();

    // Subtract one day from the current date to get yesterday's date
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1)
    today.setHours(23, 59, 0, 0);
    yesterday.setHours(23, 59, 0, 0); // Set time to 00:00:00.000
    const formattedToday = today.toISOString().replace("Z", "+00:00");;
    const formattedYesterday = yesterday.toISOString().replace("Z", "+00:00");;

    const queryYesterday = new Date(formattedYesterday);
    const queryToday = new Date(formattedToday);
    console.log("TOMORROW:" + queryYesterday);
    console.log("TODAY:" + queryToday);
    const query = {
      $and: [
        { rental_end_date: { $gte: queryYesterday, $lt: queryToday } },
      ],
    };
    const findOrder: Array<IOrder> | null = await Order.find(query);
    if (findOrder) {
      findOrder.forEach(async (newOrder) => {
        let lender_name = newOrder.lender_name;
        let item_name = newOrder.rental_piece_name;
        console.log("order found to send message:" + newOrder.renter_name);
        sendUpdateOnPickupFromRenterWhatsappMessage(newOrder, lender_name, item_name);
      });
    } else {
      console.log("No matching orders found.");
    }
  } catch (err) {
    console.error("Failed to fetch shopify products:", err);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch shopify product" });

  }
}

const sendUpdateOnPickupFromRenterWhatsappMessage = async (newOrder: any, lender_name: any, item_name: any) => {
  console.log("in sendUpdateOnPickupFromRenterWhatsappMessage Function: " + newOrder, lender_name, item_name);
  if (lender_name == "" || lender_name == null || lender_name == undefined) lender_name = "Not Selected";
  if (item_name == "" || item_name == null || item_name == undefined) item_name = "Not Selected";
  let headerImageUrl = "https://whatsappimagessiz.s3.eu-north-1.amazonaws.com/siz-logo.png"

  setTimeout(() => {
    let payload = {
      messaging_product: 'whatsapp',
      to: newOrder.lender_phone_whatsapp,
      type: 'template',
      template: {
        name: "update_pickup_drycleaner",
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
              { type: 'text', text: item_name },
            ]
          },

        ]
      }
    };
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
    if (newOrder.rental_piece_name != "Not Selected") {
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


const sendUpdateOnPaymentToLender = async (req: any, res: any) => {
  try {

    const order_id = req.params.id;
    const findOrder: Array<IOrder> | null = await Order.find({
      $and: [
        { order_id: order_id },
      ],
    });
    if (findOrder) {
      findOrder.forEach(async (newOrder) => {
        let lender_name = newOrder.lender_name;
        let rental_piece_name = newOrder.rental_piece_name;
        console.log("order found to send reminder:" + newOrder.renter_name);
        sendPaymentReminderWhatsappMessage(newOrder, lender_name, rental_piece_name);
      });
    } else {
      console.log("No matching orders found.");
    }


  } catch (err) {
    console.error("Failed to fetch shopify order:", err);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch shopify order" });

  }
}

const sendPaymentReminderWhatsappMessage = async (newOrder: any, lender_name: any, item_name: any) => {
  console.log("in sendPaymentReminderWhatsappMessage Function: " + newOrder, lender_name, item_name);
  if (lender_name == "" || lender_name == null || lender_name == undefined) lender_name = "Not Selected";
  if (item_name == "" || item_name == null || item_name == undefined) item_name = "Not Selected";
  let headerImageUrl = "https://whatsappimagessiz.s3.eu-north-1.amazonaws.com/siz-logo.png"

  setTimeout(() => {
    let payload = {
      messaging_product: 'whatsapp',
      to: newOrder.lender_phone_whatsapp,
      type: 'template',
      template: {
        name: "update_on_drycleaning_complete ",
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
              { type: 'text', text: item_name },
            ]
          },

        ]
      }
    };
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
    if (newOrder.rental_piece_name != "Not Selected") {
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



const sendReturnPickupReminderToRenter = async (req: any, res: any) => {
  try {
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
    console.log("TOMORROW:" + queryTomorrow);
    console.log("TODAY:" + queryToday);
    const query = {
      $and: [
        { rental_end_date: { $gte: queryToday, $lt: queryTomorrow } },
      ],
    };
    const findOrders: Array<IOrder> | null = await Order.find(query);

    console.log("Orders Ending for tomorrow : " + findOrders)
    if (findOrders) {
      console.log("sending reminder message day before rental period ends");
      findOrders.forEach(async (order) => {
        let order_id = await order.order_id;
        const findOrder: Array<IOrder> | null = await Order.find({
          $and: [
            { order_id: order_id },
          ],
        });

        if (findOrder) {
          findOrder.forEach(async (newOrder) => {
            let renter_name = newOrder.renter_name;
            console.log("order found to send reminder:" + newOrder.renter_name);
            sendReturnPickupReminderWhatsappMessage(newOrder, renter_name);
          });
        } else {
          console.log("No matching orders found.");
        }

      });
    } else {
      console.log("No matching orders found.");
    }


  } catch (error) {
    // Handle errors and send an error response back to the client
    console.error("Failed to send reminder to renter", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to send reminder to renter" });
  }
}

const sendReturnPickupReminderWhatsappMessage = async (newOrder: any, renter_name: any) => {
  console.log("in sendReminderMessage Function: " + newOrder);
  let renterName = renter_name;
  let headerImageUrl = "https://whatsappimagessiz.s3.eu-north-1.amazonaws.com/siz-logo.png"

  console.log("PARAMS: " + renterName)
  setTimeout(() => {
    let payload = {
      messaging_product: 'whatsapp',
      to: newOrder.renter_phone_number,
      type: 'template',
      template: {
        name: "return_reminder_to_renter",
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
              { type: 'text', text: renterName },
            ]
          },
          ,
          {
            type: 'button',
            sub_type: 'url',
            index: '0',
            parameters: [
              { type: 'text', text: newOrder.order_id }
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
        'Authorization': "Bearer " + process.env.AUTHORIZATION_TOKEN,
      },
      data: payload
    };
    if (newOrder.rental_piece_name != "Not Found") {
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



const sendDeliveryReminderToRenter = async (req: any, res: any) => {
  try {
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
    console.log("TOMORROW:" + queryTomorrow);
    console.log("TODAY:" + queryToday);
    const query = {
      $and: [
        { product_delivery_date: { $gte: queryToday, $lt: queryTomorrow } },
      ],
    };
    const findOrders: Array<IOrderStatus> | null = await orderstatus.find(query);

    console.log("Orders for tomorrow : " + findOrders)
    if (findOrders) {
      console.log("sending reminder message day before orders");
      findOrders.forEach(async (orderstatus) => {
        let order_id = await orderstatus.orderID;
        let delivery_time = await orderstatus.product_delivery_timeslot;
        const findOrder: Array<IOrder> | null = await Order.find({
          $and: [
            { order_id: order_id },
          ],
        });

        if (findOrder) {
          findOrder.forEach(async (newOrder) => {
            let renter_name = newOrder.renter_name;
            console.log("order found to send reminder:" + newOrder.renter_name);
            sendDeliveryReminderWhatsappMessage(newOrder, renter_name, delivery_time);
          });
        } else {
          console.log("No matching orders found.");
        }

      });
    } else {
      console.log("No matching orders found.");
    }


  } catch (error) {
    // Handle errors and send an error response back to the client
    console.error("Failed to send reminder to renter", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to send reminder to renter" });
  }
}

const sendDeliveryReminderWhatsappMessage = async (newOrder: any, renter_name: any, delivery_time: any) => {
  console.log("in sendReminderMessage Function: " + newOrder);
  console.log(delivery_time);
  let renterName = renter_name;
  if (delivery_time == "" || delivery_time == null || delivery_time == undefined) delivery_time = "Not Selected";
  let deliverySlot = delivery_time;
  let itemName = newOrder.rental_piece_name;
  let duration = newOrder.rental_duration;
  let startDate = moment(newOrder.rental_start_date).format("DD-MMM-YYYY");
  let endDate = moment(newOrder.rental_end_date).format("DD-MMM-YYYY");
  let headerImageUrl = "https://whatsappimagessiz.s3.eu-north-1.amazonaws.com/siz-logo.png"

  console.log("PARAMS: " + renterName + "," + deliverySlot + "," + itemName + "," + duration + "," + startDate + "," + endDate)
  setTimeout(() => {
    let payload = {
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
              { "type": "image", "image": { "link": headerImageUrl, } }
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
        'Authorization': "Bearer " + process.env.AUTHORIZATION_TOKEN,
      },
      data: payload
    };
    if (newOrder.rental_piece_name != "Not Found") {
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


const sendPickupReminderToLender = async (req: any, res: any) => {
  try {
    const today = new Date();

    const pickupDate = new Date(req.params.date);
    const pickupSlot = req.params.timeslot;

    console.log("Passed Parameter for reminder", pickupDate, pickupSlot);

    // Subtract one day from the current date to get yesterday's date
    const yesterday = new Date(pickupDate);
    yesterday.setDate(pickupDate.getDate() - 1)
    yesterday.setHours(23, 59, 0, 0);
    pickupDate.setHours(23, 59, 0, 0); // Set time to 00:00:00.000
    const formattedpickupDate = pickupDate.toISOString().replace("Z", "+00:00");;
    const formattedyesterday = yesterday.toISOString().replace("Z", "+00:00");;

    const queryyesterday = new Date(formattedyesterday);
    const querypickupDate = new Date(formattedpickupDate);
    console.log("TOMORROW:" + queryyesterday);
    console.log("TODAY:" + querypickupDate);
    const query = {
      $and: [
        { product_pickup_date: { $gte: queryyesterday, $lt: querypickupDate } }
      ],
    };
    const findOrders: Array<IOrderStatus> | null = await orderstatus.find(query);

    console.log("Orders for tomorrow : " + findOrders)
    if (findOrders) {
      console.log("sending reminder message day before orders");
      findOrders.forEach(async (orderstatus) => {
        const pickupTimeslot = orderstatus.product_pickup_timeslot;
        console.log(pickupTimeslot);
        if (pickupTimeslot === pickupSlot) {
          let order_id = await orderstatus.orderID;
          let pickup_time = await orderstatus.product_pickup_timeslot;
          let pickup_date = await orderstatus.product_pickup_date;
          const findOrder: Array<IOrder> | null = await Order.find({
            $and: [
              { order_id: order_id },
            ],
          });

          if (findOrder) {
            findOrder.forEach(async (newOrder) => {
              let lender_name = newOrder.lender_name;
              console.log("order found to send reminder:" + newOrder.renter_name);
              sendPickupReminderWhatsappMessage(newOrder, lender_name, pickup_time, pickup_date);
            });
          } else {
            console.log("No matching orders found.");
          }

        }

      });
    } else {
      console.log("No matching orders found.");
    }


  } catch (error) {
    // Handle errors and send an error response back to the client
    console.error("Failed to send reminder to lender", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to send reminder to lender" });
  }
}

const sendPickupReminderWhatsappMessage = async (newOrder: any, lender_name: any, pickup_time: any, pickup_date: any) => {
  console.log("in sendPickupReminderWhatsappMessage Function: " + newOrder);
  console.log(pickup_time);
  let lenderName = lender_name;
  if (pickup_time == "" || pickup_time == null || pickup_time == undefined) pickup_time = "Not Selected";
  let pickupSlot = pickup_time;
  let pickupDate = moment(
    pickup_date
  ).format("DD-MMM-YYYY")
  let itemName = newOrder.rental_piece_name;
  let duration = newOrder.rental_duration;
  let startDate = moment(newOrder.rental_start_date).format("DD-MMM-YYYY");
  let endDate = moment(newOrder.rental_end_date).format("DD-MMM-YYYY");
  let headerImageUrl = "https://whatsappimagessiz.s3.eu-north-1.amazonaws.com/siz-logo.png"

  console.log("PARAMS: " + lenderName + "," + pickupDate + "," + pickupSlot + "," + itemName + "," + duration + "," + startDate + "," + endDate)
  setTimeout(() => {
    let payload = {
      messaging_product: 'whatsapp',
      to: newOrder.lender_phone_whatsapp,
      type: 'template',
      template: {
        name: "pickup_reminder_to_lender",
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
              { type: 'text', text: lenderName },
              { type: 'text', text: itemName },
              { type: 'text', text: duration },
              { type: 'text', text: startDate },
              { type: 'text', text: endDate },
              { type: 'text', text: pickupDate },
              { type: 'text', text: pickupSlot },
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
        'Authorization': "Bearer " + process.env.AUTHORIZATION_TOKEN,
      },
      data: payload
    };
    if (newOrder.rental_piece_name != "Not Found") {
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


const sendFeedbackMessageToRenter = async (req: any, res: any) => {
  try {
    const today = new Date();

    // Subtract one day from the current date to get yesterday's date
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1)
    today.setHours(23, 59, 0, 0);
    yesterday.setHours(23, 59, 0, 0); // Set time to 00:00:00.000
    const formattedToday = today.toISOString().replace("Z", "+00:00");;
    const formattedYesterday = yesterday.toISOString().replace("Z", "+00:00");;

    const queryYesterday = new Date(formattedYesterday);
    const queryToday = new Date(formattedToday);
    console.log("TOMORROW:" + queryYesterday);
    console.log("TODAY:" + queryToday);
    const query = {
      $and: [
        { product_pickup_date_from_renter: { $gte: queryYesterday, $lt: queryToday } },
      ],
    };
    const findOrders: Array<IOrderStatus> | null = await orderstatus.find(query);

    console.log("Orders Ending Today : " + findOrders)
    if (findOrders) {
      console.log("sending reminder message day before orders");
      findOrders.forEach(async (orderstatus) => {
        let order_id = await orderstatus.orderID;
        let pickup_time = await orderstatus.product_pickup_timeslot_from_renter;
        const findOrder: Array<IOrder> | null = await Order.find({
          $and: [
            { order_id: order_id },
          ],
        });

        if (findOrder) {
          findOrder.forEach(async (newOrder) => {
            let renter_name = newOrder.renter_name;
            console.log("order found to send reminder:" + newOrder.renter_name);
            sendFeedbackWhatsappMessageRenter(newOrder, renter_name, pickup_time);
          });
        } else {
          console.log("No matching orders found.");
        }

      });
    } else {
      console.log("No matching orders found.");
    }


  } catch (error) {
    // Handle errors and send an error response back to the client
    console.error("Failed to send reminder to renter", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to send reminder to renter" });
  }
}

const sendFeedbackWhatsappMessageRenter = async (newOrder: any, renter_name: any, pickup_time: any) => {
  console.log("in sendReminderMessage Function: " + newOrder);
  console.log(pickup_time);
  let renterName = renter_name;
  if (pickup_time == "" || pickup_time == null || pickup_time == undefined) pickup_time = "Not Selected";
  let pickupSlot = pickup_time;
  let headerImageUrl = "https://whatsappimagessiz.s3.eu-north-1.amazonaws.com/siz-logo.png"

  console.log("PARAMS: " + renterName + "," + pickupSlot)
  setTimeout(() => {
    let payload = {
      messaging_product: 'whatsapp',
      to: newOrder.renter_phone_number,
      type: 'template',
      template: {
        name: "thankyou_feedback_renter",
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
              { type: 'text', text: renterName },
              { type: 'text', text: pickupSlot }
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
        'Authorization': "Bearer " + process.env.AUTHORIZATION_TOKEN,
      },
      data: payload
    };
    if (newOrder.rental_piece_name != "Not Found") {
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



const fetchShopifyProducts = async (req: any, res: any) => {
  try {
    const today = new Date();
    const visitedPages = new Set();
    // Subtract one day from the current date to get yesterday's date
    let nextPage = 'eyJkaXJlY3Rpb24iOiJwcmV2IiwibGFzdF9pZCI6ODE0Njk3Nzk4MDYzNiwibGFzdF92YWx1ZSI6Ik1pZGkgRHJlc3MgV2l0aCBUd28tdG9uZSBQbGVhdGVkIFNraXJ0In0';
    let url = `https://siz-ae.myshopify.com/admin/api/2024-01/products.json`;
    console.log("URL : ", url);
    while (nextPage && !visitedPages.has(nextPage)) {
      let config = {
        headers: {
          'X-Shopify-Access-Token': process.env.SHOPIFY_TOKEN,
        },
        params: {
          page_info: nextPage,
          limit: 250,
        },
      };
      const response = await axios.get(url, config);
      console.log(response);
      for await (const product of response.data.products) {
        //console.log(response.data.products.length)

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
        } else {
          for (const prod of findProduct) {
            prod.product_details = product;

            const updateProduct: IProduct = await prod.save();
          }
        }
      }
      console.log("pageID: " + nextPage)
      visitedPages.add(nextPage);
      const linkHeader = response.headers.link;
      console.log(linkHeader);
      const nextPageMatch = linkHeader && linkHeader.match(/<([^>]+)>;\s*rel="next"/);
      console.log(nextPageMatch);
      nextPage = nextPageMatch ? new URLSearchParams(nextPageMatch[1]).get('page_info') : null;
      console.log("extracted pageID: " + nextPage)

      // Break if the page ID is already visited
      if (visitedPages.has(nextPage)) {
        break;
      }
      res.status(200).json({
        success: true,
        message: "Shopify products fetched successfully.",
        data: response.data
      });
    }




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
        'X-Shopify-Access-Token': process.env.AUTHORIZATION_TOKEN,
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


export { fetchShopifyOrder, fetchShopifyProducts, fetchShopifyLenders, sendUpdateOnPickupFromRenter, sendUpdateOnPaymentToLender, getOrderById, sendDeliveryReminderToRenter, sendReturnPickupReminderToRenter, sendFeedbackMessageToRenter, sendPickupReminderToLender }
