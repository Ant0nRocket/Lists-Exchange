import { User } from '../../../shared/users/user';

export class UserEntity extends User {
	constructor() {
		super();
	}

	hashedPassword: string;

	salt: string;

	asPlainUserObject(): object {
		const { _id, username, email, mobilePhone } = this;
		const plainUserObject = {
			_id,
			username,
			email,
			mobilePhone
		};
		return plainUserObject;
	}
}
