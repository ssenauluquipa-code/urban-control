export interface IUser {
  id: string;
  name: string;
  contactNumber: string;
  email: string;
  avatarUrl: string | null;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'USER' | 'EDITOR' | 'OPERADOR' | string; // Permitimos más roles y fallback de string
  isActive?: boolean; // Si el backend lo devuelve
}

export interface ICreateUserDto {
  email: string;
  password: string;
  name: string;
  contactNumber: string;
  role?: string;
}

export interface IUpdateUserDto {
  name?: string;
  contactNumber?: string;
  role?: string;
}

export interface IUpdateProfileDto {
  name?: string;
  contactNumber?: string;
  email?: string;
  newPassword?: string;
  currentPassword?: string;
}