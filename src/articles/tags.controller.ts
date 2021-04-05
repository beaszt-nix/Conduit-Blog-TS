import { Controller, Get } from '@nestjs/common';
import { TagsService } from './tags.service';

@Controller('tags')
export class TagsController {
  constructor(private tagsService: TagsService) {}
  @Get()
  async getAllTags() {
    return await this.tagsService.getTags();
  }
}
