import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TagEntity } from 'src/entities/tags.entity';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(TagEntity) private tagRepo: Repository<TagEntity>,
  ) {}

  async getTags() {
    const tags = (await this.tagRepo.find()).map(({ name }) => name);
    return { tags };
  }
}
