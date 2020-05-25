import { Injectable } from '@nestjs/common';
import { Collection } from 'mongodb';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import * as shortid from 'shortid';

import { User } from '../../shared/users/user';
import { UserEntity } from './entities/UserEntity';

@Injectable()
export class UsersRepository {
	private users: Collection<UserEntity>;

	constructor(@InjectConnection() private readonly mongo: Connection) {
		this.initUsersCollection();
	}

	async initUsersCollection(): Promise<void> {
		this.users = await this.mongo.createCollection('db.users');
	}

	/** Fill free to pass _id, user name, phone or email here */
	async getUserEntityBySomeIdOf(user: User): Promise<UserEntity> {
		const { _id, username, email, mobilePhone } = user;
		const searchRules = [];

		if (_id) searchRules.push({ _id });
		if (username) searchRules.push({ username });
		if (email) searchRules.push({ email });
		if (mobilePhone) searchRules.push({ mobilePhone });

		const dbUser = await this.users.findOne({ $or: searchRules }, {});
		if (!dbUser) return null;

		const userEntity = new UserEntity();
		/* 
		Here is what happening... 
		dbUser is a copy of database entry. It doesn't contains any
		function (like asUser()). So we have to manualy initialize
		UserEntity and assign enumerable properties of dbUser to
		newly created userEntity
		*/
		Object.assign(userEntity, dbUser);
		return userEntity;
	}

	async addUser(user: UserEntity): Promise<UserEntity> {
		const foundUser = await this.getUserEntityBySomeIdOf(user);
		if (foundUser) return foundUser;

		user._id = shortid.generate();
		const result = await this.users.insertOne(user);
		if (result.insertedCount === 1) return user;

		return null;
	}
}
