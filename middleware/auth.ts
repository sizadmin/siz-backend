const jwt = require('jsonwebtoken');
import { Response, Request } from 'express';
const { API_AUTH_TOKEN } = process.env;

const config = process.env;

import { basicLogger } from './logger';

const verifyToken = (req: any, res: Response, next: any) => {
  const { body } = req;
  const token = req.headers.authorization;
  if (!token) {
    basicLogger.error({
      controller: 'token verification',
      method: '',
      terror: 'A token is required for authentication',
    });
    return res.status(403).send('A token is required for authentication');
  }
  try {
    const decoded = jwt.verify(token, config.TOKEN_KEY);
    req.user = decoded;
  } catch (err) {
    basicLogger.error({
      controller: 'token verification',
      method: '',
      terror: `Invalid Token for ${req.url}`,
    });
    return res.status(401).send('Invalid Token');
  }
  basicLogger.info(
    {
      controller: 'token verification',
      terror: 'token verification done',
    },
    'token verification done'
  );
  return next();
};



const verifyTokenForApi = (req: any, res: Response, next: any) => {
  const authHeader = req.headers['authorization'];
  const auth_token = authHeader;
  console.log(req.headers,"auth_token",auth_token,authHeader)
  if (!auth_token) {
      return res.status(401).send({ message: 'Authorization token missing' });
  }
  const secretKey = process.env.TOKEN_KEY;
    return new Promise((resolve, reject) => {
      if (auth_token == null) {
        return reject({ status: 401, message: 'Unauthorized' });
      }
      console.log(auth_token);
      jwt.verify(auth_token, secretKey, { algorithms: ['HS256'] }, (err, decoded) => {
        if (err) {
          console.error('Token verification failed:', err.message);
          return reject({ status: 403, message: 'Forbidden' });
        }
        resolve(decoded);
        return next();
      });
    });
    
};

export { verifyToken,verifyTokenForApi };