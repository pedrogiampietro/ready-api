import { getTokenFromHeaders, verifyJwt } from "../utils/jwtHelper";
import { Request, Response, NextFunction } from "express";

interface AuthRequest extends Request {
  accountId?: any;
}

export const authenticateJWT = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = getTokenFromHeaders(req.headers);

  if (!token) {
    return res.json({ status: 401, message: "token malformed" });
  }

  try {
    const decoded = verifyJwt(token);

    req.accountId = decoded.id;
  } catch (err) {
    return res.status(400).json(err);
  }

  next();
};
