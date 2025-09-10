import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect() {}

  @Post('callback-google')
  @UseGuards(AuthGuard('google'))
  async OAuthGoogleCallback(@Req() req: Request) {
    const user = req['user'];
    return await this.authService.OAuthGoogleCallback(user);
  }

  @Post('login')
  async login(@Body() data: { email: string; password: string }) {
    return await this.authService.login(data);
  }

  @Post('register')
  async register(
    @Body()
    data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      username: string;
    },
  ) {
    return await this.authService.register(data);
  }
}
