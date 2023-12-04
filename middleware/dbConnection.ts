import express, { Express } from 'express';
import mongoose, { ConnectOptions } from 'mongoose';

require('dotenv').config();

const PORT: string | number = process.env.PORT || 5000;
const { DB_USERNAME, DB_PASSWORD, DB_NAME, DB_HOST } = process.env;

const dbConnection = (app: any) => {
  const uri: string = `mongodb://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}?authSource=${DB_NAME}&w=1`;
  mongoose
    .connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as ConnectOptions)
    .then(() => app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`)))
    .catch(error => {
      console.log(`error : ${error}`);
      throw error;
    });
};
export { dbConnection };
