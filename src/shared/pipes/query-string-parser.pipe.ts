import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class QueryStringParserPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'query') {
      return value;
    }

    try {
      if (value.pageSize) {
        value.offset = Number(value.pageSize);
      }

      if (value.pageNumber) {
        value.limit = Number(value.pageNumber);
      }

      return value;
    } catch (error) {
      throw new BadRequestException('Malformed filter object');
    }
  }
}
