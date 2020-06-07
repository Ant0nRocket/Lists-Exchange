import { Injectable, EventEmitter } from '@angular/core';

import { ServicesModule } from '../services.module';
import { WebSocketOptions } from './websocket.options';
import { AuthService } from '../auth/auth.service';

import { WebSocketsDto } from '../../../../shared/websockets/websockets.dto';
import { WebSocketsTheme } from '../../../../shared/websockets/websockets-theme.enum';

@Injectable({
	providedIn: ServicesModule
})
export class WebSocketsService {
	/** Instance of WebSocket */
	private ws: WebSocket;

	/** Connection options */
	private options: WebSocketOptions = new WebSocketOptions();

	/** ID of ping-pong interval */
	private idOfPingPongInterval: number;

	/** Currect reconnection attempts count */
	private reconnectionAttemptsPassed = 0;

	/** 
   * Reconnections limit reached. It's important to stop reconnection
   * attempts after some amout fails 'cause of memory leaks
   */
	private get reconnectionAttemptsLimitReached(): boolean {
		return this.reconnectionAttemptsPassed >= this.options.reconnectionAttemptsLimit;
	}

	/** Whether websocket open or not */
	public get ready(): boolean {
		if (!this.ws) return false;
		return this.ws.readyState === WebSocket.OPEN;
	}

	/** 
   * Occurred when WebSocket connection open. 
   * The fact that it's open doesn't mean that it's ready.
   * Check [ready] getter for this. 
   */
	public onConnectionOpen$: EventEmitter<void> = new EventEmitter();

	/** Occurred when WebSocket closed for any reason */
	public onConnectionClose$: EventEmitter<void> = new EventEmitter();

	/** Emits when there is new message from server */
	public onMessageReceived$: EventEmitter<WebSocketsDto> = new EventEmitter();

	/** Occurred when some error in WebSocket connection */
	public onConnectionError$: EventEmitter<string> = new EventEmitter();

	constructor(private authService: AuthService) {
		authService.onAuthStateChanged$.subscribe((authorized: boolean) => {
			if (!authorized) this.close();
			else this.connect();
		});
	}

	/** 
   * Connects to WebSocket server. 
   * If there is an open connection then nothing will happen.
   */
	public connect(options?: WebSocketOptions) {
		if (this.ready) return; // already connected and authorized - return
		if (options) this.options = options; // remember options
		this.ws = new WebSocket(this.options.url); // initialize new websocket connection

		this.ws.onopen = () => {
			this.idOfPingPongInterval = window.setInterval(() => {
				this.send();
			}, this.options.IntervalOfPingPongMs);
		};

		this.ws.onmessage = (ev) => {
			// received message
			try {
				const data: WebSocketsDto = JSON.parse(ev.data);
				if (data.theme === WebSocketsTheme.ClientConnected) {
					this.sendAuthToken();
				} else if (data.theme === WebSocketsTheme.Unauthorized) {
					this.close();
				} else {
					this.onMessageReceived$.emit(data);
				}
			} catch (ex) {
				this.onMessageReceived$.emit({
					cid: '',
					theme: WebSocketsTheme.BadDto,
					content: ev.data
				});
			}
		};

		this.ws.onerror = (ev: Event) => {
			this.onConnectionError$.emit(`Error: ${ev}`);
			setTimeout(() => {
				if (!this.reconnectionAttemptsLimitReached && !this.ready) {
					this.reconnectionAttemptsPassed++;
					this.connect();
				}
			}, this.options.intervalOfRoconnectionOnErrorMs);
		};

		this.ws.onclose = () => {
			window.clearInterval(this.idOfPingPongInterval);
		};
	}

	/** 
   * Sends existing authToken (whether it valid or not).
    */
	private sendAuthToken() {
		const dto: WebSocketsDto = {
			cid: '',
			theme: WebSocketsTheme.AuthenticateWithToken,
			content: this.authService.authToken
		};
		this.send(dto);
	}

	/** 
   * Closes connection to server (if it's in OPEN state).
   */
	public close() {
		if (!this.ws) return;
		this.ws.close();
	}

	/** 
   * Sends a WebSocketsDto to server.   
   * If Connection is not OPEN then nothing will happen.   
   * If no WebSocketsDto provided then empty string will be sent.   
   * It can be useful in Ping-Pong algorythm.
   */
	public send(m?: WebSocketsDto | string) {
		if (!this.ready) return;
		if (!m) m = '';
		const message2send = typeof m === 'string' ? m : JSON.stringify(m);
		this.ws.send(message2send);
	}
}
