import { Controller, Body, Post, ValidationPipe, ConflictException, UnauthorizedException } from '@nestjs/common';
import { apiConfig } from '../../shared/api.config';
import { AuthService } from './auth.service';
import { AuthTokenDto } from '../../shared/auth/auth-token.dto';
import { Credentials } from '../../shared/auth/credentials';

@Controller()
export class AuthController {
	constructor(private authService: AuthService) {}

	@Post(apiConfig.urlSignup)
	async signup(@Body(ValidationPipe) credentials: Credentials): Promise<AuthTokenDto> {
		const createdUser = await this.authService.signup(credentials);
		if (!createdUser) {
			throw new ConflictException();
		}

		// New user created, why don't return access token?
		return this.authService.login(credentials);
	}

	@Post(apiConfig.urlLogin)
	async login(@Body(ValidationPipe) credentials: Credentials): Promise<AuthTokenDto> {
		const authTokenDto = await this.authService.login(credentials);
		if (!authTokenDto) throw new UnauthorizedException();

		return authTokenDto;
	}

	@Post(apiConfig.urlTokenCheck)
	async checkToken(@Body() authTokenDto: AuthTokenDto): Promise<AuthTokenDto> {
		if (this.authService.isTokenValid(authTokenDto.token)) {
			return authTokenDto;
		} else {
			throw new UnauthorizedException();
		}
	}
}
