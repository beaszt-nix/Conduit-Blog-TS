import {
  Controller,
  Param,
  Get,
  Post,
  UseGuards,
  Delete,
  NotFoundException,
  HttpCode,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/auth/user.decorator';
import { UserEntity } from 'src/entities/user.entity';
import { UserService } from './user.service';
import { OptionalAuthGuard } from 'src/auth/optional.auth';

@Controller('profiles')
export class ProfileController {
  constructor(private userService: UserService) {}

  @Get('/:username')
  @UseGuards(new OptionalAuthGuard())
  async getProfile(
    @Param('username') username: string,
    @User() user: UserEntity,
  ) {
    const profile = await this.userService.findByUserName(username, user);
    if (!profile) throw new NotFoundException('User not found, wrong username');
    return profile;
  }

  @Post('/:username/follow')
  @HttpCode(200)
  @UseGuards(AuthGuard())
  async followUser(
    @User() user: UserEntity,
    @Param('username') author: string,
  ) {
    return await this.userService.followUser(user, author);
  }

  @Delete('/:username/follow')
  @UseGuards(AuthGuard())
  async unfollowUser(
    @User() user: UserEntity,
    @Param('username') author: string,
  ) {
    return await this.userService.unfollow(author, user);
  }
}
