
import { Response, Request } from 'express';
import { IWhatsappMessage } from '../../../types/whatsappMessage';
import WhatsappMessage from '../../../models/WhatsappMessage';



const getWhatsappMessages = async (req: any, res: any) => {
    try {
        const messages: IWhatsappMessage[] = await WhatsappMessage.find();

        res.status(200).json({ count: messages.length, results: messages });
        return
    } catch (error) {
        res.status(400).json({ message: 'Something went wrong', error });
    }
};



export { getWhatsappMessages }