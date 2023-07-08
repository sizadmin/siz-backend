import axios from 'axios';
import { IOrder } from '../../../types/order';
import Order from '../../../models/order';
// import { IProduct } from '../../../types/product';
// import Product from '../../../models/product';




const fetchShopifyOrderUsingWebhook = async (req: any, res: any) => {
    try {
        const { body } = req;
        console.log(body);
        const newOrder: IOrder = new Order({
            order_id: body.id,
            order_date: body.created_at,
            email: body.contact_email,
            phone_number: body.phone,
            order_details: body,
            order_number: body.order_number,
            total_price: body.total_price

        });
        const savedOrder: IOrder = await newOrder.save();
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




export { fetchShopifyOrderUsingWebhook }