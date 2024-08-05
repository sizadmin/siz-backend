import { Response, Request } from 'express';
import markettingusers from '../../../models/markettingusers';
import { IMarketingUsers } from '../../../types/marketingusers';
import axios from 'axios';

var _ = require('lodash');
const bcrypt = require('bcryptjs');

const crypto = require('crypto');

const jwt = require('jsonwebtoken');
const CONFIG = process.env;



const getMarketingUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const searchAccName: any = req.query.value;
        const usersList: IMarketingUsers[] = await markettingusers.find(
            {
                whatsapp_messaging: true,
                $or: [
                    { first_name: new RegExp(searchAccName, 'i') },
                    { email: new RegExp(searchAccName, 'i') },
                    { address: new RegExp(searchAccName, 'i') }
                ]
            }

        );

        res.status(200).json({ count: usersList.length, results: usersList });

    } catch (error) {
        console.log(error);
        res.status(400).json({ error });
        throw error;
    }
};

const addMarketingUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { body } = req;


        const newUser: IMarketingUsers = new markettingusers(body);

        const savedList: IMarketingUsers = await newUser.save();

        res.status(201).json({ message: 'User Created', result: [savedList] });
        return;
    } catch (error) {

        res.status(400).json({ message: 'Something went wrong', error });
        throw error;
    }
};

const updateMarketingUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            params: { id },
            body,
        } = req;

        let options = { new: true };

        // let userBody = {
        //     full_name: body.name,
        //     isActive: body.isActive,
        //     phone_numbers: body.phone_numbers,

        // };

        const updateUser: IMarketingUsers | null = await markettingusers.findByIdAndUpdate({ _id: id }, body, options);

        res.status(200).json({
            message: 'User updated',
            result: [updateUser],
        });
        return;
    } catch (error) {

        // res.status(400).json({ message: 'Something went wrong', error });
        // throw error;
    }
};



const deleteMarketingUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const deleteUser: IMarketingUsers | null = await markettingusers.findByIdAndRemove(req.params.id);

        res.status(200).json({
            message: 'User deleted',
            result: [deleteUser],
        });
        return;
    } catch (error) {

        res.status(400).json({ error });
        throw error;
    }
};

const fetchMarketingUsers = async (req: Request, res: Response): Promise<void> => {
    try {

        let url = `http://app.siz.ae:4202/account/all_active_users`;

        let config = {
            headers: {
                Authorization: "Bearer " + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywicm9sZSI6ImFkbWluIiwiaWF0IjoxNzIxNDgyMjg4fQ.mEaofSGKNrV5zE05BSQjskadLkdNW2sP7EQMZCbOL-U',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        };
        const response = await axios.post(url, {}, config);

        try {
            response.data.list.map(async (rec: any) => {
                let payload = {
                    full_name: rec.full_name,
                    first_name: rec.first_name,
                    last_name: rec.last_name,
                    phone_number: rec.phone,
                    whatsapp_messaging: true,
                    user_data: rec
                }
                const existingUser = await markettingusers.findOne({ phone_number: rec.phone });
                if (existingUser) return
                else {

                    const newUser: IMarketingUsers = new markettingusers(payload);

                    const savedList: IMarketingUsers = await newUser.save();
                }

            })
        } catch (e) {
        }



        res.status(200).json({ message: "Contact Synchronization Started" });

    } catch (error) {
        console.log(error);
        res.status(400).json({ error });
        throw error;
    }
};


export {
    getMarketingUsers,
    addMarketingUser,
    deleteMarketingUser,
    updateMarketingUser,
    fetchMarketingUsers
};
