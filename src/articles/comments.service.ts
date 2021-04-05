import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentEntity } from 'src/entities/comment.entity';
import { CommentDTO } from 'src/models/article.dto';
import { ArticleEntity } from 'src/entities/article.entity';
import { UserEntity } from 'src/entities/user.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentEntity)
    private commentRepo: Repository<CommentEntity>,
    @InjectRepository(ArticleEntity)
    private articleRepo: Repository<ArticleEntity>,
  ) {}
  async;

  async createComment(body: CommentDTO, user: UserEntity, slug: string) {
    let comment = await this.commentRepo.create(body);
    comment.article = await this.articleRepo.findOne({ where: { slug } });
    comment.author = user;
    comment = await this.commentRepo.save(comment);
    console.log(comment);
    return comment.toComment();
  }

  async deleteComment(id: number, username: string, slug: string) {
    const comment = await this.commentRepo.findOne({
      where: { id },
      relations: ['author', 'article'],
    });
    if (comment.article.slug !== slug)
      throw new NotFoundException('No Comment Exists for given ArticleId');
    if (comment.author.username !== username)
      throw new UnauthorizedException("Can't delete someone else's comment");
    await this.commentRepo.delete(comment.id);
  }

  async getAllComments(slug: string) {
    const commentEntities = await this.commentRepo
      .createQueryBuilder('comments')
      .innerJoinAndSelect(
        'comments.article',
        'article',
        `article.slug = '${slug}'`,
      )
      .innerJoinAndSelect('comments.author', 'author')
      .getMany();
    const comments = commentEntities.map((x) => x.toComment().comment);
    return { comments };
  }
}
