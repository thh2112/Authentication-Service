import { SET_CACHE_POLICY } from '../constant';

export interface SetCacheOption {
  policy: SET_CACHE_POLICY;
  value?: any;
}

export interface CacheService {
  get(key: string): Promise<any>;
  set(key: string, value: any, option?: SetCacheOption): Promise<any>;
  del(...keys: string[]): Promise<void>;
  incrBy(key: string, value?: number): Promise<any>;
  incrByFloat(key: string, value: number): Promise<any>;
  decrBy(key: string, value?: number): Promise<any>;
}

export interface HashCacheService {
  hset(key: string, field: string, value: any): Promise<void>;
  hget(key: string, field: string): Promise<string>;
  hlen(key: string): Promise<number>;
}

export interface ListCacheService {
  lpush(key: string, value: any): Promise<void>;
  lset(key: string, index: number, value: any): Promise<void>;
  rpush(key: string, value: any): Promise<void>;
  lrange(key: string, start: number, end: number): Promise<string[]>;
  lindex(key: string, index: number): Promise<string>;
  llen(key: string): Promise<number>;
}

export interface CacheScriptEvaluator {
  eval(script: string, numberOfKeys: number, ...args: any[]): Promise<any>;
}
