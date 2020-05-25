import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Subject } from 'rxjs';

import { ServicesModule } from '../services.module';

import { apiConfig } from '../../../../shared/api.config';
import { AuthTokenDto } from '../../../../shared/auth/auth-token.dto';
import { Router } from '@angular/router';
import { User } from '../../../../shared/users/user';
import { Credentials } from '../../../../shared/auth/credentials';

@Injectable({
	providedIn: ServicesModule
})
export class AuthService {
	public onAuthStateChanged$: Subject<boolean> = new Subject();
	public onAuthError$: Subject<string> = new Subject();

	public user: User;

	private _authToken: string = null;

	get authToken(): string {
		return this._authToken;
	}

	set authToken(authToken: string) {
		this._authToken = authToken;
		if (this._authToken) {
			// success login
			this.user = new User();
			Object.assign(this.user, new JwtHelperService().decodeToken(this._authToken));
			localStorage.setItem('authToken', authToken);
			this.onAuthStateChanged$.next(true);
		} else {
			// failed log-in
			this.user = null;
			localStorage.removeItem('authToken');
			this.onAuthStateChanged$.next(false);
		}
	}

	constructor(private http: HttpClient, private router: Router) {
		this.authToken = localStorage.getItem('authToken');
	}

	//----------------------------------------------------------------
	/** Sends auth credentials to server and subscribes to response */
	public signUp(authCredentials: Credentials) {
		this.http.post<AuthTokenDto>(apiConfig.urlSignup, authCredentials).subscribe(
			// remember that authToken setter will call appropriate subject
			(dto) => {
				this.authToken = dto.token;
			},
			(err) => {
				this.authToken = null;

				if (
					err.error.statusCode === 409 // User exists
				)
					this.onAuthError$.next('User already exists.');
				if (
					err.error.statucCode === 400 // Bad request
				)
					this.onAuthError$.next('Some error occured. Check input.');
				if (
					err.error.statucCode === 500 // server error
				)
					this.onAuthError$.next('Some server side error. Try later.');
			}
		);
	}

	//-----------------------------
	/** Same as signup, actually */
	public login(authCredentials: Credentials) {
		this.http.post<AuthTokenDto>(apiConfig.urlLogin, authCredentials).subscribe(
			(dto) => {
				this.authToken = dto.token;
			},
			(err) => {
				if (err.error.statucCode !== 504) {
					this.authToken = null;
					this.onAuthError$.next('Invalid login or password.');
				} else {
					this.onAuthError$.next("Server isn't responding. Try later.");
				}
			}
		);
	}

	//----------------------------
	/** Checks auth token valid */
	public checkToken(authTokenDto?: AuthTokenDto) {
		if (!authTokenDto) authTokenDto = { token: this.authToken };

		this.http.post(apiConfig.urlTokenCheck, authTokenDto).subscribe(
			(dto: AuthTokenDto) => {
				this.authToken = dto.token;
			},
			(err) => {
				if (err.error.statucCode < 500) {
					this.authToken = null;
				}
			}
		);
	}

	//----------------------------
	/** Sets auth token to null */
	public logout() {
		this.authToken = null;
		this.router.navigate([ '' ]);
	}
}
