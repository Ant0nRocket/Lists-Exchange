import { Component, OnInit, EventEmitter } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import * as shortid from 'shortid';
import { WebSocketsService } from '../../../services/websockets/websockets.service';
import { WebSocketsDto } from '../../../../../shared/websockets/websockets.dto';
import { Subscription } from 'rxjs';
import { WebSocketsTheme } from '../../../../../shared/websockets/websockets-theme.enum';

@Component({
	selector: 'app-welcome',
	templateUrl: './welcome.component.html',
	styleUrls: [ './welcome.component.css' ]
})
export class WelcomeComponent implements OnInit {
	public webSocketConnectInProgress = true;

	public onMessage: EventEmitter<Array<string>> = new EventEmitter();

	public hasMessages = () => this.receivedMessages.length > 0;

	private componentId = shortid.generate();
	private message$: Subscription;
	private receivedMessages: string[] = [];

	constructor(public authService: AuthService, public webSockets: WebSocketsService) {
		this.message$ = webSockets.onMessageReceived$.subscribe((dto: WebSocketsDto) => {
			if (dto.cid !== this.componentId) return; // filter messages not from this component
			if (this.receivedMessages.length > 4) this.receivedMessages = [];
			this.receivedMessages.push(dto.content);
			this.onMessage.emit(this.receivedMessages);
		});
	}

	ngOnInit(): void {}

	testWebSockets() {
		const dto: WebSocketsDto = {
			cid: this.componentId,
			content: shortid.generate(),
			theme: WebSocketsTheme.SendBackData
		};
		this.webSockets.send(dto); // if sockets not ready - send to nowhere :)
	}
}
