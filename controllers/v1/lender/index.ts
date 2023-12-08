import { Response, Request } from 'express';
import lender from '../../../models/lender';


const getLendersInfo = async (req: Request, res: Response): Promise<void> => {
    try {
            const page = Number(req.query.page) || 1;
            const size = Number(req.query.size) || 100;
            const searchAccName = req.query.searchAccName;
            let MatchQuery: any = {};
            if (searchAccName) MatchQuery.name = { $regex: searchAccName, $options: 'i' };


            const agg: any = [
                {
                    $match: MatchQuery,
                },
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        email: 1,
                        phone_number_call: 1,
                        phone_number_whatsapp: 1,
                        shopify_id: 1,
                        address: 1,
                        lender_details: 1
                    },
                },
                {
                    $facet: {
                        metadata: [{ $count: 'total' }, { $addFields: { page: Number(page) } }],
                        data: [{ $skip: (page - 1) * size }, { $limit: size }],
                    },
                },
            ];

            const aggregatedData: any = await lender.aggregate(agg);

            res.status(200).json(aggregatedData);
    } catch (error) {
        console.log(error);
        res.status(400).json({ error });
        throw error;
    }
};


export { getLendersInfo }
