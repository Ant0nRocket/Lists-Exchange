import {
	WebSocketGateway,
	OnGatewayInit,
	OnGatewayConnection,
	OnGatewayDisconnect,
	WebSocketServer
} from '@nestjs/websockets';
import { Logger, Injectable } from '@nestjs/common';
import * as shortid from 'shortid';
import { WebSocketsDto } from '../shared/websockets/websockets.dto';
import { WebSocketsTheme } from '../shared/websockets/websockets-theme.enum';
import { apiConfig } from '../shared/api.config';
import { AuthService } from './auth/auth.service';
import { User } from '../shared/users/user';
import { ContactsService } from './contacts/contacts.service';

@Injectable()
@WebSocketGateway()
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	constructor(private authService: AuthService, private contactsService: ContactsService) {}

	@WebSocketServer() private server: any;

	private logger: Logger = new Logger('AppGateway', true);

	afterInit() {
		this.logger.log('Websocket started.');
	}

	/**
   * Moment where new client just connected
   * @param client client end-point (WebSocket)
   * @param args connection arguments (headers, etc.)
   */
	handleConnection(client: WebSocket, ...args: any[]) {
		(client as any).id = shortid.generate(); // don't used now. Just an ID of socket.
		client.onmessage = (ev) => {
			// ev.target is a client socket, and ev.data is a message from client
			if (ev.data) {
				try {
					const dto = JSON.parse(ev.data);
					this.handleDto(client, dto);
				} catch (ex) {
					this.logger.warn(`Hacker attack detected. Message is: ${ev.data}`);
				}
			} else {
				client.send('');
			}
		};

		this.logger.log(`Client connected: ${(client as any).id}`);

		// Notify client that it's connected...
		this.send2Client(client as WebSocket, WebSocketsTheme.ClientConnected);

		// ... and start timer that wait apiConfig.socketAuthDelay ms for client
		// to provide auth token. If no token - client will be disconnected
		(client as any).disconnectTimer = setTimeout(() => {
			this.send2Client(client, WebSocketsTheme.Unauthorized);
			(client as WebSocket).close();
		}, apiConfig.socketAuthDelay);
	}

	handleDisconnect(client: WebSocket) {
		client.onmessage = null; // not sure that it's required
		this.logger.log(`Client disconnected: ${(client as any).id}`);
	}

	//------------------------------------------------------------
	/**
   * Function that bypass received DTO's depending on it's theme
   * @param client client WebSocket
   * @param dto received DTO
   */
	async handleDto(client: WebSocket, dto: WebSocketsDto): Promise<void> {
		// if client send something before authentication...
		if (!(client as any).user && dto.theme !== WebSocketsTheme.AuthenticateWithToken) return; // ... then just skip this message, user unaothirized (yet).

		if (dto.theme === WebSocketsTheme.SendBackData) {
			this.send2Client(client, dto.theme, dto.content, dto.cid);
		} else if (dto.theme === WebSocketsTheme.AuthenticateWithToken) {
			this.handleClientAuthentication(client, dto);
		} else if (dto.theme >= WebSocketsTheme.GetAllContacts && dto.theme <= WebSocketsTheme.RemoveContact) {
			const resultContent = await this.contactsService.handleDto(client, dto);
			this.send2Client(client, dto.theme, resultContent, dto.cid);
		} else {
			this.send2Client(client, WebSocketsTheme.BadDto, dto);
		}
	}

	/**
   * Generates DTO and sends it to cpecified client
   */
	send2Client(client: WebSocket, theme: WebSocketsTheme, content: any = {}, cid: string = ''): void {
		const dto: WebSocketsDto = {
			cid,
			theme,
			content
		};
		client.send(JSON.stringify(dto));
	}

	/**
   * Connected clients must provide valid auth tokens.
   * This function validates this tokens and if token valid
   * it stops client disconnection timer, so that client
   * can continue working.
   * If token is invalid client will be automatically disconnected.
   */
	async handleClientAuthentication(client: any, dto: WebSocketsDto) {
		const tokenIsValid = await this.authService.isTokenValid(dto.content, (user: User) => {
			client.user = user;
		});

		if (tokenIsValid) {
			clearTimeout(client.disconnectTimer);
			this.logger.log(`Client ${client.id} authorized. User is ${client.user._id}`);
		} else {
			this.send2Client(client, WebSocketsTheme.Unauthorized);
			this.logger.error(`Token of client ${client.id} is invalid.`);
			client.close();
		}
	}
}
