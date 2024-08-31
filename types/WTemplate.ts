import { Date, Document, Schema } from 'mongoose';

export interface IWTemplate extends Document {
    name: string;
    language: string;
    status: string;
    body: string;
    headerEnabled: boolean;
    headerImageUrl: string;
    buttonEnabled: boolean;
    buttons: any;
    templateId:string
    headerText:string
    imageMediaCode:string
}