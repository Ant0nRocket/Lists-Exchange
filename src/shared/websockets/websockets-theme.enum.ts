export enum WebSocketsTheme {
	/** 
     * Server sends this when socket connection open. 
     * Client should respond with valid auth token or
     * server will close client connection in apiConfig.socketAuthDelay
     * seconds
     */
	ClientConnected,

	/**
     * Client sends this after receiving [ClientConnected] theme.
     * In content there should be a valid auth token.
     */
	AuthenticateWithToken,

	/**
     * Use when client was disconnected by auth timeout or
     * provided token is invalid.
     */
	Unauthorized,

	/** Use it when server didn't understand command. */
	BadDto,

	/** For DTO filtering */
	EndOfServiceCommands,

	///////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	/** Server should return DTO as it is */
	SendBackData,

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////   CONTACTS   ///////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	GetAllContacts,

	SearchContacts,

	AddContact,

	RemoveContact
}
