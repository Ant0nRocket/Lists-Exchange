import { Injectable } from '@angular/core';
import { ServicesModule } from '../services.module';
import { WebSocketsService } from '../websockets/websockets.service';
import * as shortid from 'shortid';
import { filter, debounceTime } from 'rxjs/operators';
import { User } from '../../../../shared/users/user';
import { WebSocketsTheme } from '../../../../shared/websockets/websockets-theme.enum';
import { Observable, Subject } from 'rxjs';
import { WebSocketsDto } from '../../../../shared/websockets/websockets.dto';

@Injectable({
	providedIn: ServicesModule
})
export class ContactsService {
	public contacts: User[] = [];
	public searchResult: User[] = [];

	private serviceId = shortid.generate();
	private searchInput$: Subject<string> = new Subject();

	constructor(private wss: WebSocketsService) {
		wss.onMessageReceived$.pipe(filter((m) => m.cid === this.serviceId)).subscribe((m) => {
			if (m.theme === WebSocketsTheme.GetAllContacts) {
				this.contacts = m.content;
			}
			if (m.theme === WebSocketsTheme.SearchContacts) {
				const receivedUserArray: User[] = m.content;
				this.searchResult = receivedUserArray.map((u) => {
					const foundUser = new User();
					return Object.assign(foundUser, u);
				});
				console.log(this.searchResult);
			}
		});

		// searchContacts() will emit new and new search requests,
		// and here we debounce them in 1 second and them send requests to server
		this.searchInput$.pipe(debounceTime(500)).subscribe((input) => {
			if (input.trim().length === 0) return;
			const dto: WebSocketsDto = {
				cid: this.serviceId,
				theme: WebSocketsTheme.SearchContacts,
				content: input
			};
			wss.send(dto);
		});
	}

	public searchContacts(searchInput: string) {
		this.searchResult = [];
		this.searchInput$.next(searchInput);
	}
}
