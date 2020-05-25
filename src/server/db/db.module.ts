import { Module, Global } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { MongooseModule } from '@nestjs/mongoose';

@Global()
@Module({
	imports: [
		MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost/lists-exchange', {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			connectTimeoutMS: 15000,
			useCreateIndex: true
		})
	],
	providers: [ UsersRepository ],
	exports: [ UsersRepository ]
})
export class DbModule {}
