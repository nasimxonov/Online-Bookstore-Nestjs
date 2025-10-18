import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('CLIENT_ID_GOOGLE')!,
      clientSecret: configService.get<string>('CLIENT_SECRET_GOOGLE')!,
      callbackURL: configService.get<string>('CLIENT_CALLBACK_URL_GOOGLE')!,
      scope: ['email', 'profile'],
      passReqToCallback: false,
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): any {
    const user = profile._json;
    done(null, user);
  }
}
