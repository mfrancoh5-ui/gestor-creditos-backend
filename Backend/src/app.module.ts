import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from './config/env';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CreditosModule } from './creditos/creditos.module';
import { PrismaModule } from './db/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => envSchema.parse(config),
    }),
    PrismaModule,
    CreditosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
