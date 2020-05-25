import { Injectable, Logger } from '@nestjs/common';
import { UsersRepository } from '../db/users.repository';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { AuthTokenDto } from '../../shared/auth/auth-token.dto';
import { User } from '../../shared/users/user';
import { Credentials } from '../../shared/auth/credentials';
import { UserEntity } from '../db/entities/UserEntity';

@Injectable()
export class AuthService {
	private logger: Logger = new Logger('AuthService');

	constructor(private usersRepository: UsersRepository) {}

	async signup(credentials: Credentials): Promise<User> {
		const foundUser = await this.usersRepository.getUserEntityBySomeIdOf(credentials);
		if (!foundUser) {
			// no users found, let's create new one
			const { password } = credentials;
			const userEntity: UserEntity = new UserEntity();
			userEntity.username = credentials.username;
			userEntity.email = credentials.email;
			userEntity.mobilePhone = credentials.mobilePhone;
			userEntity.salt = await bcrypt.genSalt();
			const saltedPassword = password + userEntity.salt;
			userEntity.hashedPassword = await bcrypt.hash(saltedPassword, userEntity.salt);

			// bcrypt hash function addes salt in the begining of hash. Remove.
			userEntity.hashedPassword = userEntity.hashedPassword.replace(userEntity.salt, '');

			return this.usersRepository.addUser(userEntity);
		}
		return null;
	}

	async login(credentials: Credentials): Promise<AuthTokenDto> {
		const foundUser = await this.usersRepository.getUserEntityBySomeIdOf(credentials);
		if (foundUser) {
			// user found, let's compare password hash
			const { hashedPassword } = foundUser;
			const saltedPassword = credentials.password + foundUser.salt;
			let receivedHashedPassword = await bcrypt.hash(saltedPassword, foundUser.salt);
			receivedHashedPassword = receivedHashedPassword.replace(foundUser.salt, '');
			if (hashedPassword !== receivedHashedPassword) return null;

			const tokenDto: AuthTokenDto = {
				token: jwt.sign(foundUser.asPlainUserObject(), foundUser.hashedPassword, { expiresIn: '7d' })
			};
			return tokenDto;
		}
		return null;
	}

	/** Checks auth token (is it valid, not expired, user exists, etc.) */
	async isTokenValid(rawToken: string, tokenValidCallback?: (user: User) => void): Promise<boolean> {
		const token = jwt.decode(rawToken);
		if (!token) {
			this.logger.error('Token validation: no token provided');
			return false;
		}

		const user = await this.usersRepository.getUserEntityBySomeIdOf(token as User);
		if (!user) {
			this.logger.error('Token validation: user not found');
			return false;
		}

		// User password hash is a sign key for jwt, let's validate
		try {
			jwt.verify(rawToken, user.hashedPassword);
			tokenValidCallback(user);
		} catch (err) {
			this.logger.error('Token validation: invalid token provided');
			return false;
		}

		return true;
	}
}
