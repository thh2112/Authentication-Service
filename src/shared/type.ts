import { QueryRunner } from 'typeorm';
import { USER_STATUS } from './constant';

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

export interface OperationResult<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
  httpCode?: number;
  metadata?: any;
  action?: string;
}

export interface UserAuthInfo {
  id: string;
  email: string;
  username: string;
  roleId: string;
  status: USER_STATUS;
  phoneNumber: string;
}

export type AuthenticatedUser = UserAuthInfo & {
  jit: string;
  iat: number;
};
