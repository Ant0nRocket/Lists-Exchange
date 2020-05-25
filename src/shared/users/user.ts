import { IsEmail, Matches, IsMobilePhone, IsOptional, IsNumber } from 'class-validator';
import { isEmail, isMobilePhone } from 'class-validator';
import { apiConfig } from '../api.config';

/** Represents basic User entity */
export class User {
	/** Provide username, email or mobile */
	constructor(someId?: string) {
		if (someId) this.setSomeId(someId);
	}

	/** 
	 * MongoDB styled ID. Do not provide it yourself!
	 * It will be set my MongoDB when user created.
	 */
	_id: string;

	@IsOptional()
	@Matches(apiConfig.usernameRegex, {
		message: 'Username has forbidden chars'
	})
	username?: string;

	@IsOptional()
	@IsEmail()
	email?: string;

	@IsOptional()
	@IsMobilePhone()
	mobilePhone?: string;

	//----------------------------------------------------------
	/** 
     * User may provide it's name, email or mobile.
     * You can use this function to automaticaly assign [someId]
     * to apropriate class field.
     */
	public setSomeId = (someId: string) => {
		this.email = isEmail(someId) ? someId : this.email || null;

		this.mobilePhone = isMobilePhone(someId) ? someId : this.mobilePhone || null;

		this.username =
			!this.email && !this.mobilePhone // by default it's name
				? someId
				: this.username || null;
	};

	//-------------------------------------------------------------------------
	/** 
     * Sometimes you don't know which field exists: username,
     * email or mobile. This function will return first exist ID in this order:
     * username -> email -> mobile.
     */
	public getSomeId = () => {
		const id = this.username || this.email || this.mobilePhone;
		return id;
	};
}
