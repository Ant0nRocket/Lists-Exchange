import { Injectable, BadRequestException, ValidationPipe } from '@nestjs/common';
import { WebSocketsDto } from '../../shared/websockets/websockets.dto';
import { UsersRepository } from '../db/users.repository';
import { User } from '../../shared/users/user';
import { WebSocketsTheme } from '../../shared/websockets/websockets-theme.enum';

@Injectable()
export class ContactsService {
	constructor(private usersRepository: UsersRepository) {}

	/** 
	 * @param client - is a WebSocket with user attached
	 * @param dto - DTO to handle
	 */
	public handleDto(client: any, dto: WebSocketsDto): Promise<any> {
		const user: User = client.user;
		if (dto.theme === WebSocketsTheme.GetAllContacts) {
			return this.getAllContactsOf(user);
		} else if (dto.theme === WebSocketsTheme.SearchContacts) {
			return this.searchUsers(dto.content, user);
		}
	}

	public async getAllContactsOf(user: User): Promise<User[]> {
		const foundUser = await this.usersRepository.getUserEntityBySomeIdOf(user);
		if (!foundUser) return [];
		return foundUser.contacts;
	}

	public async searchUsers(criteria: string, whoSearch: User): Promise<User[]> {
		const foundUsers = await this.usersRepository.searchUsers(criteria);
		for (var i = 0; i < foundUsers.length; i++) {
			// let's remove user that performs searching
			if (foundUsers[i]._id === whoSearch._id) {
				foundUsers.splice(i, 1);
				break;
			}
		}
		return foundUsers;
	}

	public async addContactToUser(user: User, contact: User): Promise<User[]> {
		return this.usersRepository.addContactToUser(user, contact);
	}
}
