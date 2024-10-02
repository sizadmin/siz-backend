import { Response, Request } from 'express';
import contactlist from '../../../models/contactlist';
import { IContactList } from '../../../types/conatctlist';

// var _ = require('lodash');


const getContactList = async (req: Request, res: Response): Promise<void> => {
    try {

        const contactList: IContactList[] = await contactlist.find().sort({ updatedAt: -1 }) // Sort by updatedAt in descending order

        res.status(200).json({ count: contactList.length, results: contactList });

    } catch (error) {
        console.log(error);
        res.status(400).json({ error });
        throw error;
    }
};

const addContactList = async (req: Request, res: Response): Promise<void> => {
    try {
        const { body } = req;

        const newContactList: IContactList = new contactlist(body);

        const savedList: IContactList = await newContactList.save();

        res.status(201).json({ message: 'Contact List Created', result: [savedList] });
        return;
    } catch (error) {

        res.status(400).json({ message: 'Something went wrong', error });
        throw error;
    }
};

const updateContactList = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            params: { id },
            body,
        } = req;

        let options = { new: true };

        const updatedList: IContactList | null = await contactlist.findByIdAndUpdate({ _id: id }, body, options);

        res.status(200).json({
            message: 'Contact List updated',
            result: [updatedList],
        });
        return;
    } catch (error) {

        // res.status(400).json({ message: 'Something went wrong', error });
        // throw error;
    }
};



const deleteContactList = async (req: Request, res: Response): Promise<void> => {
    try {
        const deletedList: IContactList | null = await contactlist.findByIdAndRemove(req.params.id);

        res.status(200).json({
            message: 'Conatct List deleted',
            result: [deletedList],
        });
        return;
    } catch (error) {

        res.status(400).json({ error });
        throw error;
    }
};



export {
    getContactList,
    addContactList,
    deleteContactList,
    updateContactList
};
