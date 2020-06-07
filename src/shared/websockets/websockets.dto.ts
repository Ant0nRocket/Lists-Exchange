import { WebSocketsTheme } from './websockets-theme.enum';

export interface WebSocketsDto {
	/** Used in WebSocket service to filter
     * requests by clients.
     * For example, we have two components, each of them
     * subscribed to websocket messages. How to prevent messages
     * for component A from beign received by component B?
     * Very easy! Each component generates some unique ID of itself
     * and provides this ID to @function getSubjectFor(uid: string).
     * Of course, if you need that every component receive every
     * message - provide same ID (blank string, etc.)
     */
	cid: string;

	/** Theme of message. Use it for logic. */
	theme: WebSocketsTheme;

	/** Some payload. Use "as" syntax of TypeScript for IntelliSence */
	content: any;
}
