import { Request, Response } from "express";
import * as userService from "../../services/userService";

export const register = async (req: Request, res: Response) => {
  const user = await userService.register(req.body);
  res.json(user);
};

export const login = async (req: Request, res: Response) => {
  const user = await userService.login(req.body);
  res.json(user);
};
