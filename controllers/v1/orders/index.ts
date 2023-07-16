import axios from 'axios';
import { IOrder } from '../../../types/order';
import Order from '../../../models/order';
import { IProduct } from '../../../types/product';
import Product from '../../../models/product';
import { IOrderStatus } from '../../../types/orderstatus';
import orderstatus from '../../../models/orderstatus';


const fetchShopifyOrder = async (req: any, res: any) => {
    try {
        let url = `https://siz-ae.myshopify.com/admin/api/2023-04/orders.json?status=any&created_at_min=2023-06-20T00:00:00-00:00`;

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
    try {
        let url = `https://siz-ae.myshopify.com/admin/api/2023-04/products.json`;

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

const getOrderDeliveryStatus = async (req: any, res: any) => {
    try {
        let orderID = req.params.id;
        const findOrder: Array<IOrderStatus> | null = await orderstatus.find({ orderID: orderID });

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

const newOrderStatus = async (req: any, res: any) => {
    try {
        let body = req.body;
        let options = { new: true };

        const findOrderStatus: Array<IOrderStatus> | null = await orderstatus.find({ orderID: body.orderID });

        if (findOrderStatus.length > 0) {


            const findOrderStatus: Array<IOrderStatus> | null = await orderstatus.findByIdAndUpdate({ _id: body._id }, body, options);



            res.status(200).json({
                success: true,
                message: "Order status is updated successfully.",
                data: findOrderStatus
            });
            return;
        }
        const newOrderStatus: IOrderStatus = new orderstatus({
            orderID: body.orderID,
            product_delivery_date: body.product_delivery_date,
            product_pickup_date: body.product_pickup_date,
            notes: body.notes
        });

        const savedProduct = await newOrderStatus.save();

        res.status(200).json({
            success: true,
            message: "Order status is created successfully.",
            data: savedProduct
        });



    } catch (error) {
        // Handle errors and send an error response back to the client
        console.error("Failed to create  order status:", error);
        res
            .status(500)
            .json({ success: false, error: "Failed to create order status", data: error });
    }
}

const updateOrderStatus = async (req: any, res: any) => {
    try {
        let options = { new: true };

        let body = req.body;
        const findOrderStatus: Array<IOrderStatus> | null = await orderstatus.findByIdAndUpdate({ _id: body._id }, body, options);

        res.status(200).json({
            success: true,
            message: "Order status is updated successfully.",
            data: findOrderStatus
        });



    } catch (error) {
        // Handle errors and send an error response back to the client
        console.error("Failed to update  order status:", error);
        res
            .status(500)
            .json({ success: false, error: "Failed to update order status", data: error });
    }
}



export { getOrderDeliveryStatus, newOrderStatus, updateOrderStatus }
