import { Response, Request } from 'express';
import contactlist from '../../../models/contactlist';
import { ICampaign } from '../../../types/campaign';
import campaign from '../../../models/campaign';

var _ = require('lodash');


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



export {
    getCampaign,
    addCampaign,
    deleteCampaign,
    updateCampaign
};
