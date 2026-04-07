import { Inject, Injectable } from '@angular/core';
import { IUserRepository } from '../interfaces/repository/user.repository.interface';
import { ICreateUserDto, IUpdateUserDto, IUser } from '../models/user.model';
import { Observable } from 'rxjs';

export const USER_REPOSITORY_TOKEN = 'IUserRepository';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    @Inject(USER_REPOSITORY_TOKEN) private repo: IUserRepository
  ) { }
  getUsers(): Observable<IUser[]> {
    return this.repo.getAll();
  }

  getUserById(id: string): Observable<IUser> {
    return this.repo.getById(id);
  }

  createUser(dto: ICreateUserDto): Observable<IUser> {
    return this.repo.create(dto);
  }

  updateUser(id: string, dto: IUpdateUserDto): Observable<IUser> {
    return this.repo.update(id, dto);
  }

  toggleUserStatus(id: string, isActive: boolean): Observable<void | IUser> {
    // Lógica simple: si está activo, desactivar; si no, activar.
    // Nota: El backend podría requerir el cuerpo vacío o algún flag.
    if (isActive) {
      return this.repo.deactivate(id);
    } else {
      return this.repo.activate(id);
    }
  }

  uploadAvatar(id: string, file: File): Observable<IUser> {
    return this.repo.uploadAvatar(id, file);
  }

  deleteAvatar(id: string): Observable<void> {
    return this.repo.deleteAvatar(id);
  }
}
