import {
  Body,
  Controller,
  Get,
  Put,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../auth/user.decorator';
import { AuthGuard } from '@nestjs/passport';
import { UserEntity } from 'src/entities/user.entity';
import { UserUpdateDTO } from 'src/models/user.dto';
import { AuthService } from 'src/auth/auth.service';

@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @Get()
  @UseGuards(AuthGuard())
  async findCurrentUser(@User() { username }: UserEntity) {
    const user = await this.authService.findCurrentUser(username);
    return { user };
  }

  @Put()
  @UseGuards(AuthGuard())
  async updateUser(
    @User() { username }: UserEntity,
    @Body('user', new ValidationPipe({ transform: true, whitelist: true }))
    body: UserUpdateDTO,
  ) {
    return await this.authService.updateUser(username, body);
  }
}
