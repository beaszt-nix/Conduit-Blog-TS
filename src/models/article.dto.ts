import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ArticleDTO {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  body: string;

  @IsString({ each: true })
  tagList: string[];
}

export class ArticleUpdateDTO {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  body: string;

  @IsString({ each: true })
  @IsOptional()
  tagList: string[];
}

export class CommentDTO {
  @IsString()
  @MaxLength(400)
  body: string;
}

export interface ArticleQuery {
  tag?: string;
  author?: string;
  favorited?: string;
  limit?: number;
  offset?: number;
}
