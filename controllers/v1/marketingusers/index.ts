import { Response, Request } from 'express';
import markettingusers from '../../../models/markettingusers';
import { IMarketingUsers } from '../../../types/marketingusers';
import axios from 'axios';
import csv from 'csv-parser';
import { Readable } from 'stream'; // To convert string to a stream
var _ = require('lodash');
import fs from 'fs';
import path from 'path';



const getMarketingUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const searchAccName: any = req.query.value;

        let searchCriteria = [{ first_name: new RegExp(searchAccName, 'i') },
        { email: new RegExp(searchAccName, 'i') },];
        if (!searchAccName) {
            searchCriteria.push({ first_name: null }
            )
        }
        const usersList: IMarketingUsers[] = await markettingusers.find(
            {
                whatsapp_messaging: true,
                $or: searchCriteria
            }
        ).sort({ updatedAt: -1 }); // Sort by updatedAt in descending order


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

        const checkUserExist: IMarketingUsers[] = await markettingusers.findOne({ phone_number: body.phone_number });


        if (checkUserExist) {

            res.status(400).json({
                message: 'User Already Exists with provided phone number',
            });
            return;
        }


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

const fetchContactsFromCSVFile = async (req: any, res: any): Promise<void> => {

    try {
        if (!req.file) {
            res.status(400).send('No file uploaded.');
        }

        const filePath = req.file.path; // Get the uploaded file's path
        const results = [];
        let newUsers = [];

        const createNewUser = async (data: any) => {
            const checkUserExist: IMarketingUsers[] = await markettingusers.findOne({ phone_number: data.phone_number });

            if (!checkUserExist) {
                const newUser: IMarketingUsers = new markettingusers(data);

                const savedList: IMarketingUsers = await newUser.save();

                console.log(savedList, "checkUserExist")
                return savedList

            }
        }
        // Read and parse the CSV file
        fs.createReadStream(filePath)
            .pipe(csv()) // Pipe the file into csv-parser
            .on('data', async (data) =>
                results.push(data)

            ) // Push parsed rows into the results array
            .on('end', async () => {
                // Remove the file after processing
                fs.unlinkSync(filePath);

                for (const user of results) {
                    let newUser = await createNewUser(user); // Wait for each user to be saved before proceeding
                    if (newUser) newUsers.push(newUser)
                }
                // Respond with the parsed CSV data
                res.json({
                    message: 'CSV processed successfully!',
                    data: newUsers,
                });

            })
            .on('error', (err) => {
                // Handle any errors during file reading or parsing
                res.status(500).json({ error: 'Error reading the CSV file', details: err });
            });
    } catch (error) {
        console.log(error);
    }
};


export {
    getMarketingUsers,
    addMarketingUser,
    deleteMarketingUser,
    updateMarketingUser,
    fetchMarketingUsers,
    fetchContactsFromCSVFile
};
