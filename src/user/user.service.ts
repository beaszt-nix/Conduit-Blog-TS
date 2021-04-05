import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
  ) {}
  async findByUserName(username: string, currentUser?: UserEntity) {
    console.log(currentUser);
    const user = await this.userRepo.findOne({
      where: { username },
      relations: ['followers'],
    });
    if (!user) throw new NotFoundException("Could't Find User");
    return user.toProfile(currentUser);
  }

  async followUser(currentUser: UserEntity, username: string) {
    const target_user = await this.userRepo.findOne({
      where: { username },
      relations: ['followers'],
    });
    if (!target_user) throw new NotFoundException('User Not Found!');
    if (!target_user.followers) target_user.followers = [];
    if (!target_user.followers.includes(currentUser)) {
      target_user.followers.push(currentUser);
      await target_user.save();
    }
    return await this.findByUserName(target_user.username, currentUser);
  }

  async unfollow(author: string, user: UserEntity) {
    const targetUser = await this.userRepo.findOne({
      where: { username: author },
      relations: ['followers'],
    });
    if (!targetUser) throw new NotFoundException('Invalid Username Param');
    if (targetUser.followers) {
      targetUser.followers = targetUser.followers.filter(
        (follower) => follower.username !== user.username,
      );
      await targetUser.save();
    }
    return await this.findByUserName(targetUser.username, user);
  }
}
