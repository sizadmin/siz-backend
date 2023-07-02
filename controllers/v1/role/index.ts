import role from "../../../models/role";
import { IRole } from "../../../types/role";

import { Response, Request } from 'express';



const getRoles = async (req: any, res: any) => {
    try {
        const roles: IRole[] = await role.find();

        res.status(200).json({ count: roles.length, results: roles });
        return
    } catch (error) {

        throw error;
    }
};


const createRole = async (req: Request, res: Response): Promise<void> => {
    try {
        const { body } = req;

        const roles = await role.findOne({
            role_name: body.name,
        });

        if (roles) {

            res.status(400).json({
                message: 'Role Already Exists',
            });
            return;
        }
        const newRole: IRole = new role({
            role_name: body.name,
        });

        const savedUser: IRole = await newRole.save();

        res.status(201).json({ message: 'Role added', result: [savedUser] });
        return
    } catch (error) {

        res.status(400).json({ error });
        throw error;
    }
};
export { getRoles,createRole }