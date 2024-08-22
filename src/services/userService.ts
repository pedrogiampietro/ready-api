import { User } from "@prisma/client";
import * as userRepository from "../repositories/userRepository";
import { sendEmail } from "../utils/nodemailer";

export const register = async (userData: User) => {
  return await userRepository.create(userData);
};

export const login = async (credentials: {
  email: string;
  password: string;
}) => {
  return await userRepository.findByCredentials(credentials);
};

export const updateProfile = async (
  userId: string,
  updateData: Partial<User>
) => {
  return await userRepository.update(userId, updateData);
};

export const getUserById = async (userId: string) => {
  return await userRepository.findById(userId);
};

export const forgotPassword = async (email: string) => {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new Error("Usuário não encontrado.");
  }

  const resetCode = await userRepository.setResetPasswordCode(user);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                color: #333;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .header {
                font-size: 24px;
                font-weight: bold;
                color: #FF7029;
                text-align: center;
                margin-bottom: 20px;
            }
            .content {
                font-size: 18px;
                line-height: 1.6;
            }
            .code {
                font-size: 24px;
                font-weight: bold;
                text-align: center;
                margin: 20px 0;
                padding: 10px;
                background-color: #f8f8f8;
                border: 1px solid #ddd;
                border-radius: 4px;
            }
            .footer {
                text-align: center;
                font-size: 14px;
                color: #777;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                Ready Travel App
            </div>
            <div class="content">
                <p>Olá,</p>
                <p>Você solicitou a redefinição da sua senha. Use o código abaixo para continuar o processo:</p>
                <div class="code">
                    ${resetCode}
                </div>
                <p>Se você não solicitou essa alteração, por favor ignore este e-mail.</p>
            </div>
            <div class="footer">
                &copy; 2024 Ready Travel App. Todos os direitos reservados.
            </div>
        </div>
    </body>
    </html>
  `;

  await sendEmail(
    email,
    "Recuperação de Senha",
    `Use este código para redefinir sua senha: ${resetCode}`,
    htmlContent
  );

  return {
    success: true,
    message: "Código de recuperação de senha enviado com sucesso.",
  };
};

export const verifyResetPasswordCode = async (email: string, code: string) => {
  const user = await userRepository.verifyResetPasswordCode(email, code);
  if (!user) {
    throw new Error("Código inválido ou expirado.");
  }

  return {
    success: true,
    message: "Código verificado com sucesso.",
  };
};

export const resetPassword = async (
  email: string,
  code: string,
  newPassword: string
) => {
  const user = await userRepository.verifyResetPasswordCode(email, code);
  if (!user) {
    throw new Error("Código inválido ou expirado.");
  }

  await userRepository.updatePassword(email, newPassword);

  return {
    success: true,
    message: "Senha redefinida com sucesso.",
  };
};
