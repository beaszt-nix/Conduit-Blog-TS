import { classToPlain, Exclude } from 'class-transformer';
import { IsEmail } from 'class-validator';
import {
  Column,
  Entity,
  BeforeInsert,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { CommonEntity } from './common-entity';
import * as bcrypt from 'bcryptjs';

@Entity('users')
export class UserEntity extends CommonEntity {
  @Column()
  @IsEmail()
  email: string;

  @Column({ unique: true })
  username: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ default: '' })
  bio: string;

  @Column({ default: null, nullable: true })
  image: string | null;

  @ManyToMany((type) => UserEntity, (user) => user.followee)
  @JoinTable()
  followers: UserEntity[];

  @ManyToMany((type) => UserEntity, (user) => user.followers)
  followee: UserEntity[];

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  async comparePassword(attempt: string) {
    return await bcrypt.compare(attempt, this.password);
  }

  toProfile(user: UserEntity) {
    const following = this.followers.includes(user);
    const profile: any = { ...this.toJSON(), following };
    delete profile.followers;
    return { profile };
  }

  toJSON() {
    return classToPlain(this);
  }
}
