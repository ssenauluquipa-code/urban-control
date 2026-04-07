import { Observable } from "rxjs";
import { ICreateUserDto, IUpdateUserDto, IUser } from "../../models/user.model";

export interface IUserRepository {
    create(dto: ICreateUserDto): Observable<IUser>;
    getAll(): Observable<IUser[]>;
    getById(id: string): Observable<IUser>;
    update(id: string, dto: IUpdateUserDto): Observable<IUser>;
    deactivate(id: string): Observable<void>;
    activate(id: string): Observable<void>;
    uploadAvatar(id: string, file: File): Observable<IUser>; // Requiere manejo especial de FormData
    deleteAvatar(id: string): Observable<void>;
}
