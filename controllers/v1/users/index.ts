import { Response, Request } from 'express';
import { IUser } from '../../../types/user';
import Role from '../../../models/role';
import User from '../../../models/user';
import { ObjectId } from 'mongodb';
import lender from '../../../models/lender';
import { ILender } from '../../../types/lender';
import { transporter } from '../../../middleware/helperFuc';
import user from '../../../models/user';

var _ = require('lodash');
const bcrypt = require('bcryptjs');

const crypto = require('crypto');

const jwt = require('jsonwebtoken');
const CONFIG = process.env;



const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        if (req.query.client !== undefined && req.query.client == 'true') {
            let users: IUser[] = await User.find().select('-password ').populate('role permissions').sort({ account_name: 1 });
            users = await _.filter(users, function (o: any) {
                return o.role?.role_name == 'Client';
            });

            res.status(200).json({ results: users });
            return;
        } else {
            const page = Number(req.query.page) || 1;
            const size = Number(req.query.size) || 100;
            const searchAccName = req.query.searchAccName;
            let MatchQuery: any = {};
            if (searchAccName) MatchQuery.account_name = { $regex: searchAccName, $options: 'i' };


            const agg: any = [
                {
                    $match: MatchQuery,
                },
                {
                    $project: {
                        _id: 1,
                        email: 1,
                        first_name: 1,
                        isActive: 1,
                        last_name: 1,
                        phone_number: 1,
                        role: 1,
                        address: 1,
                        lender_info: 1,
                        username: 1,
                        lender_type: 1,
                        permission: 1
                    },
                },
                { $lookup: { from: 'roles', localField: 'role', foreignField: '_id', as: 'role' } },
                { $lookup: { from: 'lenders', localField: 'lender_info', foreignField: '_id', as: 'lender_info' } },
                { $lookup: { from: 'permissions', localField: 'permission', foreignField: '_id', as: 'permission' } },
                { $sort: { updatedAt: 1 } },
                {
                    $facet: {
                        metadata: [{ $count: 'total' }, { $addFields: { page: Number(page) } }],
                        data: [{ $skip: (page - 1) * size }, { $limit: size }],
                    },
                },
            ];

            const aggregatedData: any = await User.aggregate(agg);
            const users: any = {};
            users.data = aggregatedData[0].data.map((user: any) => ({ ...user, role: user.role[0] }));
            users.metadata = aggregatedData[0].metadata;
            res.status(200).json({ metadata: users.metadata, results: users.data });
        }
    } catch (error) {
        console.log(error);
        res.status(400).json({ error });
        throw error;
    }
};

const addUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { body } = req;

        // let roles: any = await Role.find({ _id: new ObjectId(body.role) });


        const user = await User.findOne({
            email: body.email,
        });

        if (user) {

            res.status(400).json({
                message: 'Users Already Exists',
            });
            return;
        }
        // let roles: any = await lender.find({ _id: new ObjectId(body.role) });

        const newLenderInfo: ILender = new lender({
            name: body.first_name + ' ' + body.last_name,
            email: body.email,
            phone_number_call: body.phone_number,
            phone_number_whatsapp: body.phone_number_whatsapp,
            shopify_id: body.shopify_id,
            address: body.address,
            account_number: body.account_number,
            iban_number: body.iban_number,
            swift_code: body.swift_code,
            account_name: body.account_name,
            permission: body.permission
        });
        const savedLenderInfo: ILender = await newLenderInfo.save();
        console.log(savedLenderInfo, "savedLenderInfo")

        const newUser: IUser = new User({
            first_name: body.first_name,
            last_name: body.last_name,
            email: body.email,
            phone_number: body.phone_number,
            role: body.role,
            isActive: body.isActive,
            lender_info: new ObjectId(savedLenderInfo._id),
            address: body.address,
            username: body.username,
            lender_type: body.lender_type,
            permission: body.permission
        });
        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(body.password, salt);

        const savedUser: IUser = await newUser.save();

        res.status(201).json({ message: 'User added', result: [savedUser] });
        return;
    } catch (error) {

        res.status(400).json({ message: 'Something went wrong', error });
        throw error;
    }
};

const updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            params: { id },
            body,
        } = req;
        if (body.password) {
            const salt = await bcrypt.genSalt(10);
            body.password = await bcrypt.hash(body.password, salt);
        }
        let options = { new: true };


        let lenderBody = {
            // lender_id: body.lender_id,
            name: body.first_name + ' ' + body.last_name,
            email: body.email,
            phone_number_call: body.phone_number,
            phone_number_whatsapp: body.phone_number_whatsapp,
            shopify_id: body.shopify_id,
            address: body.address,
            account_number: body.account_number,
            iban_number: body.iban_number,
            swift_code: body.swift_code,
            account_name: body.account_name,
            // permission: body.permission
        };
        if (body.lender_info) {
            const savedLenderInfo: ILender | null = await lender.findByIdAndUpdate({ _id: body.lender_info }, lenderBody, options).select('-password');
        }

        let userBody = {
            first_name: body.first_name,
            last_name: body.last_name,
            email: body.email,
            phone_number: body.phone_number,
            role: new ObjectId(body.role),
            isActive: body.isActive,
            lender_info: body.lender_info ? new ObjectId(body.lender_info) : null,
            address: body.address,
            username: body.username,
            lender_type: body.lender_type,
            password: body.password,
            permission: body.permission
        };

        const updateUser: IUser | null = await User.findByIdAndUpdate({ _id: id }, userBody, options).select('-password').populate('lender_info role permission');


        res.status(200).json({
            message: 'User updated',
            result: updateUser,
        });
        return;
    } catch (error) {

        res.status(400).json({ message: 'Something went wrong', error });
        // throw error;
    }
};



const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const deletedUser: IUser | null = await User.findByIdAndRemove(req.params.id);

        res.status(200).json({
            message: 'User deleted',
            result: [deletedUser],
        });
        return;
    } catch (error) {

        res.status(400).json({ error });
        throw error;
    }
};

const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { body } = req;

        let loggedUser: IUser | null = await User.findOne({
            username: body.username,
        }).populate('role permission');
        if (!loggedUser) {

            res.status(400).json({
                message: 'Incorrect Email/Password',
            });
            return;
        }
        if (loggedUser.isActive === false) {
            res.status(400).json({
                message: 'Your account has been disabled please contact the administrator.',
            });
            return;
        }
        //   compare the saved password with login Password

        const isMatch = await bcrypt.compare(body.password, loggedUser.password);

        if (!isMatch) {

            res.status(400).json({
                message: 'Incorrect Email/Password',
            });
            return;
        }
        const payload = {
            user: loggedUser,
        };

        //   generating the Token
        jwt.sign(
            payload,
            CONFIG.TOKEN_KEY,
            {
                expiresIn: '300m',
            },

            (err: any, token: Response) => {
                if (err) {

                    res.status(400).json({
                        message: 'Incorrect Email/Password',
                    });
                    throw err;
                }

                User.findOneAndUpdate({ _id: loggedUser._id }, { lastLogin: new Date() })
                    .populate('role lender_info permission')
                    .then(ud => {
                        return res.status(200).json({
                            token,
                            loggedUser: ud,
                        });
                    });
            }
        );
    } catch (error) {

        res.status(400).json({ error });
        throw error;
    }
};

const forgotPassword = async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;

    try {
        // Email content
        const mailOptions = {
            from: 'deepakbhangaledeveloper@gmail.com', // Your verified email address
            to: email, // Recipient email
            subject: 'Password Reset Request',
            text: `You requested for a password reset. Please use the following link to reset your password: http://localhost:3000/reset-password?email=${email}`,
            html: `
          <p>You requested for a password reset.</p>
          <p>Please use the following link to reset your password:</p>
          <a href="http://localhost:3000/reset-password?email=${email}">Reset Password</a>
        `,
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);
        res.status(200).json({
            message: 'Password reset email sent successfully!',
            info,
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: 'Error sending email',
            error,
        });
    }
}

const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { params: { id } } = req;
        const userFound: IUser[] = await user.find({ _id: id }).populate("role permission");

        res.status(200).json({ message: 'Data fetched Successfully', results: userFound });

    } catch (error) {
        console.log(error);
        res.status(400).json({ error });
        throw error;
    }
};



export {
    getUsers,
    addUser,
    deleteUser,
    loginUser,
    updateUser,
    forgotPassword,
    getUserById
};
