import {
  DeleteResult,
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
  IsNull,
  ObjectLiteral,
  Repository,
} from 'typeorm';

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PaginationResult, RunnerUser } from '../type';
import * as queryHelper from '../helpers/query-helper';
import { PaginationDTO } from '../dtos/paginate.dto';

@Injectable()
export abstract class BaseCRUDService<T extends ObjectLiteral> {
  constructor(public model: Repository<any>) {}

  public async create(dto: Partial<T>): Promise<T> {
    return this.model.save(dto);
  }

  public async findOneOrCreate(
    filter: FindOptionsWhere<Partial<T>>,
    dto: Partial<T>,
  ): Promise<T> {
    const found = await this.findOne(filter);

    if (found) return found;

    return this.create(dto);
  }

  public async createWithOpts(dto: Partial<T>, opts: RunnerUser): Promise<T> {
    const queryBuilder = this.model.createQueryBuilder(opts.alias, opts.runner);

    const insertResult = await queryBuilder
      .insert()
      .into(this.model.target)
      .values(dto)
      .execute();

    return Array.isArray(insertResult.raw) && insertResult.raw.length === 1
      ? insertResult.raw[0]
      : insertResult.raw;
  }

  public async updateByIdWithOpts(
    id: number | string,
    dto: Partial<T>,
    opts: RunnerUser,
  ) {
    const queryBuilder = this.model.createQueryBuilder(opts.alias, opts.runner);

    await queryBuilder.update().set(dto).whereInIds(id).execute();

    return this.findByID(id);
  }

  public async deleteByIdWithOpts(
    id: number | string,
    opts: RunnerUser & { isSoft?: boolean },
  ) {
    const queryBuilder = this.model.createQueryBuilder(opts.alias, opts.runner);

    const deleteSmt = opts.isSoft
      ? queryBuilder.softDelete()
      : queryBuilder.delete();

    await deleteSmt.whereInIds(id).execute();
  }

  public findByID(id: number | string): Promise<T> {
    return this.model.findOneBy({ id, deletedAt: IsNull() });
  }

  public findByIdWithOpts(id: number | string, opts: RunnerUser): Promise<T> {
    const queryBuilder = this.model.createQueryBuilder(opts.alias, opts.runner);

    return queryBuilder.where({ id }).getOne();
  }

  public count(
    filter: Partial<T>,
    options: { withDeleted?: boolean } = { withDeleted: false },
  ): Promise<number> {
    return this.model.count({
      withDeleted: options.withDeleted,
      where: filter,
    });
  }

  public delete(filter: any): Promise<DeleteResult> {
    return this.model.softDelete(filter);
  }

  public findOne(
    filter: any,
    options: {
      select?: FindOptionsSelect<any>;
      relations?: FindOptionsRelations<any>;
      withDeleted?: boolean;
    } = { withDeleted: false },
  ): Promise<T> {
    return this.model.findOne({
      where: filter,
      withDeleted: options.withDeleted,
      select: options.select,
      relations: options.relations,
    });
  }

  public async deleteByID(entityID: number): Promise<void> {
    await this.model.softDelete({ id: entityID });
  }

  public async findAll(
    filter?: FindOptionsWhere<Partial<T>>,
    options: {
      select?: FindOptionsSelect<any>;
      relations?: FindOptionsRelations<any>;
      sort?: string;
      withDeleted?: boolean;
    } = { withDeleted: false },
  ): Promise<T[]> {
    const parsedSort = queryHelper.parseSort(options.sort);

    const data = await this.model.find({
      order: parsedSort,
      select: options.select,
      relations: options.relations,
      withDeleted: options.withDeleted,
      where: filter,
    });

    return data;
  }

  protected parsePageSize(pageSize: number) {
    return pageSize || 10;
  }

  protected parsePageNumber(pageNumber: number) {
    return pageNumber || 0;
  }

  public async paginate(
    dto: PaginationDTO,
    filter?: FindOptionsWhere<any>,
    options: {
      select?: FindOptionsSelect<any>;
      relations?: FindOptionsRelations<any>;
      withDeleted?: boolean;
    } = { withDeleted: false },
  ): Promise<PaginationResult<T>> {
    const pageSize = this.parsePageSize(dto.pageSize);
    const pageNumber = this.parsePageNumber(dto.pageNumber);

    const totalCount = await this.model.count({
      withDeleted: options.withDeleted,
      where: filter,
    });

    if (totalCount === 0) {
      return {
        rows: [],
        total: 0,
        pageSize,
        pageNumber,
      };
    }

    const parsedSort = queryHelper.parseSort(dto.sort);

    const data = await this.model.find({
      take: pageSize,
      skip: pageSize * (pageNumber - 1),
      order: parsedSort,
      select: options.select,
      relations: options.relations,
      withDeleted: options.withDeleted,
      where: filter,
    });

    return {
      rows: data,
      total: totalCount,
      pageSize,
      pageNumber,
    };
  }

  public async updateByID(id: number | string, dto: Partial<T>): Promise<T> {
    if (!id) {
      throw new InternalServerErrorException('missing id for update');
    }

    await this.model.update({ id, deletedAt: IsNull() }, dto);

    return this.findByID(id);
  }

  public async bulkCreate(dto: Partial<T>[]): Promise<T[]> {
    const insertResult = await this.model.insert(dto);

    const insertedRows = insertResult.identifiers;

    return Promise.all(insertedRows.map((item) => this.findByID(item.id)));
  }

  public async updateOneWithOpts(
    filter: Record<string, any>,
    dto: Partial<T>,
    opts: RunnerUser,
  ) {
    const queryBuilder = this.model.createQueryBuilder(opts.alias, opts.runner);

    await queryBuilder.update().set(dto).where(filter).execute();

    return this.findOne(filter);
  }

  public async updateOne(
    filter: Record<string, any>,
    dto: Partial<T>,
  ): Promise<T> {
    if (!filter) {
      throw new InternalServerErrorException('missing filter for update');
    }

    await this.model.update({ ...filter, deletedAt: IsNull() }, dto);

    return this.findOne(filter);
  }
}
