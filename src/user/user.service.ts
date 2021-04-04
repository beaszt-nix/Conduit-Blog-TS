import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/entities/user.entity';
import { UserUpdateDTO } from 'src/models/user.dto';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
  ) {}
  async findByUserName(username: string, currentUser?: UserEntity) {
    console.log(currentUser);
    const user = (
      await this.userRepo.findOne({
        where: { username },
        relations: ['followers'],
      })
    ).toProfile(currentUser);
    return user;
  }

  async followUser(currentUser: UserEntity, username: string) {
    const target_user = await this.userRepo.findOne({
      where: { username },
      relations: ['followers'],
    });
    target_user.followers.push(currentUser);
    await target_user.save();
    return target_user.toProfile(currentUser);
  }

  async unfollow(author: string, user: UserEntity) {
    const targetUser = await this.userRepo.findOne({
      where: { username: author },
      relations: ['followers'],
    });
    if (!targetUser) throw new NotFoundException('Invalid Username Param');
    targetUser.followers.filter((follower) => follower !== user);
    await targetUser.save();
    return targetUser.toProfile(user);
  }

  async updateUser(username: string, data: UserUpdateDTO) {
    await this.userRepo.update({ username }, data);
    return this.findByUserName(username);
  }
}
