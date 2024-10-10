
import { Response, Request } from 'express';
import { IWhatsappMessage } from '../../../types/whatsappMessage';
import WhatsappMessage from '../../../models/WhatsappMessage';
import markettingusers from '../../../models/markettingusers';



const getWhatsappMessages = async (req: any, res: any) => {
    try {
        const messages: IWhatsappMessage[] = await WhatsappMessage.find();

        res.status(200).json({ count: messages.length, results: messages });
        return
    } catch (error) {
        res.status(400).json({ message: 'Something went wrong', error });
    }
};
const getChatByUser = async (req: any, res: any) => {

    const { params: { id } } = req;
    let findUser = await markettingusers.findOne({ _id: id })

    console.log(findUser)
    const [usersList] = await Promise.all([
        // Fetch the paginated data
        WhatsappMessage.find({
            phone_number: findUser.phone_number
        })
            .sort({ updatedAt: 1 }) // Sort by updatedAt in descending order

    ]);


    res.status(200).json({ results: findUser, messages: usersList });

}




export { getWhatsappMessages, getChatByUser }