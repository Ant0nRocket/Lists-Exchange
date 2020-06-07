import { Component } from '@angular/core';
import { AuthService } from './services/auth/auth.service';
import { WebSocketsService } from './services/websockets/websockets.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: [ './app.component.scss' ]
})
export class AppComponent {
	constructor(private authService: AuthService, private wss: WebSocketsService) {
		if (this.authService.authToken) {
			this.wss.connect();
		}
	}
}
