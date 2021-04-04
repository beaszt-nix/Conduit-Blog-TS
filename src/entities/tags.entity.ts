import {
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryColumn,
  RelationCount,
} from 'typeorm';
import { ArticleEntity } from 'src/entities/article.entity';
import { CommonEntity } from 'src/entities/common-entity';

@Entity('tags')
export class TagEntity extends CommonEntity {
  @PrimaryColumn()
  name: string;

  @ManyToMany((type) => ArticleEntity, (article) => article.tagList)
  @JoinTable()
  articles: ArticleEntity[];

  @RelationCount((tag: TagEntity) => tag.articles)
  taggedCount: number;
}
