import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
    let existTags = await this.tagRepo.find({
      where: tagNames.map((name) => {
        return {
          name,
        };
      }),
    });
    if (!existTags) existTags = [];
    const existTagNames = existTags.map((x) => x.name);
    const newTags = tagNames.filter((tag) => !existTagNames.includes(tag));
    const newTagEntities = this.tagRepo.create(
      newTags.map((name) => {
        return { name };
      }),
    );
    this.tagRepo.save(newTagEntities);
    return newTagEntities.concat(existTags);
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
    await this.articleRepo.save(article);

    if (data.tagList) {
      const newTags = await this.createTags(data.tagList);
      article = await this.articleRepo.findOne({
        where: { slug: article.slug },
      });
      article.tagList = newTags;
      await article.save();
    }
    return article.toArticle(user);
  }

  async updateArticle(slug: string, data: ArticleUpdateDTO, user: UserEntity) {
    const article = await this.articleRepo.findOne({
      where: { slug },
      relations: ['tagList', 'author'],
    });
    if (!article || article.author.username !== user.username) {
      throw new ForbiddenException(
        'Did not find Article with given by slug written by you',
      );
    }
    let tags = article.tagList;
    if (data.tagList) {
      tags = await this.createTags(data.tagList);
      article.tagList = tags;
    }
    if (data.title) article.title = data.title;
    if (data.description) article.description = data.description;
    if (data.body) article.body = data.body;
    await this.articleRepo.save(article);
    return await this.findBySlug(slug, user);
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
      if (!article.favoritedBy.includes(user)) article.favoritedBy.push(user);
      await article.save();
    } catch (err) {
      if (err.code === '23503')
        throw new ConflictException('Already Favorited');
    }
    return this.findBySlug(slug, user);
  }

  async unfavoriteArticle(user: UserEntity, slug: string) {
    const article = await this.articleRepo.findOne({
      where: { slug },
      relations: ['favoritedBy'],
    });
    article.favoritedBy = article.favoritedBy.filter((x) => x !== user);
    await article.save();
    return this.findBySlug(slug, user);
  }

  //feedArticle(user: UserEntity, query: ArticleQuery) {}

  //queryArticles(query: ArticleQuery) {}
}
