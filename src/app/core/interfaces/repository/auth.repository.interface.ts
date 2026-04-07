import { Observable } from "rxjs";
import { ILoginResponse, ILoginDto, RefreshTokenDto } from "../../models/auth.model";
import { IUpdateProfileDto, IUser } from "../../models/user.model";

export interface IAuthRepository {
    login(credentials: ILoginDto): Observable<ILoginResponse>;
    logout(): Observable<void>;
    refreshTokens(data: RefreshTokenDto): Observable<ILoginResponse>;
    getLoggedUser(): Observable<IUser>;
    updateProfile(data: IUpdateProfileDto): Observable<IUser>;
}
