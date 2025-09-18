// src/api/auth.ts
import { AuthCredentials } from '../type';
import api from './index';

// 登录
export function login(data: AuthCredentials) {
  return api.post('/auth/login', data);
}

// 注册
export function register(data: AuthCredentials) {
  return api.post('/auth/register', data);
}

// 登出
export function logout() {
  return api.post('/auth/logout');
}
