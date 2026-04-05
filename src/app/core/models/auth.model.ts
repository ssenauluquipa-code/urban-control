export interface ILoginRequest {
  email: string;
  password: string;
}

export interface ILoginResponse {
  accessToken: string;
  refreshToken: string;
  //user: IUser;
}
export interface IUserSession {
  access_token: string;
  fullName?: string;
  role?: string;
  email?: string;
  id?: number;
}
export interface IAuthUser {
  name: string;
  email: string;
  role: string;
}

export interface IAuthResponse {
  token: string;
  user: IAuthUser;
}
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'VENDEDOR' | 'CLIENTE';
