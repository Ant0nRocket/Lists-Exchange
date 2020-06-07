import { join } from 'path';

import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';

import { AppController } from './app.controller';
import { AppGateway } from './app.gateway';
import { AuthModule } from './auth/auth.module';
import { DbModule } from './db/db.module';
import { ContactsModule } from './contacts/contacts.module';

@Module({
	imports: [
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, '..', 'client')
		}),
		DbModule,
		AuthModule,
		ContactsModule
	],
	controllers: [
		// AppController
	],
	providers: [ AppGateway ]
})
export class AppModule {}
