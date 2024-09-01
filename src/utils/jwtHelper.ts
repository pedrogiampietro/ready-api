import "dotenv/config";
import jwt, { SignOptions, JwtPayload } from "jsonwebtoken";

const tokenPrivateKey = process.env.JWT_TOKEN_PRIVATE_KEY as string;
const refreshTokenPrivateKey = process.env
  .JWT_REFRESH_TOKEN_PRIVATE_KEY as string;

const options: SignOptions = { expiresIn: "7 days" };
const refreshOptions: SignOptions = { expiresIn: "30 days" };

interface Payload extends JwtPayload {
  id: string;
}

const generateJwt = (payload: Payload): string => {
  return jwt.sign(payload, tokenPrivateKey, options);
};

const generateRefreshJwt = (payload: Payload): string => {
  return jwt.sign(payload, refreshTokenPrivateKey, refreshOptions);
};

const verifyJwt = (token: string): Payload => {
  return jwt.verify(token, tokenPrivateKey) as Payload;
};

const verifyRefreshJwt = (token: string): Payload => {
  return jwt.verify(token, refreshTokenPrivateKey) as Payload;
};

const getTokenFromHeaders = (headers: any): string | null => {
  const token = headers["authorization"];
  return token ? token.slice(7, token.length) : null;
};

export {
  generateJwt,
  verifyJwt,
  generateRefreshJwt,
  verifyRefreshJwt,
  getTokenFromHeaders,
};
