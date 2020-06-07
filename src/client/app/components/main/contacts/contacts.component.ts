import { Component, OnInit } from '@angular/core';
import { ContactsService } from '../../../services/contacts/contacts.service';

@Component({
	selector: 'app-contacts',
	templateUrl: './contacts.component.html',
	styleUrls: [ './contacts.component.css' ]
})
export class ContactsComponent implements OnInit {
	searchInput: string = '';

	constructor(public contactsService: ContactsService) {}

	ngOnInit(): void {}

	doSearch() {}
}
