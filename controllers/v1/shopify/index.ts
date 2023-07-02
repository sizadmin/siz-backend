import axios from 'axios';
import { IOrder } from '../../../types/order';
import Order from '../../../models/order';
import { IProduct } from '../../../types/product';
import Product from '../../../models/product';
const { SHOPIFY_TOKEN } = process.env;


const fetchShopifyOrder = async (req: any, res: any) => {
    try {
        let url = `https://siz-ae.myshopify.com/admin/api/2023-04/orders.json?status=any&created_at_min=2023-06-20T00:00:00-00:00`;

        let config = {
            headers: {
                'X-Shopify-Access-Token': SHOPIFY_TOKEN,
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
                const newOrder: IOrder = new Order({
                    order_id: order.id,
                    order_date: order.created_at,
                    email: order.contact_email,
                    phone_number: order.phone,
                    order_details: order,
                    order_number: order.order_number,
                    total_price: order.total_price

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

const fetchShopifyProducts = async (req: any, res: any) => {
    console.log(SHOPIFY_TOKEN, process.env)
    try {
        let url = `https://siz-ae.myshopify.com/admin/api/2023-04/products.json`;

        let config = {
            headers: {
                'X-Shopify-Access-Token': process.env.SHOPIFY_TOKEN,
            },
        };
        const response = await axios.get(url, config);

        for await (const product of response.data.products) {

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
    console.log(SHOPIFY_TOKEN, process.env)
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




export { fetchShopifyOrder, fetchShopifyProducts ,fetchShopifyLenders}