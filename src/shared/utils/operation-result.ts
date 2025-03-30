import { HttpStatus } from '@nestjs/common';
import { ERR_CODE } from '../constant';
import { OperationResult } from '../type';

export const generateNotFoundResult = (
  message: string,
  code = ERR_CODE.NOT_FOUND,
): OperationResult => ({
  success: false,
  message,
  code,
  httpCode: HttpStatus.NOT_FOUND,
});

export const generateInternalServerResult = (
  message?: string,
): OperationResult => ({
  success: false,
  message: message || 'internal server error',
  code: ERR_CODE.INTERNAL_SERVER_ERROR,
  httpCode: HttpStatus.INTERNAL_SERVER_ERROR,
});

export const generateBadRequestResult = (
  message: string,
  data?: any,
  code?: string,
): OperationResult => ({
  success: false,
  message,
  data,
  code: code || ERR_CODE.BAD_REQUEST,
  httpCode: HttpStatus.BAD_REQUEST,
});

export const generateConflictResult = (
  message: string,
  code = ERR_CODE.ALREADY_EXISTS,
): OperationResult => ({
  success: false,
  message,
  code,
  httpCode: HttpStatus.CONFLICT,
});

export const generateUnprocessableEntityResult = (
  message: string,
  code = ERR_CODE.UNPROCESSABLE_ENTITY,
): OperationResult => ({
  success: false,
  message,
  code,
  httpCode: HttpStatus.UNPROCESSABLE_ENTITY,
});

export const generateUnauthorizedResult = (
  message: string,
  code = ERR_CODE.UNAUTHORIZED,
): OperationResult => ({
  success: false,
  message,
  code,
  httpCode: HttpStatus.UNAUTHORIZED,
});

export const generateEmptyPaginateResult = (): OperationResult => ({
  success: true,
  data: {
    rows: [],
    total: 0,
  },
});
