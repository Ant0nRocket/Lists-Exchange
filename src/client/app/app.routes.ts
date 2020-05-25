import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AuthComponent } from './components/main/auth/auth.component';
import { WelcomeComponent } from './components/main/welcome/welcome.component';
import { ListsComponent } from './components/main/lists/lists.component';
import { ContactsComponent } from './components/main/contacts/contacts.component';

export const ROUTES: Routes = [
	// default page - welcome
	{ path: '', component: WelcomeComponent },

	// sign-up and login
	{ path: 'auth', component: AuthComponent },

	// lists
	{ path: 'lists', component: ListsComponent, canActivate: [ AuthGuard ] },

	// contacts
	{ path: 'contacts', component: ContactsComponent, canActivate: [ AuthGuard ] }
];
