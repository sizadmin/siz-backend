import { mysqlConnection } from "../../../../src/app";
import axios from "axios";
import moment from "moment";
import {
  fetchOrderDeliveryData,
  fetchOrderDetails,
  fetchOrderPickupData,
  insertDeliveryInfo,
  updateDeliveryInfo,
} from "../../mysqlControllers/controller";
import { IWTemplate } from "../../../../types/WTemplate";
import template from "../../../../models/template";
const PHONE_NUMBER_ID = 105942389228737;

const { AUTHORIZATION_TOKEN, WHATSAPP_VERSION, WHATSAPP_PHONE_VERSION } = process.env;

require("dotenv").config();

const findLatestOrders = async (req: any, res: any) => {
  const sql = `SELECT  o.created_at, o.order_no, o.product_id, o.start_date, o.end_date, o.days, o.amount , o.total_amount, o.disc_amt, o.deposit_amount,o.lender_id,o.damage_protection_amt,
    p.title, p.description, p.user_id, p.brand, p.color, p.retail_price,
    m.name as image, m.sub_path,
    u.full_name, u.phone,u.country_code 
     FROM siz_orders o left join siz_users u on o.user_id=u.id  left join siz_products p on o.product_id=p.id left join siz_product_media m on p.image_id=m.id WHERE o.order_no = 10075`;
  //o.created_at >= UNIX_TIMESTAMP(NOW() - INTERVAL 5 MINUTE);`;
  mysqlConnection.query(sql, async (err, results: any) => {
    if (err) {
      return res.status(500).json({ error: "Failed to fetch orders from MySQL", errorMsg: err });
    }
    //  let htmlTemplate = fs.readFileSync(path.join(__dirname, '../../../htmlTemplates/email-template.html'), 'utf8');

    results.map(async (orderData: any) => {
      const unixTimestamp = orderData.created_at;
      // Convert to milliseconds by multiplying by 1000
      //const date = moment(unixTimestamp * 1000).format("DD MMM YYYY hh:mm A");
      let orderDetails =
        "Hey there $customerName, \nThank you for renting with Sizters App and for supporting sustainable fashion and circular economy! We're certain you'll love the outfit you selected! \n\n Please Confirm your order details below \n Order No : $order_no \n Product : $product_name \n Start Date : $start_date \n\nI am Sizters Virtual assistant who will assist you in scheduling your delivery\n\n Please select how you prefer to receive the package ";
      let to = "+918624086801";
      orderDetails = orderDetails
        .replace("$customerName", orderData.full_name)
        .replace("$order_no", orderData.order_no)
        .replace("$product_name", orderData.title)
        .replace("$start_date", orderData.start_date);

      const buttonTemplate = {
        type: "interactive",
        interactive: {
          type: "button",
          header: { type: "text", text: "Order Confirmation" },
          body: { text: `${orderDetails}` },
          action: {
            buttons: [
              {
                type: "reply",
                reply: { id: "delivery", title: "Delivery" },
              },
              {
                type: "reply",
                reply: { id: "pickup", title: "Pickup" },
              },
            ],
          },
        },
      };
      console.log("in findLatestOrders: ");
      await sendTextMessage(to, "Thank you for your order! Please confirm your details.");
      await sendTextMessage(to, JSON.stringify(buttonTemplate)); // Send interactive buttons
    });
    res.status(200).json(results);
  });
};



const getDateFromRenterForOrder = async (req: any, res: any, order: any) => {
  let orderData: any = await fetchOrderDetails(order);
  if (!orderData) return;
  try {
    const response = await axios.post(
      `${process.env.WHATSAPP_API_URL}${process.env.WHATSAPP_VERSION}/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: 918624086801,
        type: "interactive",
        interactive: {
          type: "button",
          body: {
            text: "Please choose your preferred delivery date",
          },
          action: {
            buttons: [
              {
                type: "reply",
                reply: {
                  id: order + "_1",
                  title: moment(orderData[0].start_date).subtract(1, "day").format("DD-MMM-YY"),
                },
              },
              {
                type: "reply",
                reply: {
                  id: order + "_2",
                  title: moment(orderData[0].start_date).format("DD-MMM-YY"),
                },
              },
            ],
          },
        },
      },
      {
        headers: {
          Authorization: "Bearer " + process.env.AUTHORIZATION_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Error sending message" });
  }
};
const getTimeFromRenterForOrder = async (req: any, res: any, orderId: any) => {
  try {
    let OrderDate: any = null;
    let OrderTimeSlot: any = null;
    const OrderId = orderId.id.split("_")[0];
    if (orderId.id.split("_")[2] === "return") {
      await updateRenterPickupTime(OrderId, orderId.title);
      return;
    }

    let dbResponse: any = await fetchOrderDeliveryData(OrderId);
    if (dbResponse.length > 0 && dbResponse[0].delivery_date !== null && dbResponse[0].delivery_timeslot !== null) return;
    if (orderId.id.split("_")[1] === "time") {
      OrderTimeSlot = orderId.title;
      OrderDate = dbResponse[0].delivery_date;
    } else {
      OrderDate = moment(orderId.title, "YY-MMM-DD").format("DD-MM-YY");
      OrderTimeSlot = dbResponse.length > 0 ? dbResponse[0].delivery_timeslot : null;
    }
    if (dbResponse.length === 0) await insertDeliveryInfo(OrderId, OrderDate, OrderTimeSlot, null);

    if (dbResponse.length > 0 && (dbResponse[0].delivery_date === null || dbResponse[0].delivery_timeslot === null)) {
      let updatedDeliveryData = await updateDeliveryInfo(OrderId, OrderDate, OrderTimeSlot);
      if (updatedDeliveryData) {
        let dbResponse: any = await fetchOrderDeliveryData(OrderId);
        if (dbResponse.length > 0 && dbResponse[0].delivery_date !== null && dbResponse[0].delivery_timeslot !== null) {
          await sendOrderAggregatedInfo(OrderId);
          return;
        }
      }
    }

    const response = await axios.post(
      `${process.env.WHATSAPP_API_URL}${process.env.WHATSAPP_VERSION}/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: 918624086801,
        type: "interactive",
        interactive: {
          type: "button",
          body: {
            text: "Please choose your preferred delivery time slot",
          },
          action: {
            buttons: [
              {
                type: "reply",
                reply: {
                  id: OrderId + "_time_1",
                  title: "9AM - 1PM",
                },
              },
              {
                type: "reply",
                reply: {
                  id: OrderId + "_time_2",
                  title: "1PM - 5PM",
                },
              },
              {
                type: "reply",
                reply: {
                  id: OrderId + "_time_3",
                  title: "5PM - 9PM",
                },
              },
            ],
          },
        },
      },
      {
        headers: {
          Authorization: "Bearer " + process.env.AUTHORIZATION_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error sending message:", error.response.data);
    res.status(500).json({ error: "Error sending message" });
  }
};

const sendOrderTemplate = async (req: any, res: any) => {
  const template_name = "order_confirmation_to_renter_f";
  let order_id: any = Number(req.query.order_id) || 10084;
  const findTemplate: IWTemplate[] | null = await template.find({
    name: template_name,
  });
  // remove hard coding
  const orderDetailsData: any = await fetchOrderDetails(order_id);
  let obj: any = {
    template: findTemplate[0],

    user: {
      ...orderDetailsData[0],
    },
  };
  let components = [];

  // obj.template.headerVariables.length > 0 &&
  //   components.push({
  //     type: "header",
  //     parameters: obj.template.headerVariables.map((itm: any) => ({
  //       type: "text",
  //       text: obj.user.first_name,
  //     })),
  //   });
  obj.template.bodyVariables.length > 0 &&
    components.push({
      type: "body",
      parameters: [
        {
          type: "text",
          text: obj.user.first_name,
        },
        {
          type: "text",
          text: order_id,
        },
        {
          type: "text",
          text: obj.user.product_name,
        },
        {
          type: "text",
          text: moment(obj.user.start_date).format("DD MMM YYYY"),
        },
        {
          type: "text",
          text: moment(obj.user.end_date).format("DD MMM YYYY"),
        },
        {
          type: "text",
          text: obj.user.address,
        },
      ],
    });

  components.push({
    type: "button",
    sub_type: "quick_reply",
    index: "0",
    parameters: [
      {
        type: "payload",
        payload: JSON.stringify(order_id),
      },
    ],
  });

  console.log("-----obj", JSON.stringify(components, null, 2), "------obj", obj);
  await sendTemplateFunc(template_name, components, null);
  res.sendStatus(200);
};
// template to send to renter before 1 day of order start date
const reconfirmOrderFromRenter = async (req: any, res: any) => {
  const template_name = "reminder_for_deliver_before_1_day_test";
  let order_id: any = Number(req.query.order_id) || 10085;
  const findTemplate: IWTemplate[] | null = await template.find({
    name: template_name,
  });
  const orderDetailsData: any = await fetchOrderDetails(order_id);
  let dbResponse: any = await fetchOrderDeliveryData(order_id);

  let obj: any = {
    template: findTemplate[0],

    user: {
      ...orderDetailsData[0],
    },
  };
  let components = [];

  // obj.template?.headerVariables.length > 0 &&
  //   components.push({
  //     type: "header",
  //     parameters: obj.template.headerVariables.map((itm: any) => ({
  //       type: "text",
  //       text: obj.user.first_name,
  //     })),
  //   });
  obj.template?.bodyVariables.length > 0 &&
    components.push({
      type: "body",
      parameters: [
        {
          type: "text",
          text: obj.user.first_name,
        },
        {
          type: "text",
          text: dbResponse[0].delivery_timeslot,
        },
      ],
    });

  let custom_obj = {
    name: "reconfirm_from_renter",
    order_id: order_id,
  };
  components.push(
    {
      type: "button",
      sub_type: "quick_reply",
      index: "0",
      parameters: [
        {
          type: "payload",
          payload: JSON.stringify(custom_obj),
        },
      ],
    },
    {
      type: "button",
      sub_type: "quick_reply",
      index: "1",
      parameters: [
        {
          type: "payload",
          payload: JSON.stringify(custom_obj),
        },
      ],
    }
  );

  console.log("-----obj", JSON.stringify(components, null, 2), "------obj", obj);

  await sendTemplateFunc(template_name, components, null);
  res.sendStatus(200);
};

const sendOrderAggregatedInfo = async (orderId: any) => {
  try {
    let dbResponse: any = await fetchOrderDeliveryData(orderId);
    const orderDetailsData: any = await fetchOrderDetails(orderId);
    if (dbResponse.length === 0) return;
    else {
      let bodyText = `That's it! 😊 We'll notify you as soon as your order is out for delivery. 🚀 \n\nExpected Delivery Date: *${moment(
        dbResponse[0].delivery_date
      ).format("DD-MMM-YY")}*\nExpected Delivery Time: *${
        dbResponse[0].delivery_timeslot
      }*\n\nThank you for choosing Sizters! 💜 Happy renting! 😊👗\n\nIn the meantime, why not share the love? Refer your friends to the Sizters App and earn AED 50 credits for your next rental!
            \n👉 Share the link to download the app : https://siz.ae/pages/get-sizters-app
            \n✨ Share your unique referral code  *${
              orderDetailsData[0].referral_code
            }* with your friends. Both of you will enjoy AED 50 credits to use on your next rental orders!
            \nSpread the joy, and happy shopping! 💃`;

      await sendTextMessage(null, bodyText);
    }
    // console.log(response,"response")
  } catch (e) {
    console.log(e, "e");
  }
};
const changeDeliveryDetails = async (req: any, res: any, payload: any) => {
  let updatedPayload = JSON.parse(payload);
  await updateDeliveryInfo(updatedPayload.order_id, null, null);
  await getDateFromRenterForOrder(req, res, updatedPayload.order_id);
};

const sendThankYouMsgToRenter = async (req: any, res: any, payload: any) => {
  let updatedPayload = JSON.parse(payload);
  const orderDetailsData: any = await fetchOrderDetails(updatedPayload.order_id);
  // TODO :- pass customer phone number
  await sendTextMessage(918624086801, "Thank you for your order");
  res.sendStatus(200);
};

const getAddressFromRenter = async (req: any, res: any, order: any) => {
  // let orderData: any = await fetchOrderDetails(order);
  // if (!orderData) return;
  try {
    const response = await axios.post(
      `${process.env.WHATSAPP_API_URL}${process.env.WHATSAPP_VERSION}/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: 918624086801,
        type: "interactive",
        interactive: {
          type: "location_request_message",
          body: {
            text: "Thanks for your order! Tell us what address you'd like this order delivered to.",
          },
          action: {
            name: "send_location",
          },
        },
      },
      {
        headers: {
          Authorization: "Bearer " + process.env.AUTHORIZATION_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );
    res.sendStatus(200);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Error sending message" });
  }
};

const storeRenterDeliveryLocation = async (req: any, res: any, payload: any) => {
  let lat = payload.latitude || 18.550493240356;
  let long = payload.longitude || 73.934310913086;

  const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${long}&format=json`);
  console.log(response.data.display_name, "response");
  // store this in database
  await sendTextMessage(
    918624086801,
    `Thank you for confirming delivery address below is your confirmed delivery address \n${response.data.display_name}  `
  );
  res.sendStatus(200);
};

const getPickupSlotsFromRenterForOrder = async (req: any, res: any, orderId: any) => {
  try {
    let OrderTimeSlot: any = null;
    const OrderId = 10084;

    const response = await axios.post(
      `${process.env.WHATSAPP_API_URL}${process.env.WHATSAPP_VERSION}/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: 918624086801,
        type: "interactive",
        interactive: {
          type: "button",
          body: {
            text: "Please let us know your preferred return pick-up time slot",
          },
          action: {
            buttons: [
              {
                type: "reply",
                reply: {
                  id: OrderId + "_time_return_1",
                  title: "9AM - 1PM",
                },
              },
              {
                type: "reply",
                reply: {
                  id: OrderId + "_time_return_2",
                  title: "1PM - 5PM",
                },
              },
              {
                type: "reply",
                reply: {
                  id: OrderId + "_time_return_3",
                  title: "5PM - 9PM",
                },
              },
            ],
          },
        },
      },
      {
        headers: {
          Authorization: "Bearer " + process.env.AUTHORIZATION_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error sending message:", error.response.data);
    res.status(500).json({ error: "Error sending message" });
  }
};

const updateRenterPickupTime = async (orderId: any, text: any) => {
  // store pickup time in database
  await sendTextMessage(918624086801, "Thank you for confirming details.");
};

// template for sending thanks and feedback to renter

const thanksFeedbackToRenter = async (req: any, res: any) => {
  const template_name = "thanks_n_feeback_from_renter";
  let order_id: any = Number(req.query.order_id) || 10085;
  const findTemplate: IWTemplate[] | null = await template.find({
    name: template_name,
  });
  // remove hard coding
  const orderDetailsData: any = await fetchOrderDetails(order_id);
  let dbResponse: any = await fetchOrderDeliveryData(order_id);

  let obj: any = {
    template: findTemplate[0],

    user: {
      ...orderDetailsData[0],
    },
  };
  let components = [];

  obj.template?.bodyVariables.length > 0 &&
    components.push({
      type: "body",
      parameters: [
        {
          type: "text",
          text: obj.user.first_name,
        },
        {
          type: "text",
          text: "1PM - 5PM", //dbResponse[0].pickup_timeslot,
        },
      ],
    });

  console.log("-----obj", JSON.stringify(components, null, 2), "------obj", obj);
  await sendTemplateFunc(template_name, components, null);
  res.sendStatus(200);
};

const sendTemplateFunc = (template_name: any, components: any, phone_number: any) => {
  try {
    let payload = {
      messaging_product: "whatsapp",
      to: phone_number || 918624086801,
      type: "template",
      template: {
        name: template_name,
        language: {
          code: "en",
          policy: "deterministic",
        },
        components: components,
      },
    };

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `${process.env.WHATSAPP_API_URL}${process.env.WHATSAPP_VERSION}/${PHONE_NUMBER_ID}/messages`,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + process.env.AUTHORIZATION_TOKEN,
      },
      data: payload,
    };
    return new Promise((resolve, reject) => {
      axios
        .request(config)
        .then((response) => {
          console.log(JSON.stringify(response.data));
          resolve(response.data);
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  } catch (e) {
    console.log(e);
  }
};

const sendTextMessage = async (to:any, text:any) => {
  try {
    const response = await axios.post(
      `${process.env.WHATSAPP_API_URL}${process.env.WHATSAPP_VERSION}/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: to || 918624086801,
        type: "text",
        text: {
          body: text,
        },
      },
      {
        headers: {
          Authorization: "Bearer " + process.env.AUTHORIZATION_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data)
  } catch (error) {
    console.error("Error sending message:", error.response.data);
    //  res.status(500).json({ error: 'Error sending message' });
  }
};

const reminderToRenter = async (req: any, res: any) => {
  const template_name = "reminder_for_return";
  let order_id: any = Number(req.query.order_id) || 10085;
  const findTemplate: IWTemplate[] | null = await template.find({
    name: template_name,
  });
  // remove hard coding
  const orderDetailsData: any = await fetchOrderDetails(order_id);
  // let dbResponse: any = await fetchOrderDeliveryData(order_id);

  let obj: any = {
    template: findTemplate[0],

    user: {
      ...orderDetailsData[0],
    },
  };
  let components = [];

  obj.template?.bodyVariables.length > 0 &&
    components.push({
      type: "body",
      parameters: [
        {
          type: "text",
          text: obj.user.first_name,
        },
        // {
        //   type: "text",
        //   text: "1PM - 5PM", //dbResponse[0].pickup_timeslot,
        // },
      ],
    });

    let custom_obj = {
      name: "select_pickup_slots",
      order_id: order_id,
    };
    components.push(
      {
        type: "button",
        sub_type: "quick_reply",
        index: "0",
        parameters: [
          {
            type: "payload",
            payload: JSON.stringify(custom_obj),
          },
        ],
      }
    );


  console.log("-----obj", JSON.stringify(components, null, 2), "------obj", obj);
  // await sendTemplateFunc(template_name, components, null);

  await sendTemplateFunc(template_name, components, null);

  // const response = await axios.post(
  //   `${process.env.WHATSAPP_API_URL}${process.env.WHATSAPP_VERSION}/${PHONE_NUMBER_ID}/messages`,
  //   {
  //     messaging_product: "whatsapp",
  //     recipient_type: "individual",
  //     to: 918624086801,
  //     type: "interactive",
  //     interactive: {
  //       type: "button",
  //       body: {
  //         text: "Please choose your preferred delivery time slot",
  //       },
  //       action: {
  //         buttons: [
  //           {
  //             type: "reply",
  //             reply: {
  //               id: order_id + "_pickup_1",
  //               title: "9AM - 1PM",
  //             },
  //           },
  //           {
  //             type: "reply",
  //             reply: {
  //               id: order_id + "_pickup_2",
  //               title: "1PM - 5PM",
  //             },
  //           },
  //           {
  //             type: "reply",
  //             reply: {
  //               id: order_id + "_pickup_3",
  //               title: "5PM - 9PM",
  //             },
  //           },
  //         ],
  //       },
  //     },
  //   },
  //   {
  //     headers: {
  //       Authorization: "Bearer " + process.env.AUTHORIZATION_TOKEN,
  //       "Content-Type": "application/json",
  //     },
  //   }
  // );
    res.sendStatus(200);
};

export {
  findLatestOrders,
  getDateFromRenterForOrder,
  sendOrderTemplate,
  getTimeFromRenterForOrder,
  reconfirmOrderFromRenter,
  changeDeliveryDetails,
  sendThankYouMsgToRenter,
  getAddressFromRenter,
  storeRenterDeliveryLocation,
  getPickupSlotsFromRenterForOrder,
  thanksFeedbackToRenter,
  reminderToRenter
};
