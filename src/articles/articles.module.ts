import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleEntity } from 'src/entities/article.entity';
import { TagEntity } from 'src/entities/tags.entity';
import { UserEntity } from 'src/entities/user.entity';
import { ArticlesController } from 'src/articles/articles.controller';
import { ArticlesService } from 'src/articles/articles.service';
import { AuthModule } from 'src/auth/auth.module';
import { CommentsService } from './comments.service';
import { CommentEntity } from 'src/entities/comment.entity';
import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ArticleEntity,
      UserEntity,
      TagEntity,
      CommentEntity,
    ]),
    AuthModule,
  ],
  controllers: [ArticlesController, TagsController],
  providers: [ArticlesService, CommentsService, TagsService],
})
export class ArticlesModule {}
