import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tracing } from 'node:trace_events';
import { authenticate } from 'passport';
import { ArticleEntity } from 'src/entities/article.entity';
import { TagEntity } from 'src/entities/tags.entity';
import { UserEntity } from 'src/entities/user.entity';
import { ArticleDTO, ArticleUpdateDTO } from 'src/models/article.dto';
import { Repository } from 'typeorm';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(ArticleEntity)
    private articleRepo: Repository<ArticleEntity>,
    @InjectRepository(TagEntity)
    private tagRepo: Repository<TagEntity>,
  ) {}

  async findBySlug(slug: string, user?: UserEntity) {
    try {
      return (
        await this.articleRepo.findOne({
          where: { slug },
          relations: ['favoritedBy', 'tagList'],
        })
      ).toArticle(user);
    } catch (err) {
      throw new NotFoundException("Article Doesn't Exist");
    }
  }

  private async createTags(tagNames: string[]) {
    const tags = tagNames.map((x) => {
      return { name: x };
    });
    const tagEntities = await this.tagRepo.create(tags);
    await this.tagRepo.save(tagEntities);
  }

  private async getTags(tagNames: string[]) {
    return await this.tagRepo.find({
      where: tagNames.map((name) => {
        return {
          name,
        };
      }),
    });
  }

  async createArticle(data: ArticleDTO, user: UserEntity) {
    const newdata: { title: string; description: string; body: string } = {
      ...data,
    };
    let article = this.articleRepo.create(newdata);
    await article.save();
    article = await this.articleRepo.findOne({
      where: { slug: article.slug },
      relations: ['author', 'tagList'],
    });
    article.author = user;
    await article.save();
    if (data.tagList) {
      await this.createTags(data.tagList);
      article = await this.articleRepo.findOne({
        where: { slug: article.slug },
      });
      article.tagList = await this.getTags(data.tagList);
      await article.save();
    }
    return article.toArticle(user);
  }

  async updateArticle(
    slug: string,
    data: ArticleUpdateDTO,
    author: UserEntity,
  ) {
    const modArticle: any = { ...data };
    delete modArticle.tagList;
    await this.articleRepo.update({ slug, author }, modArticle);
    if (data.tagList) {
      const article = await this.articleRepo.findOne({
        where: { slug },
        relations: ['tagList'],
      });
      article.tagList = await this.tagRepo.find({
        where: data.tagList.map((x) => {
          {
            name: x;
          }
        }),
      });
      console.log(article);
      await article.save();
    }
    return this.findBySlug(slug, author);
  }

  async deleteArticle(slug: string, author: UserEntity) {
    const article = await this.articleRepo.findOne({
      where: { slug },
      relations: ['author'],
    });
    if (article && article.author === author) this.articleRepo.delete(article);
  }

  async favoriteArticle(user: UserEntity, slug: string) {
    const article = await this.articleRepo.findOne({
      where: { slug },
      relations: ['favoritedBy'],
    });
    try {
      article.favoritedBy.push(user);
      article.save();
    } catch (err) {
      if (err.code === '23503')
        throw new InternalServerErrorException('Already Favorited');
    }
    return article.toArticle(user);
  }

  async unfavoriteArticle(user: UserEntity, slug: string) {
    const article = await this.articleRepo.findOne({
      where: { slug },
      relations: ['favoritedBy'],
    });
    article.favoritedBy = article.favoritedBy.filter((x) => x !== user);
    article.save();
    return article.toArticle(user);
  }

  //feedArticle(user: UserEntity, query: ArticleQuery) {}

  //queryArticles(query: ArticleQuery) {}
}
