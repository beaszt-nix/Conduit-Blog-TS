import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OptionalAuthGuard } from 'src/auth/optional.auth';
import { User } from 'src/auth/user.decorator';
import { UserEntity } from 'src/entities/user.entity';
import {
  ArticleDTO,
  ArticleQuery,
  ArticleUpdateDTO,
  CommentDTO,
} from 'src/models/article.dto';
import { ArticlesService } from './articles.service';
import { CommentsService } from './comments.service';

@Controller('articles')
export class ArticlesController {
  constructor(
    private articleService: ArticlesService,
    private commentService: CommentsService,
  ) {}

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

  @Delete('/:slug/favorite')
  @UseGuards(AuthGuard())
  async unfavorite(@User() user: UserEntity, @Param('slug') slug: string) {
    return await this.articleService.unfavoriteArticle(user, slug);
  }

  @Get('feed')
  @UseGuards(AuthGuard())
  async feedArticles(
    @User() user: UserEntity,
    @Query() { limit, offset }: { limit?: number; offset?: number },
  ) {
    return await this.articleService.feedArticle(
      user,
      limit ? limit : 20,
      offset ? offset : 0,
    );
  }

  @Get('/:slug')
  @UseGuards(AuthGuard())
  async getArticle(@User() user: UserEntity, @Param('slug') slug: string) {
    return this.articleService.findBySlug(slug, user);
  }

  @Get('')
  @UseGuards(new OptionalAuthGuard())
  async listArticles(@User() user: UserEntity, @Query() query: ArticleQuery) {
    if (!query.offset) query.offset = 0;
    if (!query.limit) query.limit = 20;
    return await this.articleService.queryArticles(query, user);
  }

  @Get('/:slug/comments')
  async getComments(@Param('slug') slug: string) {
    return await this.commentService.getAllComments(slug);
  }

  @Delete(':slug/comments/:id')
  @UseGuards(AuthGuard())
  async deleteComment(
    @Param('slug') slug: string,
    @Param('id') commentId: number,
    @User() { username }: UserEntity,
  ) {
    this.commentService.deleteComment(commentId, username, slug);
  }

  @Post(':slug/comments')
  @UseGuards(AuthGuard())
  async createComment(
    @User() user: UserEntity,
    @Body('comment', ValidationPipe) body: CommentDTO,
    @Param('slug') slug: string,
  ) {
    return await this.commentService.createComment(body, user, slug);
  }
}
