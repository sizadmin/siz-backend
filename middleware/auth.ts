const jwt = require('jsonwebtoken');
import { Response, Request } from 'express';
const { API_AUTH_TOKEN } = process.env;

const config = process.env;

import { basicLogger } from './logger';

const verifyToken = (req: any, res: Response, next: any) => {
  const { body } = req;
  const token = req.headers.authorization;
  console.log(token,"ggg")
  if (!token) {
    basicLogger.error({
      controller: 'token verification',
      method: '',
      terror: 'A token is required for authentication',
    });
    return res.status(403).send('A token is required for authentication');
  }
  try {
    const decoded = jwt.verify(token, process.env.API_AUTH_TOKEN);
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

export { verifyToken };
