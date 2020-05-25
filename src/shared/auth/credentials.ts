import { User } from '../users/user';

export class Credentials extends User {
	constructor() {
		super();
	}

	password: string;
	password2: string;

	isPasswordsEqual(): boolean {
		if (!this.password || !this.password2) return false;
		if (this.password !== this.password2) return false;
		return true;
	}

	get someId(): string {
		return this.getSomeId();
	}

	set someId(someId: string) {
		this.setSomeId(someId);
	}
}
