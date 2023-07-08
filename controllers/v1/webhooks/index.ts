import axios from 'axios';
// import { IOrder } from '../../../types/order';
// import Order from '../../../models/order';
// import { IProduct } from '../../../types/product';
// import Product from '../../../models/product';




const fetchShopifyOrderUsingWebhook = async (req: any, res: any) => {
    try {
        const { body } = req;
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