import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { Credentials } from '../../../../../shared/auth/credentials';

@Component({
	selector: 'app-auth',
	templateUrl: './auth.component.html',
	styleUrls: [ './auth.component.css' ]
})
export class AuthComponent implements OnInit, OnDestroy {
	// Work mode (log-in or sign-up)
	public mode = 'log-in';
	public isLoginMode = () => this.mode === 'log-in';
	public isSignupMode = () => !this.isLoginMode();
	public toggleMode = () => {
		this.mode = this.isLoginMode() ? 'sign-up' : 'log-in';
		this.authErrors = [];
	};

	// Model
	public credentials: Credentials = new Credentials();

	// Auth subscribtions
	private authStateChanged$: Subscription;
	private authErrors$: Subscription;

	// Auth errors
	public authErrors: string[] = [];
	public isAuthErrors = () => this.authErrors.length > 0;

	constructor(private authService: AuthService, private router: Router) {}

	ngOnInit(): void {
		this.authStateChanged$ = this.authService.onAuthStateChanged$.subscribe((state) => {
			if (state) this.router.navigate([ '' ]);
		});
		this.authErrors$ = this.authService.onAuthError$.subscribe((err) => {
			this.authErrors.push(err);
		});
	}

	ngOnDestroy(): void {
		this.authErrors$.unsubscribe();
		this.authStateChanged$.unsubscribe();
	}

	public submit(event: Event) {
		// we could be here only if SUBMIT which is enabled only
		// if form is valid. But we should manually check pass1 and pass2.
		this.authErrors = [];

		if (this.isLoginMode()) {
			// nothing to check here, go ahead!
			this.authService.login(this.credentials);
		} else {
			if (!this.credentials.isPasswordsEqual()) {
				event.preventDefault(); // stop submitting
				this.authErrors.push('Passwords must be equal.');
			} else {
				this.authService.signUp(this.credentials);
			}
		}
	}
}
