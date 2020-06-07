import { Injectable, BadRequestException, ValidationPipe } from '@nestjs/common';
import { WebSocketsDto } from '../../shared/websockets/websockets.dto';
import { UsersRepository } from '../db/users.repository';
import { User } from '../../shared/users/user';

@Injectable()
export class ContactsService {
	constructor(private usersRepository: UsersRepository) {}

	public handleDto(dto: WebSocketsDto): Promise<any> {
		throw new BadRequestException();
	}

	public async getAllContactsOf(user: User): Promise<User[]> {
		const foundUser = await this.usersRepository.getUserEntityBySomeIdOf(user);
		if (!foundUser) return [];
		return foundUser.contacts;
	}

	public async addContactToUser(user: User, contact: User): Promise<User[]> {
		return this.usersRepository.addContactToUser(user, contact);
	}
}
