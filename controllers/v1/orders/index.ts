import axios from 'axios';
import { IOrder } from '../../../types/order';
import Order from '../../../models/order';
import { IProduct } from '../../../types/product';
import Product from '../../../models/product';
import { IOrderStatus } from '../../../types/orderstatus';
import orderstatus from '../../../models/orderstatus';


const fetchShopifyOrder = async (req: any, res: any) => {
    try {
        let url = `https://siz-ae.myshopify.com/admin/api/2023-07/orders.json?status=any&created_at_min=2023-06-20T00:00:00-00:00`;

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
            notes: body.notes,
            product_delivery_timeslot: body.product_delivery_timeslot,
            product_pickup_timeslot: body.product_pickup_timeslot,
            product_pickup_date_from_renter: body.product_pickup_date_from_renter,
            product_pickup_timeslot_from_renter: body.product_pickup_timeslot_from_renter,
            return_picked_up: body.return_picked_up,
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

const updateOrderCustomFields = async (req: any, res: any) => {
    try {
        let body = req.body;
        let options = { new: true };

        const result = await Order.findOneAndUpdate(
            { _id: body._id },
            {
                $set: {
                    profit: body.profit, lenders_share: body.lenders_share, order_type: body.order_type, fitting_date: body.fitting_date,
                    pickup_by_dry_cleaner_from_renter: body.pickup_by_dry_cleaner_from_renter, returned_to_lender_by_dry_cleaner: body.returned_to_lender_by_dry_cleaner,
                    returned_to_lender: body.returned_to_lender, rental_fees: body.rental_fees, expenses: body.expenses, payment_status: body.payment_status
                }
            },
            options
        )


        res.status(200).json({
            success: true,
            message: "Order status is updated successfully.",
            data: result
        });




    } catch (error) {
        // Handle errors and send an error response back to the client
        console.error("Failed to create  order status: in updateOrderCustomFields", error);
        res
            .status(500)
            .json({ success: false, error: "Failed to create order status updateOrderCustomFields", data: error });
    }

}
const updateOrderStatusChanges = async (req: any, res: any) => {
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
            notes: body.notes,
            product_delivery_timeslot: body.product_delivery_timeslot,
            product_pickup_timeslot: body.product_pickup_timeslot,
            product_pickup_date_from_renter: body.product_pickup_date_from_renter,
            product_pickup_timeslot_from_renter: body.product_pickup_timeslot_from_renter,
            return_picked_up: body.return_picked_up,
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


const getDashboardOrders = async (req: any, res: any) => {
    try {

        const page = Number(req.query.page) || 1;
        const size = Number(req.query.size) || 250;
        let sortProperty = req.query.sortByOrder;

        let start_date = req.query.start_date;
        let end_date = req.query.end_date;


        let lender_name = req.query.lender_name;
        let lender_Lname = req.query.lender_Lname;


        let renter_name = req.query.renter_name;
        let renter_Lname = req.query.renter_Lname;
        let payment_status = req.query.payment_status;
        let order_type = req.query.order_type;

        let product = req.query.product;
        console.log(payment_status, "payment_status")

        // console.log(req.user, "header")

        let MatchQuery: any = {};
        if (lender_name) MatchQuery.lender_name = { $regex: lender_name, $options: 'i' };
        if (lender_Lname) MatchQuery.lender_name = { $regex: lender_Lname, $options: 'i' };

        if (renter_name) MatchQuery.renter_name = { $regex: renter_name, $options: 'i' };
        if (renter_Lname) MatchQuery['order_details.customer.last_name'] = { $regex: renter_Lname, $options: 'i' };
        if (payment_status) MatchQuery.payment_status = payment_status == 'true' ? true : false;
        if (order_type) MatchQuery.order_type = { $regex: order_type, $options: 'i' };


        // if (product) MatchQuery['order_details.line_items.[0].name'] = { $regex: product, $options: 'i' };

        const sort: any = {};
        if (sortProperty === 'order_number') {
            sort['order_number'] = 1;
        }
        if (sortProperty === '-order_number') {
            sort['order_number'] = -1;
        }


        if (start_date !== undefined) {
            MatchQuery.order_date = {
                $gte: new Date(start_date),
            }
        }
        if (end_date !== undefined) {
            MatchQuery.order_date = {
                ...MatchQuery.order_date,
                $lte: new Date(end_date),
            }
        }
        // console.log(MatchQuery, "MatchQuery")
        const agg: any = [
            {
                $match: MatchQuery,
            },
            {

                $lookup: {
                    from: "orderstatuses",         // The target collection name
                    localField: "order_id",  // The field from the source collection to match
                    foreignField: "orderID",// The field from the target collection to match
                    as: "order_status"         // The field to store the joined documents
                }

            },
            { $sort: sort },

        ];

        const aggregatedData: any = await Order.aggregate(agg);

        let totalPrice = 0;
        let totalRentalFees = 0;
        let totalLendersShare = 0;
        let totalExpenses = 0;
        let totalProfit = 0;

        // console.log(aggregatedData,"aggregatedData")
        aggregatedData.forEach(element => {
            totalPrice = element.order_details.total_price !== null || element.order_details.total_price !== undefined ? totalPrice + Number(element.order_details.total_price) : totalPrice;
            totalRentalFees = element.rental_fees !== null || element.rental_fees !== undefined ? totalRentalFees + Number(element.rental_fees) : totalRentalFees;
            totalLendersShare = element.lenders_share !== null || element.lenders_share !== undefined ? totalLendersShare + Number(element.lenders_share) : totalLendersShare;
            totalExpenses = element.expenses !== null || element.expenses !== undefined ? totalExpenses + Number(element.expenses) : totalExpenses;
            totalProfit = element.profit !== null || element.profit !== undefined ? totalProfit + Number(element.profit) : totalProfit;
        });
        console.log(totalProfit, "totalProfit")
        res.status(200).json({
            success: true,
            message: "Orders data is fetched successfully.",
            data: aggregatedData,
            metadata: {
                totalPrice: totalPrice.toFixed(2),
                totalRentalFees: totalRentalFees.toFixed(2),
                totalLendersShare: totalLendersShare.toFixed(2),
                totalExpenses: totalExpenses.toFixed(2),
                totalProfit: totalProfit.toFixed(2),

            }
        });



    } catch (error) {
        // Handle errors and send an error response back to the client
        console.error("Failed to fetch  order status:", error);
        res
            .status(500)
            .json({ success: false, error: "Failed to fetch order status", data: error });
    }
}


export { getOrderDeliveryStatus, newOrderStatus, updateOrderStatus, getDashboardOrders, updateOrderStatusChanges, updateOrderCustomFields }
