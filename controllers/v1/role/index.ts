import { basicLogger } from "../../../middleware/logger";
import role from "../../../models/role";
import { IRole } from "../../../types/role";

import { Response, Request } from 'express';



const getRoles = async (req: any, res: any) => {
    try {
        const roles: IRole[] = await role.find();
        basicLogger.info(
            {
                controller: 'Get All Roles',
                terror: 'Get All Roles done',
                method: 'GET'
            },
            'Get All Roles done'
        );
        res.status(200).json({ count: roles.length, results: roles });

        return
    } catch (error) {
        basicLogger.error({
            controller: 'Get All Roles',
            method: 'GET',
            terror: `Error for ${req.url}`,
            error: error
        });
        res.status(400).json({ error });

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
            basicLogger.info(
                {
                    controller: 'Create New Role',
                    terror: ' New Role already exist',
                    method: 'POST'
                },
                'New Role Exist'
            );
            return;
        }

        const newRole: IRole = new role({
            role_name: body.name,
        });

        const savedUser: IRole = await newRole.save();
        basicLogger.info(
            {
                controller: 'Create New Role',
                terror: 'Create New Role done',
                method: 'POST'
            },
            'New Role Added'
        );
        res.status(201).json({ message: 'Role added', result: [savedUser] });
        return
    } catch (error) {
        basicLogger.error({
            controller: 'Create New Role',
            method: 'POST',
            terror: `Error for ${req.url}`,
            error: error
        });
        res.status(400).json({ error });
        throw error;
    }
};
export { getRoles, createRole }