import { QueryRunner } from 'typeorm';

export interface RunnerUser {
  alias: string;
  runner: QueryRunner;
}

export interface PaginationResult<T> {
  rows: T[];
  total: number;
  pageNumber: number;
  pageSize: number;
}

export interface HttpResponse<T = any> {
  success?: boolean;
  code?: string;
  httpCode?: number;
  message?: string;
  data?: T;
}
