import { Injectable } from "@angular/core";
import { IUserRepository } from "../interfaces/repository/user.repository.interface";
import { ICreateUserDto, IUpdateUserDto, IUser } from "../models/user.model";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { HttpClient } from "@angular/common/http";

@Injectable({
    providedIn: 'root'
})
export class UserRepository implements IUserRepository {

    private readonly api_url = `${environment.apiUrl}`;

    constructor(private readonly http: HttpClient) {}
   
    getAll(): Observable<IUser[]> {
        return this.http.get<IUser[]>(`${this.api_url}/user`);
    }

    getById(id: string): Observable<IUser> {
        return this.http.get<IUser>(`${this.api_url}/user/${id}`);
    }

    create(dto: ICreateUserDto): Observable<IUser> {
        return this.http.post<IUser>(`${this.api_url}/user`, dto);
    }

    update(id: string, dto: IUpdateUserDto): Observable<IUser> {
        return this.http.patch<IUser>(`${this.api_url}/user/${id}`, dto);
    }

    deactivate(id: string): Observable<void> {
        return this.http.delete<void>(`${this.api_url}/user/${id}`);
    }

    activate(id: string): Observable<void> {
        // Ojo: El swagger indica PATCH /user/{id}/activate
        return this.http.patch<void>(`${this.api_url}/user/${id}/activate`, {});
    }
    uploadAvatar(id: string, file: File): Observable<IUser> {
        const formData = new FormData();
        // El nombre 'file' debe coincidir con lo que espera el backend en NestJS (usualmente @Body('file'))
        formData.append('avatar', file);

        return this.http.post<IUser>(`${this.api_url}/user/${id}/avatar`, formData);
    }

    deleteAvatar(id: string): Observable<void> {
        return this.http.delete<void>(`${this.api_url}/user/${id}/avatar`);
    }

   
    
}
