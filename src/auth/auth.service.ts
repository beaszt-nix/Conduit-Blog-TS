import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { LoginDTO, RegisterDTO, UserUpdateDTO } from '../models/user.dto';
import { User } from './user.decorator';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
    private jwtService: JwtService,
  ) {}

  async register(credentials: RegisterDTO) {
    try {
      const user = this.userRepo.create(credentials);
      await user.save();
      const payload = { username: user.username };
      const token = this.jwtService.sign(payload);
      return { user: { ...user.toJSON(), token } };
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  async login(credentials: LoginDTO) {
    try {
      const user = await this.userRepo.findOne({
        where: { email: credentials.email },
      });
      const isValid = await user.comparePassword(credentials.password);
      if (!isValid) {
        throw new UnauthorizedException('Invalid Credentials');
      }
      const payload = { username: user.username };
      const token = this.jwtService.sign(payload);
      return { user: { ...user.toJSON(), token } };
    } catch (err) {
      if (err.code === '23505') throw new ConflictException();
      throw new UnauthorizedException('Invalid Credentials');
    }
  }
  async findCurrentUser(@User() username: string) {
    const user = await this.userRepo.findOne({ where: { username } });
    const payload = { username };
    const token = this.jwtService.sign(payload);
    return { ...user, token };
  }

  async updateUser(username: string, data: UserUpdateDTO) {
    await this.userRepo.update({ username }, data);
    const user = await this.findCurrentUser(username);
    return { user };
  }
}
