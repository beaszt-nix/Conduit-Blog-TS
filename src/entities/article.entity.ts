import {
  BeforeInsert,
  Column,
  Entity,
  JoinTable,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  RelationCount,
} from 'typeorm';
import { CommonEntity } from 'src/entities/common-entity';
import { UserEntity } from 'src/entities/user.entity';
import { TagEntity } from 'src/entities/tags.entity';
import * as slug from 'slug';
import { uuid } from 'uuidv4';
import { classToPlain } from 'class-transformer';

@Entity('articles')
export class ArticleEntity extends CommonEntity {
  @Column()
  slug: string;

  @Column()
  title: string;

  @Column({ default: '' })
  description: string;

  @Column({ default: '' })
  body: string;

  @ManyToMany((type) => UserEntity, (user) => user.favorites, { eager: true })
  @JoinTable()
  favoritedBy: UserEntity[];

  @RelationCount((article: ArticleEntity) => article.favoritedBy)
  favoritesCount: number;

  @ManyToOne((type) => UserEntity, (user) => user.articles, { eager: true })
  @JoinColumn()
  author: UserEntity;

  @ManyToMany((type) => TagEntity, (tag) => tag.articles)
  @JoinTable()
  tagList: TagEntity[];

  @BeforeInsert()
  generateSlug() {
    this.slug = slug(this.title, { lower: true }) + '-' + uuid();
  }

  toArticle(user?: UserEntity) {
    let favorited = null;
    if (user && this.favoritedBy) {
      favorited = this.favoritedBy
        .map(({ username }) => username)
        .includes(user.username);
    }
    const article: any = { ...this.toJSON(), favorited };
    if (article.tagList)
      article.tagList = article.tagList.map(({ name }) => name);
    article.author = this.author.toProfile().profile;
    delete article.favoritedBy;
    return { article };
  }

  toJSON() {
    return classToPlain(this);
  }
}
