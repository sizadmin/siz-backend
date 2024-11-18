import path from "path";
import { transporter } from "../../../middleware/helperFuc";
import { mysqlConnection } from "../../../src/app";
import fs from "fs";
import moment, { duration } from "moment";
import { title } from "process";
import _ from "lodash";
import { createShopifyProductFunc, updateMetafieldShopifyProductFunc } from "../shopify";
import { basicLogger } from "../../../middleware/logger";
import { ICronJob } from "../../../types/cronJob";
import cronJobs from "../../../models/cronJobs";
require("dotenv").config();
let options = { new: true };

const getUsersSizApp = async (req: any, res: any) => {
  const sql = "SELECT * FROM siz_users";
  mysqlConnection.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Failed to fetch users from MySQL" });
    }
    res.status(200).json(results);
  });
};
const getOrdersSizApp = async (req: any, res: any) => {
  const sql = "SELECT * FROM siz_orders";
  mysqlConnection.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Failed to fetch users from MySQL" });
    }
    res.status(200).json(results);
  });
};

const generateTags = (itm: any) => {
  let tags = [];
  if (itm.size) tags.push("ASize_" + itm.size);
  if (itm.color_name) tags.push("color_" + itm.color_name);
  if (itm.lender_name) tags.push("influencer_" + itm.lender_name);
  if (itm.brand_name) tags.push("brand_" + itm.brand_name);
  if (itm.category == "Clothing") tags.push("category_Clothes");
  if (itm.category == "Clothing") tags.push("categories_" + itm.sub_category);
  if (itm.category == "Bag") tags.push("category_Bags");
  tags.push("App");
  if (itm.type === 2) tags.push("managed_closet");

  return tags;
};
const getProductSizApp = async (req: any, res: any) => {
  let startTime: any = "";
  let endTime: any = "";

  const customDate = new Date(); // Replace with your custom date
  const unixTimestampEnd = Math.floor(customDate.getTime() / 1000);

  const customStartDate = new Date(customDate.getTime() - 24 * 60 * 60 * 1000); // Replace with your custom date
  const unixTimestampStart = Math.floor(customStartDate.getTime() / 1000);

  let findEntry: ICronJob[] | null = await cronJobs.find({
    name: "productUpload",
  });

  if (findEntry.length === 0 || findEntry === null) {
    startTime = unixTimestampStart; // Subtracts 1 day
    endTime = unixTimestampEnd;

    let payload = {
      name: "productUpload",
      timestamp: unixTimestampEnd,
    };
    const newCampaign: ICronJob = new cronJobs(payload);

    const savedList: ICronJob = await newCampaign.save();
  } else {
    startTime = findEntry[0].timestamp;
    endTime = unixTimestampEnd;
    let payload = {
      name: "productUpload",
      timestamp: unixTimestampEnd,
    };
    let updatedEntry: ICronJob[] | null = await cronJobs.findByIdAndUpdate({ _id: findEntry[0]._id }, payload, options);
  }

  let sql = `SELECT p.id 
    FROM siz_products p 
    WHERE p.created_at BETWEEN '${startTime}' AND '${endTime}';`;

  console.log(sql);
  mysqlConnection.query(sql, async (err, results: any) => {
    if (err) {
      return res.status(500).json({ error: "Failed to fetch siz_products from MySQL", err: err });
    }
    let productIds: any = [];
    for await (const itm of results) {
      productIds.push(itm.id);
    }
    req.body.productid = productIds;
    console.log(productIds);
    await getProductSizAppById(req, res);
  });
  // res.status(200).json({ results: productIds });
};

const getProductSizAppById = async (req: any, res: any) => {
  let productid = req.body.productid || [""];

  let finalResponse = [];
  console.log(productid, "productid");
  const productPromises = productid.map(async (product: any) => {
    return new Promise((resolve, reject) => {
      let sql = `SELECT p.*, b.name as brand_name, p.retail_price, s.title as size, cl.name as color_name, cat.name as category, pr.amount as price, pr.days as days, 
                       u.full_name as lender_name, sc.name as sub_category, med.name as image_name, med.sub_path as image_sub_path 
                       FROM siz_products p 
                       LEFT JOIN siz_ms_brands b ON p.brand = b.id 
                       LEFT JOIN siz_ms_sizes s ON p.size_id = s.id 
                       LEFT JOIN siz_ms_colors cl ON p.color = cl.id 
                       LEFT JOIN siz_ms_categories cat ON p.category_id = cat.id 
                       LEFT JOIN siz_product_prices pr ON p.id = pr.product_id 
                       LEFT JOIN siz_users u ON p.user_id = u.id
                       LEFT JOIN siz_ms_sub_categories sc ON p.sub_category_id = sc.id
                       LEFT JOIN siz_product_media med ON p.id = med.product_id
                       WHERE p.id = ${product}`;

      mysqlConnection.query(sql, async (err, results: any) => {
        if (err) {
          return reject({ error: "Failed to fetch siz_products from MySQL", err });
        }

        let payload = [];
        let imageData = [];
        let variantData = [];
        let optionsData: any = {
          size: [],
          color: [],
          duration: [],
        };

        for await (const itm of results) {
          let position = itm.days === 3 ? 1 : itm.days === 8 ? 2 : itm.days === 20 ? 3 : 4;

          // Handle variant data based on category
          if (itm.category === "Clothing" && [3, 8, 20].includes(itm.days)) {
            variantData.push({
              price: itm.price.toString(),
              option1: itm.size,
              option2: itm.color_name,
              option3: itm.days + " days",
              inventory_quantity: 1,
              requires_shipping: true,
              position,
            });
          } else if (itm.category === "Bag" && [8, 20].includes(itm.days)) {
            variantData.push({
              price: itm.price.toString(),
              // option1: itm.size,
              option1: itm.color_name,
              option2: itm.days + " days",
              inventory_quantity: 1,
              requires_shipping: true,
              position,
            });
          }

          optionsData.size.push(itm.size);
          optionsData.color.push(itm.color_name);
          optionsData.duration.push(itm.days + " days");
          imageData.push({
            src: `https://sizcdn.s3.ap-south-1.amazonaws.com/media/products/${itm.image_sub_path}/${itm.image_name}`,
          });

          payload.push({
            product: {
              title: itm.title,
              id: itm.id,
              retail_price: itm.retail_price,
              body_html: itm.description,
              vendor: itm.brand_name,
              product_type: itm.start_price.toString(),
              tags: generateTags(itm),
              variants: [],
              is_try_on: itm.is_try_on,
              size: itm.size,
              color_name: itm.color_name,
              category: itm.category,
              options: [
                {
                  name: "Size",
                  values: _.uniq(optionsData.size),
                },
                {
                  name: "Color",
                  values: _.uniq(optionsData.color),
                },
                {
                  name: "Select Duration",
                  values: _.uniq(optionsData.duration),
                },
              ],
              images: [],
            },
          });
        }

        let finalPayload: any = payload;
        // console.log(finalPayload,"ddd")

        finalPayload[0].product.images = _.uniqBy(imageData, "src");
        if (finalPayload[0].product.category === "Bag") finalPayload[0].product.variants = _.uniqBy(variantData, "option2");
        else finalPayload[0].product.variants = _.uniqBy(variantData, "option3");

        if (finalPayload[0].product.is_try_on === 1) {
          finalPayload[0].product.variants.push({
            price: "0",
            option1: finalPayload[0].product.size,
            option2: finalPayload[0].product.color_name,
            option3: "Try On",
            inventory_quantity: 1,
            position: finalPayload[0].product.variants.length + 1,
          });
          finalPayload[0].product.options[2].values.push("Try On");
        }
        delete finalPayload[0].product.is_try_on;
        delete finalPayload[0].product.size;
        delete finalPayload[0].product.color_name;

        if (finalPayload[0].product.category === "Bag") {
          finalPayload[0].product.options = finalPayload[0].product.options.splice(1);
        }

        let apicallsData = _.uniqBy(finalPayload, "product.id");

        // console.log(JSON.stringify(apicallsData, null, 2), "finalPayload update2");
        // delete apicallsData.product.id
        let responseList = [];
        for (const api of apicallsData) {
          try {
            let responseData = await createShopifyProductFunc(api);

            let payload2 = {
              metafield: {
                id: responseData.product.id,
                namespace: "my_fields",
                key: "retail_price",
                value: api.product.retail_price,
                value_type: "integer",
              },
            };

            let responseData2 = await updateMetafieldShopifyProductFunc(payload2);
            responseList.push({ ...responseData, metafields: responseData2 });
          } catch (error) {
            reject(error); // Reject promise if there's an error
          }
        }

        resolve(responseList); // Resolve with the response data
      });
    });
  });

  try {
    const allResults = await Promise.all(productPromises);
    finalResponse = allResults.flat(); // Flatten the results array
    res.status(200).json({ results: finalResponse });
  } catch (error) {
    res.status(500).json({ error: "Error fetching product data", details: error });
  }
};

const getRecentOrdersSizApp = async (req: any, res: any) => {
  const sql = `SELECT  o.created_at, o.order_no, o.product_id, o.start_date, o.end_date, o.days, o.amount , o.total_amount, o.disc_amt, o.deposit_amount,o.lender_id,o.damage_protection_amt,
    p.title, p.description, p.user_id, p.brand, p.color, p.retail_price,
    m.name as image, m.sub_path,
    u.full_name, u.phone,u.country_code 
     FROM siz_orders o left join siz_users u on o.user_id=u.id  left join siz_products p on o.product_id=p.id left join siz_product_media m on p.image_id=m.id WHERE o.created_at >= UNIX_TIMESTAMP(NOW() - INTERVAL 5 MINUTE);`;
  mysqlConnection.query(sql, async (err, results: any) => {
    if (err) {
      return res.status(500).json({ error: "Failed to fetch orders from MySQL", errorMsg: err });
    }
    let htmlTemplate = fs.readFileSync(path.join(__dirname, "../../../htmlTemplates/email-template.html"), "utf8");

    results.map(async (orderData: any) => {
      const unixTimestamp = orderData.created_at;
      // Convert to milliseconds by multiplying by 1000
      const date = moment(unixTimestamp * 1000).format("DD MMM YYYY hh:mm A");

      // Format the date to a readable string
      const formattedDate = date; // This will use the local time zone

      const shortOrderId = Number(orderData.order_no) - 10000;

      let imageUrl = "https://sizcdn.s3.ap-south-1.amazonaws.com/media/products/" + orderData.sub_path + "/" + orderData.image;
      // Replace placeholders with dynamic data
      htmlTemplate = htmlTemplate
        .replace("${customerName}", orderData.full_name)
        .replace("${orderId}", orderData.order_no)
        .replace("${orderDate}", formattedDate)
        .replace("${orderItem}", orderData.title)
        .replace("${totalAmount}", orderData.amount)
        .replace("${totalAmount2}", orderData.total_amount)
        .replace("${redirect_url}", "https://siz-backend.siz.ae/admin/order/view/" + shortOrderId)
        .replace("${productImage}", imageUrl)
        .replace("${subtotal}", orderData.amount)
        .replace("${discount}", orderData.disc_amt)
        .replace("${damage}", orderData.damage_protection_amt)
        .replace("${total}", orderData.total_amount - orderData.disc_amt + orderData.damage_protection_amt);

      const mailOptions = {
        from: process.env.SENDINBLUE_USER, // Your verified email address
        to: [process.env.SENDINBLUE_USER, "heysiz.ae@gmail.com"], // Recipient email
        subject: "📦 New Order Received - [Order #" + orderData.order_no + "]",
        html: htmlTemplate,
      };

      try {
        // Send email
        const info = await transporter.sendMail(mailOptions);
      } catch (e) {
        console.log(e);
      }
    });
    res.status(200).json(results);
  });
};

const fetchOrderDeliveryData = async (orderId: any) => {
  const sql = `SELECT * FROM delivery_info where order_id=${orderId}`;
  return new Promise((resolve, reject) => {
    mysqlConnection.query(sql, (err, results) => {
      if (err) {
        // reject(err);
        // return null;
      }
      resolve(results);
      return results;
    });
  });
};

const fetchOrderDetails = async (orderId: any) => {
  let sql = `SELECT u.first_name as first_name, p.title as product_name,o.start_date,o.end_date,CONCAT(oa.apartment," ", oa.area_name," ",oa.city," ",oa.state) as address FROM siz_orders o
left join siz_users u on o.user_id = u.id 
left join siz_order_addresses oa on o.group_id = oa.order_id
left join siz_products p on o.product_id = p.id
    WHERE o.order_no = ${orderId}`;
  console.log(sql);
  return new Promise((resolve, reject) => {
    mysqlConnection.query(sql, (err, results) => {
      if (err) {
        reject(null);
        return null;
      }
      resolve(results);
      return results;
    });
  });
};
const insertDeliveryInfo = (order_id: any, delivery_date: any, delivery_timeslot: any, delivery_id: any) => {
  const sql = `
      INSERT INTO delivery_info (order_id, delivery_date, delivery_timeslot, delivery_id)
      VALUES (?, ?, ?, ?)
    `;

  const values = [order_id, delivery_date, delivery_timeslot, delivery_id];
  return new Promise((resolve, reject) => {
    mysqlConnection.execute(sql, values, (err, result) => {
      if (err) {
        console.error("Error inserting data:", err);
        return;
      }
      console.log("Data inserted successfully:", result);
      resolve(result);
    });
  });
};

const updateDeliveryInfo = (order_id:any, delivery_date:any, delivery_timeslot:any) => {
  const sql = `
      UPDATE delivery_info 
      SET  delivery_date = ?, delivery_timeslot = ? 
      WHERE order_id = ?
    `;
  const values = [delivery_date, delivery_timeslot, order_id];
  return new Promise((resolve, reject) => {
    mysqlConnection.execute(sql, values, (err, result) => {
      if (err) {
        console.error("Error updating record:", err);
        return;
      }
      console.log(`Record updated successfully:`, result);
      resolve(result)
    });
  });
};

export {
  getUsersSizApp,
  getOrdersSizApp,
  getRecentOrdersSizApp,
  getProductSizApp,
  getProductSizAppById,
  fetchOrderDeliveryData,
  fetchOrderDetails,
  insertDeliveryInfo,
  updateDeliveryInfo
};
