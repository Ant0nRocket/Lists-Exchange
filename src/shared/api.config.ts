const urlApiBase = '/api';

export const apiConfig = {
	urlWebSocket: '/socket',
	urlSignup: urlApiBase + '/signup',
	urlLogin: urlApiBase + '/login',
	urlTokenCheck: urlApiBase + '/check-token',
	minUsernameLen: 1,
	maxUsernameLen: 30,
	minPasswordLen: 1,
	maxPasswordLen: 30,
	usernameRegex: /^[A-Za-zА-Яа-я0-9\s.\-_]+$/,
	passwordRegex: /^[A-Za-zА-Яа-я0-9\s.\-`~!@#$%^&*()_=+|?]+$/,
	socketAuthDelay: 5000 // 5 seconds
};
