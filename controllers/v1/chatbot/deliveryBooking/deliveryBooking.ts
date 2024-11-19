import { mysqlConnection } from "../../../../src/app";
import axios from "axios";
import moment from "moment";
import { fetchOrderDeliveryData, fetchOrderDetails, insertDeliveryInfo, updateDeliveryInfo } from "../../mysqlControllers/controller";
import { IWTemplate } from "../../../../types/WTemplate";
import template from "../../../../models/template";

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
      let to = "+971561114006";
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
          //footer: { text: 'Please confirm your order details and select delivery options.' },
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
      await sendMessage(to, "Thank you for your order! Please confirm your details.");
      await sendMessage(to, JSON.stringify(buttonTemplate)); // Send interactive buttons
    });
    res.status(200).json(results);
  });
};

const sendMessage = async (to, text) => {
  //  const { phone, message } = req.body;
  console.log("In sendMessage", to);
  const PHONE_NUMBER_ID = 105942389228737;
  try {
    const response = await axios.post(
      `${process.env.WHATSAPP_API_URL}${process.env.WHATSAPP_VERSION}/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: to,
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
  } catch (error) {
    console.error("Error sending message:", error.response.data);
    //  res.status(500).json({ error: 'Error sending message' });
  }
};

const getDateFromRenterForOrder = async (req: any, res: any, order: any) => {
  let orderData: any = await fetchOrderDetails(order);
  if (!orderData) return;
  const PHONE_NUMBER_ID = 105942389228737;
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
                  title: moment(orderData[0].start_date).subtract(1, "day").format("DD-MM-YY"),
                },
              },
              {
                type: "reply",
                reply: {
                  id: order + "_2",
                  title: moment(orderData[0].start_date).format("DD-MM-YY"),
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
  // orderId.id = "10084_time_3";
  // orderId.title = "11-2";
  // Check for this order id already time slot is saved in db or not
  let OrderDate: any = null;
  let OrderTimeSlot: any = null;
  const OrderId = orderId.id.split("_")[0];

  const PHONE_NUMBER_ID = 105942389228737;
  let dbResponse: any = await fetchOrderDeliveryData(OrderId);
  if (dbResponse.length > 0 && (dbResponse[0].delivery_date !== null || dbResponse[0].delivery_timeslot !== null)) return
    // console.log(OrderDate, OrderTimeSlot, "------", dbResponse);
  if (orderId.id.split("_")[1] === "time") {
    OrderTimeSlot = orderId.title;
    OrderDate = dbResponse[0].delivery_date;
  } else {
    OrderDate = moment(orderId.title, "DD-MM-YY").format("DD-MM-YY");
    OrderTimeSlot = dbResponse.length > 0 ? dbResponse[0].delivery_timeslot: null;
  }
  if (dbResponse.length === 0) {
    let savedInfo = await insertDeliveryInfo(10084, OrderDate, OrderTimeSlot, null);
  }

  if (dbResponse.length > 0 && (dbResponse[0].delivery_date === null || dbResponse[0].delivery_timeslot === null)) {
    let savedInfo = await updateDeliveryInfo(10084, OrderDate, OrderTimeSlot);
  }
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
  let order_id = 10084;
  const findTemplate: IWTemplate[] | null = await template.find({
    name: "order_confirmation_to_renter_f",
  });
  // remove hard coding
  const orderDetailsData: any = await fetchOrderDetails(order_id);
  console.log(orderDetailsData, "orderDetailsData");
  let obj: any = {
    template: findTemplate[0],

    user: {
      //   first_name: "Deepak",
      //   item_name: "Pink Dress",
      //   order_start_date: "16-11-2024",
      //   order_end_date: "18-11-2024",
      //   order_deliver_address: "Pune",
      //   order_number: "0101",
      ...orderDetailsData[0],
    },
  };
  // delete obj.template.components;
  let components = [];

  obj.template.headerVariables.length > 0 &&
    components.push({
      type: "header",
      parameters: obj.template.headerVariables.map((itm: any) => ({
        type: "text",
        text: obj.user.first_name,
      })),
    });
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
          text: obj.user.start_date,
        },
        {
          type: "text",
          text: obj.user.end_date,
        },
        {
          type: "text",
          text: obj.user.address,
        },
      ],
    });

//   let custom_payload = {
//     order_id: order_id,
//   };
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
  setTimeout(() => {
    let payload = {
      messaging_product: "whatsapp",
      to: 918624086801,
      type: "template",
      template: {
        name: "order_confirmation_to_renter_f",
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
      url: "https://graph.facebook.com/v17.0/105942389228737/messages",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + process.env.AUTHORIZATION_TOKEN,
      },
      data: payload,
    };
    axios
      .request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
      })
      .catch((error) => {
        console.log(error);
      });
  }, 5000);
};

export { findLatestOrders, getDateFromRenterForOrder, sendOrderTemplate, getTimeFromRenterForOrder };
