import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/auth/user.decorator';
import { UserEntity } from 'src/entities/user.entity';
import { ArticleDTO, ArticleUpdateDTO } from 'src/models/article.dto';
import { ArticlesService } from './articles.service';

@Controller('articles')
export class ArticlesController {
  constructor(private articleService: ArticlesService) {}

  @Post()
  @UseGuards(AuthGuard())
  async createArticle(
    @User() user: UserEntity,
    @Body('article', ValidationPipe) article: ArticleDTO,
  ) {
    return await this.articleService.createArticle(article, user);
  }

  @Put('/:slug')
  @UseGuards(AuthGuard())
  async updateArticle(
    @User() user: UserEntity,
    @Body('article', ValidationPipe) article: ArticleUpdateDTO,
    @Param('slug') slug: string,
  ) {
    return await this.articleService.updateArticle(slug, article, user);
  }

  @Delete('/:slug')
  @UseGuards(AuthGuard())
  async deleteArticle(@User() user: UserEntity, @Param('slug') slug: string) {
    this.articleService.deleteArticle(slug, user);
  }

  @Post('/:slug/favorite')
  @UseGuards(AuthGuard())
  async favorite(@User() user: UserEntity, @Param('slug') slug: string) {
    try {
      return await this.articleService.favoriteArticle(user, slug);
    } catch (err) {
      if (err.code === '23503')
        throw new ConflictException('Already Favorited!');
    }
  }

  @Post('/:slug/favorite')
  @UseGuards(AuthGuard())
  async unfavorite(@User() user: UserEntity, @Param('slug') slug: string) {
    return await this.articleService.unfavoriteArticle(user, slug);
  }

  @Get('/:slug')
  @UseGuards(AuthGuard())
  async getArticle(@User() user: UserEntity, @Param('slug') slug: string) {
    return this.articleService.findBySlug(slug, user);
  }
}
