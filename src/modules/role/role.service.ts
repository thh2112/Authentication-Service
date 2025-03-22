import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { BaseCRUDService } from 'src/shared/services/base.service';
import { Role } from './role.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ROLE_TYPE } from 'src/shared/constant';

@Injectable()
export class RoleService
  extends BaseCRUDService<Role>
  implements OnApplicationBootstrap
{
  protected logger = new Logger(RoleService.name);

  constructor(
    @InjectRepository(Role)
    protected repo: Repository<Role>,
  ) {
    super(repo);
  }

  protected defaultRoles: Partial<Role>[] = [
    {
      type: ROLE_TYPE.ADMIN,
    },
    {
      type: ROLE_TYPE.USER,
    },
  ];

  async onApplicationBootstrap() {
    try {
      const roleCount = await this.count({});

      if (!roleCount) {
        await this.bulkCreate(this.defaultRoles);
      }
    } catch (error) {
      this.logger.error(error.message, error.stack);
    }
  }
}
