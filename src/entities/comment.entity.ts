/* 
{
  "comment": {
    "id": 1,
    "createdAt": "2016-02-18T03:22:56.637Z",
    "updatedAt": "2016-02-18T03:22:56.637Z",
    "body": "It takes a Jacobian",
    "author": {
      "username": "jake",
      "bio": "I work at statefarm",
      "image": "https://i.stack.imgur.com/xHWG8.jpg",
      "following": false
    }
  }
}
*/

import { classToPlain } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ArticleEntity } from './article.entity';
import { CommonEntity } from './common-entity';
import { UserEntity } from './user.entity';

@Entity('comments')
export class CommentEntity extends CommonEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsString()
  @MinLength(4)
  @MaxLength(400)
  body: string;

  @ManyToOne((type) => UserEntity, (author) => author.comments)
  author: UserEntity;

  @ManyToOne((type) => ArticleEntity, (article) => article.comments)
  article: ArticleEntity;

  toComment() {
    const author = this.author.toProfile();
    const comment = { ...classToPlain(this), author };
    return { comment };
  }
}
