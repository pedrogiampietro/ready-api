import { Request, Response } from "express";
import * as userService from "../../services/userService";
import { uploadToS3 } from "../../middlewares/clouds3";
import { deleteFromS3, getSignedUrlForKey } from "../../utils";

export const register = async (req: Request, res: Response) => {
  const user = await userService.register(req.body);
  res.json(user);
};

export const login = async (req: Request, res: Response) => {
  const user = await userService.login(req.body);
  res.json(user);
};

export const updateProfile = async (req: Request, res: Response) => {
  const { userId, name } = req.body;

  try {
    const user = await userService.getUserById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Usuário não encontrado." });
    }

    let avatarKey = null;
    let signedUrl = null;

    if (req.file && req.file.buffer) {
      avatarKey = `avatars/${req.file.originalname}`;
      await uploadToS3(req.file, process.env.BUCKET_NAME, avatarKey);
      signedUrl = await getSignedUrlForKey(avatarKey);

      if (user?.data?.avatar_url) {
        try {
          await deleteFromS3(
            process.env.BUCKET_NAME as string,
            user.data.avatar_url
          );
        } catch (deleteError) {
          console.error("Error deleting old avatar:", deleteError);
        }
      }
    }

    const userData = {
      name,
      avatar_url: avatarKey || user?.data?.avatar_url,
      bucket_url: signedUrl || user?.data?.bucket_url,
    };

    const updatedUser = await userService.updateProfile(userId, userData);

    if (updatedUser.success) {
      return res.json({
        name: updatedUser.data?.name,
        avatar_url: avatarKey,
        bucket_url: signedUrl,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Erro ao atualizar perfil.",
      });
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao atualizar perfil.",
    });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const response = await userService.forgotPassword(email);
    return res.status(200).json(response);
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const verifyResetPasswordCode = async (req: Request, res: Response) => {
  const { email, code } = req.body;

  try {
    const response = await userService.verifyResetPasswordCode(email, code);
    return res.status(200).json(response);
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, code, newPassword } = req.body;

  try {
    const response = await userService.resetPassword(email, code, newPassword);
    return res.status(200).json(response);
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
