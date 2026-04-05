export interface IUser {
  id: string;
  name: string;
  contactNumber: string;
  email: string;
  avatarUrl: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'USER'; // Ajusta según tus roles reales
}

export interface ICreateUserDto {
  email: string;
  password: string;
  name: string;
  contactNumber: string;
  role?: string;
}

export interface IUpdateUserDto {
  role?: string;
  // Agrega otros campos permitidos para actualizar por admin
}

export interface IUpdateProfileDto {
  name?: string;
  contactNumber?: string;
  email?: string;
  newPassword?: string;
  currentPassword?: string;
}