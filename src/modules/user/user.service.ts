import { Injectable } from '@nestjs/common';
import { BaseCRUDService } from 'src/shared/services/base.service';
import { User } from './user.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserService extends BaseCRUDService<User> {
  constructor(
    @InjectRepository(User)
    protected repo: Repository<User>,
  ) {
    super(repo);
  }
}
