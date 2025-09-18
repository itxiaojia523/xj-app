// src/api/user.ts
import api from './index';

export function getUserProfile() {
  return api.get('/user/profile');
}

export function updateUserProfile(data: { name: string; avatar: string }) {
  return api.put('/user/profile', data);
}
