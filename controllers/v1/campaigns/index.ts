import { Response, Request } from 'express';
import contactlist from '../../../models/contactlist';
import { ICampaign } from '../../../types/campaign';
import campaign from '../../../models/campaign';
import { IMarketingUsers } from '../../../types/marketingusers';
import markettingusers from '../../../models/markettingusers';
import moment from 'moment';
import axios from 'axios';

var _ = require('lodash');
const { AUTHORIZATION_TOKEN, WHATSAPP_VERSION, WHATSAPP_PHONE_VERSION } = process.env;


const getCampaign = async (req: Request, res: Response): Promise<void> => {
    try {

        const contactList: ICampaign[] = await campaign.find().populate("contact_list");

        res.status(200).json({ count: contactList.length, results: contactList });

    } catch (error) {
        console.log(error);
        res.status(400).json({ error });
        throw error;
    }
};

const addCampaign = async (req: Request, res: Response): Promise<void> => {
    try {
        const { body } = req;

        const newCampaign: ICampaign = new campaign(body);

        const savedList: ICampaign = await newCampaign.save();

        res.status(201).json({ message: 'Campaign Created', result: [savedList] });
        return;
    } catch (error) {

        res.status(400).json({ message: 'Something went wrong', error });
        throw error;
    }
};

const updateCampaign = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            params: { id },
            body,
        } = req;

        let options = { new: true };

        const updatedList: ICampaign | null = await campaign.findByIdAndUpdate({ _id: id }, body, options);

        res.status(200).json({
            message: 'Campaign List updated',
            result: [updatedList],
        });
        return;
    } catch (error) {

        // res.status(400).json({ message: 'Something went wrong', error });
        // throw error;
    }
};



const deleteCampaign = async (req: Request, res: Response): Promise<void> => {
    try {
        const deletedList: ICampaign | null = await campaign.findByIdAndRemove(req.params.id);

        res.status(200).json({
            message: 'Campaign List deleted',
            result: [deletedList],
        });
        return;
    } catch (error) {

        res.status(400).json({ error });
        throw error;
    }
};


const sendCampaignMessages = async (req: Request, res: Response): Promise<void> => {
    try {
        let final_obj = []
        const oneMinuteAgo = moment().subtract(15, 'minutes').toISOString();
        const oneMinuteFromNow = moment().add(1, 'minutes').toISOString();

        const findCampaigns: ICampaign[] | null = await campaign.find({
            isActive: true,
            schedule_date: { $gte: oneMinuteAgo, $lte: oneMinuteFromNow }
        }).populate("contact_list");

        const findAllContacts: IMarketingUsers[] | null = await markettingusers.find({ whatsapp_messaging: true }).select("-user_data");


        const processCampaigns = async () => {
            const final_obj: any[] = [];

            await Promise.all(findCampaigns.map(async (campaign: any) => {
                if (campaign.contact_list.select_all === true) {
                    campaign.contact_list.phone_number = findAllContacts;
                }

                const result: any = await hasCurlyBraces(campaign.template);

                // Create an array of promises for each user
                const userPromises = campaign.contact_list.phone_number.map((user: any) => {

                    if (user?.info?.whatsapp_messaging === true || user?.whatsapp_messaging === true) {

                        let obj = {
                            ...campaign.template,
                            phone_number: user.value,
                            [result.key]: user[result.value] ?? user?.info?.[result.value]
                        };
                        // Push to final_obj inside the promise
                        if (obj.phone_number) sendDynamicMessage(obj);
                        final_obj.push(obj);
                    }
                });

                // Wait for all user promises to resolve
                await Promise.all(userPromises);
            }));

            res.status(200).json({
                message: final_obj.length > 0 ? 'Campaign found' : 'Campaign not found',
                result: [final_obj],
            });
        };
        processCampaigns();
        return;
    } catch (error) {

        res.status(400).json({ error });
        throw error;
    }
};


const hasCurlyBraces = (obj: any) => {
    const regex = /{{|}}/g;

    for (const key in obj) {
        if (typeof obj[key] === 'string' && regex.test(obj[key])) {

            obj[key] = obj[key].replace(regex, '');
            console.log(obj[key], "obj[key]")

            return { key: key, value: obj[key] };
        }
    }
    return false;
};

const sendDynamicMessage = (obj: any) => {
    delete obj.components;

    let headerImageUrl = "https://whatsappimagessiz.s3.eu-north-1.amazonaws.com/siz-logo.png"


    const getMatchingValues = (obj: any, searchText: any) => {
        // Use Object.entries to iterate over key-value pairs
        return Object.entries(obj)
            .filter(([key, value]) => key.includes(searchText)) // Filter based on the key
            .map(([key, value]) => value); // Extract values
    };
    const bodyParams = getMatchingValues(obj, 'placeholder');
    const headerParams = getMatchingValues(obj, 'header');
    const footerParams = getMatchingValues(obj, 'button');

    console.log(bodyParams, "bodyParams", headerParams, "headerParams", footerParams, "footerParams")

    let components = []
    headerParams.length > 0 &&
        components.push({
            "type": "header",
            parameters: headerParams.map(itm => ({ type: 'image', "image": { "link": itm } }))
            // "parameters": [
            //     { "type": "image", "image": { "link": headerImageUrl } }
            // ]
        });
    bodyParams.length > 0 &&
        components.push({
            type: 'body',
            parameters: bodyParams.map(itm => ({ type: 'text', text: itm }))
            // parameters: [
            //     { type: 'text', text: 'Deepak' },
            //   ]
        })
    footerParams.length > 0 &&
        components.push({
            type: 'button',
            sub_type: 'url',
            index: '0',
            parameters: footerParams.map(itm => ({ type: 'text', text: itm }))
        })


    setTimeout(() => {
        let payload = {
            messaging_product: 'whatsapp',
            to: '919405744310',
            type: 'template',
            template: {
                name: obj.label,
                language: {
                    code: obj.language,
                    policy: 'deterministic'
                },
                components: components
            }
        };

        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://graph.facebook.com/v17.0/105942389228737/messages',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + process.env.AUTHORIZATION_TOKEN,
            },
            data: payload
        };
        axios.request(config)
            .then((response) => {
                console.log(JSON.stringify(response.data));
            })
            .catch((error) => {
                console.log(error);
            });
    }, 5000)
}
export {
    getCampaign,
    addCampaign,
    deleteCampaign,
    updateCampaign,
    sendCampaignMessages,
    hasCurlyBraces
};
