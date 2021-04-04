import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleEntity } from 'src/entities/article.entity';
import { TagEntity } from 'src/entities/tags.entity';
import { UserEntity } from 'src/entities/user.entity';
import { ArticlesController } from 'src/articles/articles.controller';
import { ArticlesService } from 'src/articles/articles.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ArticleEntity, UserEntity, TagEntity]),
    AuthModule,
  ],
  controllers: [ArticlesController],
  providers: [ArticlesService],
})
export class ArticlesModule {}
