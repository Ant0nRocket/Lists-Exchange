import { Injectable } from '@angular/core';
import { ServiceBus } from './service-bus.service';
import { AuthService } from './auth/auth.service';
import { WebSocketsService } from './websockets/websockets.service';

@Injectable({
    providedIn: 'root'
})
export class ServicesBootstrap {
    constructor( // DONT CHANGE WEBSOCKETS AND AUTH SERVICES ORDER!
        private serviceBus: ServiceBus,
        private webSocketsService: WebSocketsService,
        private authService: AuthService,
    ) {

    }
}
