
import { Response, Request } from 'express';
import { IPermissions } from '../../../types/permission';
import permission from '../../../models/permission';



const getPermission = async (req: any, res: any) => {
    try {
        const roles: IPermissions[] = await permission.find();

        res.status(200).json({ count: roles.length, results: roles });
        return
    } catch (error) {

        throw error;
    }
};


const createPermission = async (req: Request, res: Response): Promise<void> => {
    try {
        const { body } = req;

        const roles = await permission.findOne({
            name: body.name,
        });

        if (roles) {

            res.status(400).json({
                message: 'Role Already Exists',
            });
            return;
        }
        const newRole: IPermissions = new permission({
            name: body.name,
        });

        const savedUser: IPermissions = await newRole.save();

        res.status(201).json({ message: 'Permission added', result: [savedUser] });
        return
    } catch (error) {

        res.status(400).json({ error });
        throw error;
    }
};
export { getPermission, createPermission }