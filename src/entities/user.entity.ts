import { classToPlain, Exclude } from 'class-transformer';
import { IsEmail } from 'class-validator';
import {
  Column,
  Entity,
  BeforeInsert,
  ManyToMany,
  OneToMany,
  JoinTable,
  JoinColumn,
} from 'typeorm';
import { CommonEntity } from 'src/entities/common-entity';
import * as bcrypt from 'bcryptjs';
import { ArticleEntity } from 'src/entities/article.entity';
import { CommentEntity } from './comment.entity';
import { User } from 'src/auth/user.decorator';

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
  @JoinTable()
  followee: UserEntity[];

  @ManyToMany((type) => ArticleEntity, (article) => article.favoritedBy)
  @JoinTable()
  favorites: ArticleEntity[];

  @OneToMany((type) => ArticleEntity, (article) => article.author)
  @JoinColumn()
  articles: ArticleEntity[];

  @OneToMany((type) => CommentEntity, (comment) => comment.author)
  comments: CommentEntity[];

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  async comparePassword(attempt: string) {
    return await bcrypt.compare(attempt, this.password);
  }

  toProfile(user?: UserEntity) {
    let following = null;
    if (user !== undefined) {
      following = this.followers.map((x) => x.username).includes(user.username);
    }
    const profile: any = { ...this.toJSON(), following };
    delete profile.followers;
    return { profile };
  }

  toJSON() {
    return classToPlain(this);
  }
}
