export interface IUser {
  id: string;
  name: string;
  contactNumber: string;
  email: string;
  avatarUrl: string | null;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | string; // Permitimos más roles y fallback de string
  isActive?: boolean; // Si el backend lo devuelve
  asesorId?: string;
}

export interface ICreateUserDto {
  email: string;
  password: string;
  name: string;
  contactNumber: string;
  role?: string;
  asesorId?: string;
}

export interface IUpdateUserDto {
  name?: string;
  contactNumber?: string;
  role?: string;
  asesorId?: string;
}

export interface IUpdateProfileDto {
  name?: string;
  contactNumber?: string;
  email?: string;
  newPassword?: string;
  currentPassword?: string;
}