import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TransformInterceptor } from './common/interceptors/transform.interceptors';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
@Module({
  imports: [CoreModule,
    ConfigModule.forRoot({
      isGlobal:true
    }),
    AuthModule,
    UserModule
  ],

  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
