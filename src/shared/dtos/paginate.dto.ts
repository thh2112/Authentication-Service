import { IsNumber, IsOptional, Max, MaxLength, Min } from 'class-validator';

export abstract class BaseDTO {
  public get filter(): Record<any, any> {
    this.parseFilters();

    return this._filter;
  }

  protected _filter: Record<any, any> = {};

  protected parseFilters(): void {
    return;
  }

  public addFilter(data: Record<any, any>): void {
    Object.assign(this._filter, data);
  }
}

export class PaginationDTO extends BaseDTO {
  @Min(0)
  @IsNumber()
  @IsOptional()
  pageNumber: number;

  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  pageSize: number;

  @MaxLength(60)
  @IsOptional()
  sort: string;
}
