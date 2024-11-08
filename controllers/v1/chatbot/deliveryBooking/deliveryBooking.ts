import path from "path";
import { mysqlConnection } from "../../../../src/app";
import fs from "fs";
import moment, { duration } from "moment";
import { title } from "process";
import _ from 'lodash';
import axios from 'axios';

const { AUTHORIZATION_TOKEN, WHATSAPP_VERSION, WHATSAPP_PHONE_VERSION } = process.env;

require("dotenv").config();

const findLatestOrders = async  (req: any, res: any) => {

    const sql = `SELECT  o.created_at, o.order_no, o.product_id, o.start_date, o.end_date, o.days, o.amount , o.total_amount, o.disc_amt, o.deposit_amount,o.lender_id,o.damage_protection_amt,
    p.title, p.description, p.user_id, p.brand, p.color, p.retail_price,
    m.name as image, m.sub_path,
    u.full_name, u.phone,u.country_code 
     FROM siz_orders o left join siz_users u on o.user_id=u.id  left join siz_products p on o.product_id=p.id left join siz_product_media m on p.image_id=m.id WHERE o.order_no = 10075` ;
     //o.created_at >= UNIX_TIMESTAMP(NOW() - INTERVAL 5 MINUTE);`;
    mysqlConnection.query(sql, async (err, results: any) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch orders from MySQL', errorMsg: err });
        }
      //  let htmlTemplate = fs.readFileSync(path.join(__dirname, '../../../htmlTemplates/email-template.html'), 'utf8');

        results.map(async (orderData: any) => {
            const unixTimestamp = orderData.created_at;
            // Convert to milliseconds by multiplying by 1000
            //const date = moment(unixTimestamp * 1000).format("DD MMM YYYY hh:mm A");
            let orderDetails = "Hey there ${customerName}, \nThank you for renting with Sizters App and for supporting sustainable fashion and circular economy! We're certain you'll love the outfit you selected! \n\n Please Confirm your order details below \n Order No : $order_no \n Product : $product_name \n Start Date : $start_date \n\nI am Sizters Virtual assistant who will assist you in scheduling your delivery\n\n Please select how you prefer to receive the package "
            let to = "+971561114006" ;
            orderDetails = orderDetails.replace('${customerName}', orderData.full_name)
                .replace('${order_no}', orderData.order_no)
                .replace('${product_name}', orderData.title)
                .replace('${start_date}', orderData.start_date)
          
                const buttonTemplate = {
                    type: 'interactive',
                    interactive: {
                        type: 'button',
                        header: { type: 'text', text: 'Order Confirmation' },
                        body: { text: `${orderDetails}` },
                        //footer: { text: 'Please confirm your order details and select delivery options.' },
                        action: {
                            buttons: [
                                {
                                    type: 'reply',
                                    reply: { id: 'delivery', title: 'Delivery' }
                                },
                                {
                                    type: 'reply',
                                    reply: { id: 'pickup', title: 'Pickup' }
                                }
                            ]
                        }
                    }
                }; 
                console.log("in findLatestOrders: ");
                await sendMessage(to, 'Thank you for your order! Please confirm your details.');
                await sendMessage(to, JSON.stringify(buttonTemplate));  // Send interactive buttons
        
        })
        res.status(200).json(results);
    });

}


const sendMessage = async (to, text) => {
  //  const { phone, message } = req.body;
  console.log("In sendMessage",to);
    const PHONE_NUMBER_ID = 105942389228737
    try {
        const response = await axios.post(
            `${process.env.WHATSAPP_API_URL}${process.env.WHATSAPP_VERSION}/${PHONE_NUMBER_ID}/messages`,
            {

                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": to,
                "type": "text",
                "text": {
                    "body": text
                }
            },
            {
                headers: {
                    'Authorization': "Bearer " + process.env.AUTHORIZATION_TOKEN,
                    'Content-Type': 'application/json'
                },
            }
        );
       
        }catch (error) {
        console.error('Error sending message:', error.response.data);
      //  res.status(500).json({ error: 'Error sending message' });
    }
};

export { findLatestOrders }