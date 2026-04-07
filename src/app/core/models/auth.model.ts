import { IUser } from "./user.model";

// Respuesta del Login
export interface ILoginResponse {
  accessToken: string;
  refreshToken: string;
  user: IUser;
}

// Cuerpo de la petición de login
export interface ILoginDto {
  email: string;
  password: string;
}

// Para el refresh token
export interface RefreshTokenDto {
  refreshToken: string;
}