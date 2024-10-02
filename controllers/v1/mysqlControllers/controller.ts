import path from "path";
import { transporter } from "../../../middleware/helperFuc";
import { mysqlConnection } from "../../../src/app";
import fs from "fs";
import moment from "moment";
require("dotenv").config();


const getUsersSizApp = async (req: any, res: any) => {
    const sql = 'SELECT * FROM siz_users';
    mysqlConnection.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch users from MySQL' });
        }
        res.status(200).json(results);
    });
}
const getOrdersSizApp = async (req: any, res: any) => {
    const sql = 'SELECT * FROM siz_orders';
    mysqlConnection.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch users from MySQL' });
        }
        res.status(200).json(results);
    });
}

const getProductSizApp = async (req: any, res: any) => {
    const sql = 'SELECT * FROM siz_products WHERE created_at >= UNIX_TIMESTAMP(NOW() - INTERVAL 1 DAY);';
    mysqlConnection.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch siz_products from MySQL' ,err:err});
        }
        res.status(200).json(results);
    });
}

const getRecentOrdersSizApp = async (req: any, res: any) => {
    const sql = `SELECT  o.created_at, o.order_no, o.product_id, o.start_date, o.end_date, o.days, o.amount , o.total_amount, o.disc_amt, o.deposit_amount,o.lender_id,o.damage_protection_amt,
    p.title, p.description, p.user_id, p.brand, p.color, p.retail_price,
    m.name as image, m.sub_path,
    u.full_name, u.phone,u.country_code 
     FROM siz_orders o left join siz_users u on o.user_id=u.id  left join siz_products p on o.product_id=p.id left join siz_product_media m on p.image_id=m.id WHERE o.created_at >= UNIX_TIMESTAMP(NOW() - INTERVAL 6 DAY);`;
    mysqlConnection.query(sql, async (err, results: any) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch orders from MySQL', errorMsg: err });
        }
        let htmlTemplate = fs.readFileSync(path.join(__dirname, '../../../htmlTemplates/email-template.html'), 'utf8');

        results.map(async (orderData: any) => {
            const unixTimestamp = orderData.created_at;
            // Convert to milliseconds by multiplying by 1000
            const date = moment(unixTimestamp * 1000).format("DD MMM YYYY hh:mm A");

            // Format the date to a readable string
            const formattedDate = date // This will use the local time zone

            const shortOrderId = Number(orderData.order_no) - 10000

            let imageUrl = "https://sizcdn.s3.ap-south-1.amazonaws.com/media/products/" + orderData.sub_path + "/" + orderData.image;
            // Replace placeholders with dynamic data
            htmlTemplate = htmlTemplate.replace('${customerName}', orderData.full_name)
                .replace('${orderId}', orderData.order_no)
                .replace('${orderDate}', formattedDate)
                .replace('${orderItem}', orderData.title)
                .replace('${totalAmount}', orderData.amount)
                .replace('${totalAmount2}', orderData.total_amount)
                .replace('${redirect_url}', 'https://siz-backend.siz.ae/admin/order/view/' + shortOrderId)
                .replace('${productImage}', imageUrl)
                .replace('${subtotal}', orderData.amount)
                .replace('${discount}', orderData.disc_amt).
                replace('${damage}', orderData.damage_protection_amt)
                .replace('${total}', orderData.total_amount - orderData.disc_amt + orderData.damage_protection_amt)





            const mailOptions = {
                from: "hey@siz.ae", // Your verified email address
                to: "db671996@gmail.com",
                // to: [process.env.SENDINBLUE_USER, "heysiz.ae@gmail.com"], // Recipient email
                subject: '📦 New Order Received - [Order #' + orderData.order_no + ']',
                html: htmlTemplate,

            };

            try {
                // Send email
                const info = await transporter.sendMail(mailOptions);
            } catch (e) {
                console.log(e)
            }
        })
        res.status(200).json(results);
    });
}


export { getUsersSizApp, getOrdersSizApp, getRecentOrdersSizApp, getProductSizApp }