import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Strategy } from 'passport';
import { ExtractJwt } from 'passport-jwt';
import { UserEntity } from 'src/entities/user.entity';
import { AuthPayload } from 'src/models/user.dto';
import { Repository } from 'typeorm';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'ConduitAuth') {
  constructor(
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
  ) {
    super({
      secretOrKey: process.env.SECRET,
      jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Token'),
    });
  }

  async validate(payload: AuthPayload) {
    const { username } = payload;
    const user = await this.userRepo.findOne({ where: { username } });
    if (!user) {
      throw new UnauthorizedException('Invalid Credentials');
    }
    return user;
  }
}
