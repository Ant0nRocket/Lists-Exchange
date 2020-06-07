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

	//------------------------------------------------------
	/** 
	 * Search one exact user.
	 * Fill free to pass _id, user name, phone or email here 
	 * */
	async getUserEntityBySomeIdOf(user: User): Promise<UserEntity> {
		const { _id, username, email, mobilePhone } = user;
		const searchParams = [];

		if (_id) searchParams.push({ _id });
		if (username) searchParams.push({ username });
		if (email) searchParams.push({ email });
		if (mobilePhone) searchParams.push({ mobilePhone });

		const dbUser = await this.users.findOne({ $or: searchParams }, {});
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

	//--------------------------------------
	/** Adds a new user into the database */
	async addUser(user: UserEntity): Promise<UserEntity> {
		const foundUser = await this.getUserEntityBySomeIdOf(user);
		if (foundUser) return foundUser;

		user._id = shortid.generate();
		const result = await this.users.insertOne(user);
		if (result.insertedCount === 1) return user;

		return null;
	}

	//-----------------------------------------
	/** Performs search of users by criteria */
	async searchUsers(criteria: string): Promise<User[]> {
		const result: any = [];

		// Searching of users is a complex operation. First of all
		// we should split request by space char.
		// Then search each part of criteria in each posible id field.
		const parts = criteria.trim().split(' ');
		if (parts.length === 0) return result; // it's empty array now

		const searchParams: object[] = [];

		parts.map((part) => part.trim()).forEach((part) => {
			searchParams.push({ _id: { $regex: part, $options: 'i' } });
			searchParams.push({ username: { $regex: part, $options: 'i' } });
			searchParams.push({ email: { $regex: part, $options: 'i' } });
			searchParams.push({ mobilePhone: { $regex: part, $options: 'i' } });
		});

		const dbCursor = this.users.find({ $or: searchParams });
		await dbCursor.forEach((dbUser) => {
			const foundUser = new UserEntity();
			Object.assign(foundUser, dbUser);
			result.push(foundUser.asPlainUserObject());
		});
		return result;
	}

	//------------------------------------------------------------------------------
	/** Adds contact to specified user and returns array or contacts of the user, or
	 * -1 if contact already in list, 1 if contact added
	 */
	async addContactToUser(user: User, contact: User): Promise<User[]> {
		const { _id } = user;
		const foundUser = await this.users.findOne({ _id });
		if (!foundUser) return null;
		if (!foundUser.contacts) foundUser.contacts = [];
		for (var i = 0; i < foundUser.contacts.length; i++) {
			if (foundUser.contacts[i]._id === contact._id) return [ ...foundUser.contacts ];
		}

		foundUser.contacts.push(contact);
		return [ ...foundUser.contacts ];
	}
}
