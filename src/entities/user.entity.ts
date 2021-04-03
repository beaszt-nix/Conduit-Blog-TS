import { classToPlain, Exclude } from 'class-transformer';
import { IsEmail } from 'class-validator';
import { Column, Entity, BeforeInsert } from 'typeorm';
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

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  async comparePassword(attempt: string) {
    return await bcrypt.compare(attempt, this.password);
  }

  toJSON() {
    return classToPlain(this);
  }
}
