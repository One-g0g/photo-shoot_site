import type { User } from '../users/user.entity';
import type { PublicUser } from './auth.types';

export function toPublicUser(user: User): PublicUser {
  const payload: PublicUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  if (user.avatar) {
    payload.avatar = user.avatar;
  }

  if (user.profileBanner) {
    payload.profileBanner = user.profileBanner;
  }

  if (user.vkUrl) {
    payload.vkUrl = user.vkUrl;
  }

  if (user.telegramUrl) {
    payload.telegramUrl = user.telegramUrl;
  }

  if (user.contactEmail) {
    payload.contactEmail = user.contactEmail;
  }

  if (user.city) {
    payload.city = user.city;
  }

  return payload;
}
