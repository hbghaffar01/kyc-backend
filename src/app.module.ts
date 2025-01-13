import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './module/auth/auth.module';
import { KycModule } from './module/kyc/kyc.module';
import { AdminModule } from './module/admin/admin.module';
import { validateConfig } from './config/configuration';
import { User } from './module/auth/entities/user.entity';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Kyc } from './module/kyc/entities/kyc.entity';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: validateConfig,
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST', 'localhost'),
        port: configService.get('DATABASE_PORT', 5432),
        username: configService.get('DATABASE_USERNAME', 'postgres'),
        password: configService.get('DATABASE_PASSWORD', '123'),
        database: configService.get('DATABASE_NAME', 'nest'),
        synchronize: configService.get('NODE_ENV') !== 'production',
        autoLoadEntities: true,
        logging: false,
        entities: [User, Kyc],
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    KycModule,
    AdminModule,
  ],
  controllers: [AppController],
})
export class AppModule {
  constructor(private configService: ConfigService) {}

  configureSwagger(app) {
    const options = new DocumentBuilder()
      .setTitle('KYC API')
      .setDescription('API documentation for KYC management')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api', app, document);
  }
}
