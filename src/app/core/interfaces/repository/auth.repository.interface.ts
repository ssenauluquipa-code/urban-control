import { Observable } from "rxjs";
import { ILoginResponse, ILoginDto, RefreshTokenDto } from "../../models/auth.model";
import { IUpdateProfileDto, IUser } from "../../models/user.model";
export const AUTH_REPOSITORY_TOKEN = 'IAuthRepository';

export interface IAuthRepository {
    login(credentials: ILoginDto): Observable<ILoginResponse>;
    logout(): Observable<void>;
    refresh(data: RefreshTokenDto): Observable<ILoginResponse>;
    getLoggedUser(): Observable<IUser>;
    updateLoggedUser(data: IUpdateProfileDto): Observable<IUser>;
}
