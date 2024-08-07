import { Request, Response } from "express";
import * as userService from "../../services/userService";
import { uploadToS3 } from "../../middlewares/clouds3";
import { randomUUID as uuidv4 } from "node:crypto";

export const register = async (req: Request, res: Response) => {
  const user = await userService.register(req.body);
  res.json(user);
};

export const login = async (req: Request, res: Response) => {
  const user = await userService.login(req.body);
  res.json(user);
};

export const updateProfile = async (req: any, res: Response) => {
  const { userId } = req.body;

  try {
    let avatarKey = null;
    if (req.file && req.file.path) {
      avatarKey = `avatars/${uuidv4()}-${req.file.originalname}`;
      await uploadToS3(req.file, process.env.BUCKET_NAME, avatarKey);
    }

    const userData = {
      ...req.body,
      avatar_url: avatarKey || req.body.avatar,
    };

    const user = await userService.updateProfile(userId, userData);

    if (user.success) {
      res.json(user);
    } else {
      res.status(400).json(user);
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao atualizar perfil.",
    });
  }
};
