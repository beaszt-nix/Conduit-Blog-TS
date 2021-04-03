import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO, RegisterDTO } from '../models/user.dto';

@Controller('users')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post()
  async register(@Body('user', ValidationPipe) credentials: RegisterDTO) {
    const user = await this.authService.register(credentials);
    return user;
  }

  @Post('/login')
  login(@Body('user', ValidationPipe) credentials: LoginDTO) {
    return this.authService.login(credentials);
  }
}
