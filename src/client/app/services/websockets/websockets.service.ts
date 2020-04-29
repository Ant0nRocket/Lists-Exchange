import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { WebSocketsDto } from '../../../../shared/websockets/websockets.dto';
import { environment } from '../../../environments/environment';
import { apiConfig } from '../../../../shared/api.config';
import { ServiceBus } from '../service-bus.service';

@Injectable({
  providedIn: 'root'
})
export class WebSocketsService {

  private ws: WebSocket;
  private url: string;

  private outgoingMessagesSub: Subscription;

  constructor(
    private serviceBus: ServiceBus,
  ) {
    console.log('WebSockets service created');

    this.url = 'ws://' + location.host;
    if (!environment.production) {
      // in dev mode backend usualy on 3000 port, so let's change it
      this.url = this.url.replace('4200', `${apiConfig.apiPort}`);
    }

    this.serviceBus.onAuthSuccess.subscribe(() => {
      this.connect();
    });

    this.serviceBus.onAuthFailed.subscribe(() => {
      this.ws?.close();
    });
  }


  public connect() {
    this.ws?.close();
    this.ws = new WebSocket(this.url);

    this.ws.onopen = (event) => {
      this.outgoingMessagesSub = this.serviceBus
        .onOutgoingWebSocketMessage
        .subscribe((m: WebSocketsDto) => {
          this.ws.send(JSON.stringify(m));
        });
    }

    this.ws.onmessage = (ev) => { // received message
      const data: WebSocketsDto = JSON.parse(ev.data);
      this.serviceBus.onIncomingWebSocketMessage.next(data);
    }

    this.ws.onerror = () => {
      this.outgoingMessagesSub.unsubscribe();
      this.ws.close();
      // let's try reconnect every 5 sec.
      setTimeout(() => { this.reconnect(); }, 5000);
      console.log('WebSocket error occured. Disconnected.');
    }

    this.ws.onclose = () => {
      this.outgoingMessagesSub.unsubscribe();
      console.log(`WebSocket connection to ${this.url} was closed.`)
    }
  }

  private reconnect() {
    console.log(`Attempting to reconect to socket at ${this.url}`);
    this.connect();
  }

  // /** 
  //  * Use this if your component needs to receive all
  //  * messages from websocket income (some service, etc.).
  //  * Otherwise use getSubjectFor(cid: string).
  //  */
  // getSubject(): Observable<WebSocketsDto> {
  //   return this.webSocketSubject.asObservable();
  // }

  // /** 
  //  * Use when you need to receive only component-binded messages.
  //  * Your component should provide any kind of ID.
  //  */
  // getSubjectFor(uid: string): Observable<WebSocketsDto> {
  //   return this.webSocketSubject.pipe(
  //     filter(ev => ev.cid === uid)
  //   );
  // }

  // /**
  //  * Sends message to server. Pay attension, if you have
  //  * subscription from getSubscriptionFor() you should 
  //  * provide same components ID (dto.cid) as in subscription.
  //  * See websockets-test.component.ts for example.
  //  * @param dto 
  //  */
  // send(dto: WebSocketsDto): boolean {
  //   if (this.ws?.readyState === this.ws.OPEN) {
  //     this.ws.send(JSON.stringify(dto));
  //     return true;
  //   }
  //   return false;
  // }
}